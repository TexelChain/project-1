import mongoose, { Schema, Document, model } from 'mongoose';

export enum CardRequestStatus {
  PENDING = 'pending',
  DECLINED = 'declined',
  SUCCESSFUL = 'successful',
}

export interface CardRequestDocument extends Document {
  user: mongoose.Types.ObjectId;
  status: CardRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const cardRequestSchema = new Schema<CardRequestDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CardRequestStatus),
      default: CardRequestStatus.PENDING,
    },
  },
  { timestamps: true }
);

export const CardRequestModel = model<CardRequestDocument>(
  'CardRequest',
  cardRequestSchema
);
