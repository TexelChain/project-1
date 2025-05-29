import mongoose, { Schema, model, Document } from 'mongoose';

export type UtilityDocument = Document & {
  cardPrice: number;
  minimumAmount: number;
};

const utilitySchema = new Schema<UtilityDocument>({
  cardPrice: { type: Number, default: 1600 },
  minimumAmount: { type: Number, default: 100000 },
});

const UtilityModel = model<UtilityDocument>('Utility', utilitySchema);
export default UtilityModel;
