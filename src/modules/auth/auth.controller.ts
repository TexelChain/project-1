import { FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import { app } from '../../app';

//Services
import { findUserByEmail } from '../user/user.service';
import { findAdminByEmail } from '../admin/admin.service';

//Schemas, templates
import {
  ChangePasswordInput,
  LoginUserInput,
  PasswordResetEmailInput,
  ResetPasswordInput,
  VerifyPasswordResetInput,
} from './auth.schema';
import forgotPassword from '../../emails/forgotPassword';

//Utils, Configs
import { sendResponse } from '../../utils/response.utils';
import { customAlphabet } from 'nanoid';
import { sendEmail } from '../../libs/mailer';
import { SMTP_FROM_EMAIL } from '../../config';

//Email Templates
import login from '../../emails/login';

//Fetch user location
export const getLoginDetails = async (request: FastifyRequest) => {
  const ip =
    request.headers['x-forwarded-for']?.toString().split(',')[0] ||
    request.ip ||
    'Unknown IP';

  const userAgent = request.headers['user-agent'] || 'Unknown';

  let locationInfo = {
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
  };

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = (await res.json()) as IPInfo;

    if (!data.error && data.country_name) {
      locationInfo = {
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country_name || 'Unknown',
      };
    }
  } catch (err) {
    request.log.error('Error fetching IP details:', err);
  }

  return {
    ip,
    userAgent,
    location: locationInfo,
    date: new Date().toLocaleString(),
  };
};

//Authenticate a user
export const loginHandler = async (
  request: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;

  //Fetch user by email
  const user = await findUserByEmail(email);
  if (!user)
    return sendResponse(reply, 400, false, 'Incorrect Email or Password');

  //Compare password
  const isCorrect = await user.comparePassword(password);
  if (isCorrect) {
    const plainUser = user.toObject() as User;
    const loginDetails = await getLoginDetails(request);

    const loginTemplate = login({
      name: user.userName,
      ip: loginDetails.ip,
      userAgent: loginDetails.userAgent,
      location: loginDetails.location,
      date: loginDetails.date,
    }).html;

    await sendEmail({
      from: SMTP_FROM_EMAIL,
      to: user.email,
      subject: 'New Login to Your Texel Chain Account',
      html: loginTemplate,
    });

    const redirect = !user.isVerified
      ? 'verification'
      : !user.kyc || user.kyc.status === 'rejected'
        ? 'kyc'
        : 'user/dashboard';

    return sendResponse(reply, 200, true, 'Authenticated successfully', {
      accessToken: app.jwt.sign(plainUser),
      redirect,
    });
  }

  return sendResponse(reply, 400, false, 'Incorrect Email or Password');
};

//Send password reset otp
export const sendPasswordReset = async (
  request: FastifyRequest<{ Body: PasswordResetEmailInput }>,
  reply: FastifyReply
) => {
  const { email } = request.body;

  //Fetch user by email, throw an error if it doesn't exist, or if the user hasn't verified their account
  const user = await findUserByEmail(email);
  if (!user)
    return sendResponse(reply, 400, false, 'Incorrect Email or Password');
  if (!user.isVerified)
    return sendResponse(
      reply,
      403,
      false,
      'Please verify your account before proceeding.'
    );

  // Generate 4 Random Digits and Save
  const randomSixNumbers = customAlphabet('0123456789', 6)();

  //Save the number to the database
  user.passwordResetCode = randomSixNumbers;
  await user.save();

  //Send email to the email address with the 4 Digit
  const emailContent = forgotPassword({
    name: user.userName,
    verificationCode: randomSixNumbers,
  });
  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: user.email,
    subject: 'Reset Password Verification',
    html: emailContent.html,
  });

  return sendResponse(
    reply,
    200,
    true,
    'A verification code will be sent if the email address is registered.'
  );
};

// Verify password reset otp
export const verifyPasswordResetHandler = async (
  request: FastifyRequest<{ Body: VerifyPasswordResetInput }>,
  reply: FastifyReply
) => {
  const { email, otp } = request.body;

  //Fetch user and throw an error if user doesn't exist or entered a wrong OTP
  const user = await findUserByEmail(email);
  if (!user) return sendResponse(reply, 400, false, 'User does not exist');
  if (user.passwordResetCode !== otp)
    return sendResponse(reply, 400, false, 'Incorrect OTP');

  //Make the user password field null again
  user.passwordResetCode = '';
  await user.save();

  return sendResponse(reply, 200, true, 'Email was verified successfully.');
};

//Create new password
export const passwordResetHandler = async (
  request: FastifyRequest<{ Body: ResetPasswordInput }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;
  const user = await findUserByEmail(email);

  if (!user) return sendResponse(reply, 400, false, 'User does not exist');

  //Save users new password
  user.password = password;
  await user.save();

  return sendResponse(
    reply,
    200,
    true,
    'Your password was updated successfully.'
  );
};

//Change password while being authenticated
export const changePasswordHandler = async (
  request: FastifyRequest<{ Body: ChangePasswordInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userEmail = decodedDetails.email;

  const { currentPassword, newPassword } = request.body;

  //Make sure the new password isn't the old one
  if (currentPassword === newPassword)
    return sendResponse(
      reply,
      409,
      false,
      'Your new password must differ from your old one.'
    );

  //Fetch user
  const user = await findUserByEmail(userEmail);
  if (!user)
    return sendResponse(
      reply,
      400,
      false,
      'Something went wrong, please try again later.'
    );

  //Compare users password and return response if it doesn't match
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendResponse(reply, 403, false, 'Wrong Password.');

  //Update password
  user.password = newPassword;
  await user.save();

  return sendResponse(
    reply,
    200,
    true,
    'Your password was updated successfully.'
  );
};

// Administrative Endpoint
// Authenticate Admin
export const adminLoginHandler = async (
  request: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;

  //Fetch user by email
  const admin = await findAdminByEmail(email);
  if (!admin)
    return sendResponse(reply, 400, false, 'Incorrect Email or Password');

  //Compare password
  const isCorrect = await admin.comparePassword(password);
  if (isCorrect) {
    const plainAdmin = admin.toObject() as Admin;
    return sendResponse(reply, 200, true, 'Authenticated successfully', {
      accessToken: app.jwt.sign(plainAdmin),
    });
  }

  return sendResponse(reply, 400, false, 'Incorrect Email or Password');
};
