import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Utils and configs
import { customAlphabet } from 'nanoid';

// Generate a verification code, and unique accountId with nanoid
const generateVerificationCode = customAlphabet('0123456789', 6);
const generateaccountId = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  10
);

export type UserDocument = Document & {
  email: string;
  password: string;
  userName: string;
  accountId: string;
  phoneNumber: string;
  country: string;
  address: string;
  passPhrase: string[];
  kyc: {
    frontImage: string;
    backImage: string;
    idType: string;
    status: 'pending' | 'accepted' | 'rejected';
    lastSubmissionDate: Date;
  };
  profilePicture: string;
  gender: 'male' | 'female' | 'prefer not to say';
  verificationCode: string;
  verificationCodeExpiry: Date;
  passwordResetCode: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  suspendedDate: Date | null;
  encryptedPassword: string;
  depositMessage: string;
  minimumTransfer: number | null;
  transactionPin: string | null;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  generatedDetails: {
    generatedCountry: string;
    generatedState: string;
    generatedAddress: string;
  };
  lastSession: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isStillSuspended(): boolean;
  generateNewVerificationCode(): Promise<string>;
};

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    accountId: { type: String, unique: true },
    phoneNumber: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String },
    passPhrase: {
      type: [String],
      required: true,
      validate: [arrayLimit, 'Passphrase must contain exactly 12 words'],
    },
    kyc: {
      type: new Schema({
        images: { type: [String], default: [] },
        idType: { type: String },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        lastSubmissionDate: { type: Date },
      }),
      default: () => ({}),
    },
    profilePicture: { type: String },
    gender: { type: String },
    verificationCode: {
      type: String,
      required: true,
      default: () => generateVerificationCode(),
    },
    verificationCodeExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
    passwordResetCode: { type: String },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspendedDate: { type: Date, default: null },
    encryptedPassword: { type: String, required: true },
    depositMessage: { type: String },
    minimumTransfer: { type: Number, default: null },
    transactionPin: { type: String, default: null },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    generatedDetails: {
      generatedCountry: { type: String },
      generatedState: { type: String },
      generatedAddress: { type: String },
    },
    lastSession: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Pre-save hooks, methods and validation functions

function arrayLimit(val: string[]): boolean {
  return val.length === 12;
}

// Generate unique accountId before creation
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.accountId) {
    let isUnique = false;
    while (!isUnique) {
      const newaccountId = 'TX' + generateaccountId();
      const existingUser = await UserModel.findOne({ accountId: newaccountId });
      if (!existingUser) {
        this.accountId = newaccountId;
        isUnique = true;
      }
    }
  }
  next();
});

// Hashing of Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

//Adding Suspended Date
userSchema.pre('save', async function (next) {
  if (!this.isModified('isSuspended')) {
    return next();
  }

  const suspendedDate = new Date();
  this.suspendedDate = suspendedDate;
  next();
});

// Methods
// Comparing passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password).catch(() => false);
};

// Generating new verification code
userSchema.methods.generateNewVerificationCode =
  async function (): Promise<string> {
    this.verificationCode = generateVerificationCode();
    this.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.save();
    return this.verificationCode;
  };

userSchema.index({ location: '2dsphere' });

const UserModel = model<UserDocument>('User', userSchema);
export default UserModel;
