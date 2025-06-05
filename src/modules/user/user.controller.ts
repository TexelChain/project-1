import { FastifyRequest, FastifyReply } from 'fastify';
import { app } from '../../app';
import path from 'path';
import { randomUUID } from 'crypto';

//Services
import {
  createUser,
  fetchUser,
  findUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserLocation,
} from './user.service';
import { findAdminById } from '../admin/admin.service';

//Schemas, Configs, Emails
import {
  CreateUserInput,
  EditUserInput,
  emailValidationSchema,
  FetchUserInput,
  UpdateLocationInput,
  VerifyUserInput,
} from './user.schema';
import { FILE_SIZE, SMTP_FROM_EMAIL } from '../../config';
import welcome from '../../emails/welcome';
import verificationEmail from '../../emails/verificationEmail';

//Utils
import { sendResponse } from '../../utils/response.utils';
import { sendEmail } from '../../libs/mailer';
import { encrypt } from '../../utils/encrypt';
import { generatePassphrase } from '../../utils/generate';
import { deleteFileFromS3, uploadFileToS3 } from '../../libs/upload';
import { emitAndSaveNotification } from '../../utils/socket';

//Constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];
const MAX_FILE_SIZE_BYTES = FILE_SIZE * 1024 * 1024;

//Create new user
export const createUserHandler = async (
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) => {
  // Validate the email
  const validationResult = emailValidationSchema.safeParse(request.body.email);
  if (!validationResult.success) {
    return sendResponse(
      reply,
      403,
      false,
      "It looks like emails from that domain aren't accepted. Please use a different email address."
    );
  }

  //Check if user exists
  const existingUser = await findUserByEmail(request.body.email);
  if (existingUser)
    return sendResponse(
      reply,
      409,
      false,
      'An account with this email address already exists. Please log in or use a different email address to create a new account.'
    );

  const existingUserName = await findUser({
    userName: request.body.userName,
  });
  if (existingUserName)
    return sendResponse(
      reply,
      409,
      false,
      'An account with this username already exists, kindly use a different username.'
    );

  //Encrypt Password and generate passPhrase
  const encryptedPassword = encrypt(request.body.password);
  const passPhrase = generatePassphrase();

  //Create user
  const newUser = await createUser({
    ...request.body,
    encryptedPassword,
    passPhrase,
  });

  const plainUser = newUser as unknown as User;
  const accessToken = app.jwt.sign(plainUser);

  //Generate Email templates and send Emails
  const welcomeEmailContent = welcome({ name: newUser.userName });
  const emailContent = verificationEmail({
    name: newUser.userName,
    verificationCode: newUser.verificationCode,
  });
  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: newUser.email,
    subject: 'Welcome to Texel Chain',
    html: welcomeEmailContent.html,
  });
  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: newUser.email,
    subject: 'Email Verification',
    html: emailContent.html,
  });

  return sendResponse(reply, 201, true, 'Welcome! Your account is ready.', {
    newUser,
    accessToken,
  });
};

//Verify User Handler
export const verifyUserHandler = async (
  request: FastifyRequest<{ Body: VerifyUserInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const verificationCode = request.body.verificationCode;

  //Find the userId and throw an error if there is no user
  const user = await findUserByEmail(decodedDetails.email);
  if (!user)
    return sendResponse(
      reply,
      400,
      false,
      'The specified user account does not exist.'
    );

  //Check if the user is already verified
  if (user.isVerified)
    return sendResponse(reply, 409, false, 'Your Email is already verified');

  // Check if the code is still valid, and send a new one if it is not
  const now = new Date();
  if (user.verificationCodeExpiry < now) {
    const newCode = await user.generateNewVerificationCode();
    const emailContent = verificationEmail({
      name: user.userName,
      verificationCode: newCode,
    });
    await sendEmail({
      from: SMTP_FROM_EMAIL,
      to: user.email,
      subject: 'Email Verification',
      html: emailContent.html,
    });
    return sendResponse(
      reply,
      400,
      false,
      'Your verification code has expired. A new code has been sent to your email'
    );
  }

  //Throw an error if verification code doesn't match
  if (user.verificationCode !== verificationCode) {
    return sendResponse(
      reply,
      400,
      false,
      'Invalid Verification Code, kindly try again later.'
    );
  }

  user.isVerified = true;
  await user.save();

  return sendResponse(
    reply,
    200,
    true,
    'Your email was verified successfully.'
  );
};

//Resend Email Verification
export const resendVerification = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;

  //Find the userId and throw an error if there is no user
  const user = await findUserByEmail(decodedDetails.email);
  if (!user)
    return sendResponse(
      reply,
      400,
      false,
      'The specified user account does not exist.'
    );

  //Check if the user is already verified
  if (user.isVerified)
    return sendResponse(reply, 409, false, 'Your Account is already verified');

  // Generate a new code and send
  const newCode = await user.generateNewVerificationCode();
  const emailContent = verificationEmail({
    name: user.userName,
    verificationCode: newCode,
  });
  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: user.email,
    subject: 'Email Verification',
    html: emailContent.html,
  });
  return sendResponse(
    reply,
    200,
    true,
    'A new verification code has been sent to your email'
  );
};

//Handler a user KYC
export const kycUploadHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const parts = request.parts();

  const imageUrls: string[] = [];
  let gender: 'male' | 'female' | 'prefer not to say' | undefined;
  let idType: string | undefined;

  for await (const part of parts) {
    if (part.type === 'file') {
      if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
        return sendResponse(
          reply,
          415,
          false,
          'Only JPG, PNG, and WEBP images are allowed.'
        );
      }

      const buffer = await part.toBuffer();
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return sendResponse(
          reply,
          413,
          false,
          `Each file must be under ${FILE_SIZE}MB.`
        );
      }

      const ext = path.extname(part.filename || '');
      const filename = `kyc/${randomUUID()}${ext}`;
      const imageUrl = await uploadFileToS3(filename, buffer, part.mimetype);
      imageUrls.push(imageUrl);
    } else if (
      typeof part.value === 'string' &&
      (part.value === 'male' ||
        part.value === 'female' ||
        part.value === 'prefer not to say')
    ) {
      gender = part.value;
    } else if (part.type === 'field' && part.fieldname === 'idType') {
      if (typeof part.value === 'string') {
        idType = part.value;
      }
    }
  }

  if (!idType) {
    return sendResponse(reply, 400, false, 'Your ID Type is required.');
  }

  //Edit user details
  const updatedUser = await updateUser({
    email: decodedDetails.email,
    gender,
    kyc: { images: imageUrls, idType, lastSubmissionDate: new Date() },
  });

  if (!updatedUser)
    return sendResponse(
      reply,
      403,
      false,
      'User details was not updated. The user profile could not be accessed.'
    );
  await emitAndSaveNotification({
    user: decodedDetails._id,
    type: 'system',
    title: `Your KYC Submission is Under Review!`,
    message: `Thanks for submitting your Know Your Customer (KYC) documents. We've received your information and it's currently being reviewed.`,
  });
  return sendResponse(
    reply,
    200,
    true,
    'KYC submitted. Results pending; you will be updated soon.',
    updatedUser
  );
};

//Update Profile Picture
export const updateProfilePictureHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const parts = request.parts();

  const userDetails = await findUserById(decodedDetails._id);
  if (!userDetails)
    return sendResponse(
      reply,
      400,
      false,
      "Couldn't find your profile, kindly try again later"
    );

  //Delete Previous Profile Picture
  if (userDetails.profilePicture) {
    const deleted = await deleteFileFromS3(userDetails.profilePicture);
    if (!deleted) {
      return sendResponse(
        reply,
        500,
        false,
        'Something went wrong, kindly try again later.'
      );
    }
  }

  const imageUrls: string[] = [];

  for await (const part of parts) {
    if (part.type === 'file') {
      if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
        return sendResponse(
          reply,
          415,
          false,
          'Only JPG, PNG, and WEBP images are allowed.'
        );
      }

      const buffer = await part.toBuffer();
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return sendResponse(
          reply,
          413,
          false,
          `Each file must be under ${FILE_SIZE}MB.`
        );
      }

      const ext = path.extname(part.filename || '');
      const filename = `kyc/${randomUUID()}${ext}`;
      const imageUrl = await uploadFileToS3(filename, buffer, part.mimetype);
      imageUrls.push(imageUrl);
    }
  }

  //Edit user details
  if (imageUrls.length === 0) {
    return sendResponse(reply, 400, false, 'No valid image uploaded.');
  }

  const updatedUser = await updateUser({
    email: userDetails.email,
    profilePicture: imageUrls[0],
  });

  if (!updatedUser)
    return sendResponse(
      reply,
      403,
      false,
      'User details was not updated. The user profile could not be accessed.'
    );

  return sendResponse(
    reply,
    200,
    true,
    'Your new Profile picture was updated successfully.',
    updatedUser
  );
};

//Update User Details Handler
export const updateUserHandler = async (
  request: FastifyRequest<{ Body: EditUserInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  if (decodedDetails.email !== request.body.email)
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized to perform this action'
    );

  //Update user details and send a notification
  const updatedUser = await updateUser(request.body);
  await emitAndSaveNotification({
    user: userId,
    type: 'alert',
    title: request.body.transactionPin
      ? 'Transaction Pin Update'
      : 'Profile Update',
    message: request.body.transactionPin
      ? "Your transaction pin was changed, kindly contact the management if you didn't perform this action."
      : 'Your profile was updated successfully!, kindly verify your new details.',
  });

  //Return
  return sendResponse(
    reply,
    200,
    true,
    'User details was updated successfully',
    updatedUser
  );
};

//Get Current User Handler
export const fetchCurrentUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;

  //Fetch user details
  const user = await findUserById(decodedDetails._id);
  if (!user)
    return sendResponse(
      reply,
      404,
      false,
      "Couldn't fetch user details, kindly try again later."
    );

  return sendResponse(
    reply,
    200,
    true,
    'Your user details was fetched successfully',
    user
  );
};

//Update user location
export const updateLocationHandler = async (
  request: FastifyRequest<{ Body: UpdateLocationInput }>,
  reply: FastifyReply
) => {
  const { longitude, latitude } = request.body;
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure user exits
  const user = await findUserById(userId);
  if (!user)
    return sendResponse(
      reply,
      404,
      false,
      "Couldn't fetch user details, kindly try again later."
    );

  const updatedUser = await updateUserLocation(userId, longitude, latitude);
  return sendResponse(
    reply,
    200,
    true,
    'Your location was updated successfully.',
    updatedUser
  );
};

//Admin Endpoints

//Edit any user details
export const editUserHandler = async (
  request: FastifyRequest<{ Body: EditUserInput }>,
  reply: FastifyReply
) => {
  const decodedAdmin = request.admin!;

  //Fetch admin and make sure he is a super admin
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      400,
      false,
      'Sorry, but you are not authorized to perform this action'
    );
  if (admin.role !== 'super_admin')
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized enough to perform this action'
    );

  const user = await findUserByEmail(request.body.email);
  if (!user)
    return sendResponse(
      reply,
      404,
      false,
      'The specified user account does not exist.'
    );

  const updatedUser = await updateUser(request.body);

  //Return
  return sendResponse(
    reply,
    200,
    true,
    'User details was updated successfully',
    updatedUser
  );
};

//Fetch User Using Their AccountID or Emails
export const fetchUserHandler = async (
  request: FastifyRequest<{ Params: FetchUserInput }>,
  reply: FastifyReply
) => {
  const value = request.params.value;
  const decodedAdmin = request.admin!;

  //Fetch admin and make sure he is a super admin
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      400,
      false,
      'Sorry, but you are not authorized to perform this action'
    );
  if (admin.role !== 'super_admin')
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized enough to perform this action'
    );

  const fetchedUser = await fetchUser(value);
  if (!fetchedUser)
    return sendResponse(
      reply,
      404,
      false,
      'Sorry, no user matched the entered credentials'
    );

  return sendResponse(
    reply,
    200,
    true,
    'User was fetched successfully',
    fetchedUser
  );
};
