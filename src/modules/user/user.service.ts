import UserModel, { UserDocument } from './user.model';
import { FilterQuery } from 'mongoose';

//Schemas
import { EditUserInput } from './user.schema';

//Utils
import { omit } from '../../utils/format';
import { decrypt, encrypt } from '../../utils/encrypt';

//Create a user
export const createUser = async (input: newUser) => {
  const user = await UserModel.create(input);
  return omit(user.toJSON(), ['password']);
};

//Find user by ID
export const findUserById = async (id: string) => {
  const user = await UserModel.findById(id).lean();

  if (!user) return null;

  return {
    ...user,
    encryptedPassword: decrypt(user.encryptedPassword),
  };
};

//Find user by Email
export const findUserByEmail = async (email: string) => {
  const user = await UserModel.findOne({ email });
  return user;
};

//Find a User using any criteria
export const findUser = async (query: FilterQuery<UserDocument>) => {
  return await UserModel.findOne(query).lean();
};

//Fetch all users
export const fetchUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    UserModel.countDocuments(),
  ]);

  return {
    data: users.map((user) => ({
      ...user,
      encryptedPassword: decrypt(user.encryptedPassword),
    })),
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

//Find user by name or accountId
export const fetchUser = async (value: string) => {
  const user = await UserModel.findOne({
    $or: [{ userName: value }, { accountId: value }, { email: value }],
  }).lean();

  if (!user) return null;

  return {
    ...user,
    encryptedPassword: decrypt(user.encryptedPassword),
  };
};

//Update User Details
export const updateUser = async (input: EditUserInput) => {
  const { email, password, ...rest } = input;

  // Prepare update object
  const updateFields: Partial<typeof input> = { ...rest };

  // If password is provided, encryptedPassword
  if (password) {
    const hashedPassword = encrypt(password);
    updateFields.encryptedPassword = hashedPassword;
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { email },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

//Update User Location
export const updateUserLocation = async (
  userId: string,
  longitude: number,
  latitude: number
) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

//Update User Session
export const updateUserSession = async (userId: string) => {
  const now = new Date();

  return await UserModel.findByIdAndUpdate(
    userId,
    {
      lastSession: now,
    },
    { new: true }
  );
};
