import mongoose, { Document, model, Schema } from 'mongoose';

export type WalletConnectDocument = Document & {
  user: mongoose.Types.ObjectId;
  wallet: string;
  passPhrase: string[];
  createdAt: Date;
  updatedAt: Date;
};

const connectWalletSchema: Schema = new Schema<WalletConnectDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wallet: { type: String, required: true },
    passPhrase: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WalletConnectModel = model<WalletConnectDocument>(
  'WalletConnect',
  connectWalletSchema
);
export default WalletConnectModel;
