import mongoose, { Document, model, Schema } from 'mongoose';

export enum TransactionType {
  SENT = 'sent',
  RECEIVED = 'received',
}

export enum TransactionStatus {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum TransactionCoin {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  BINANCE_COIN = 'binance coin',
  TRON = 'tron',
  USDT_TRC = 'usdt trc(20)',
  USDT_ERC = 'usdt erc(20)',
  CARDANO = 'cardano',
  SOLANA = 'solana',
  LITE_COIN = 'lite coin',
  DOGE = 'doge',
  TEXEL = 'texel',
  DASH = 'dash',
  BITCOIN_CASH = 'bitcoin cash',
  TRUMP_COIN = 'official trump',
}

export type TransactionDocument = Document & {
  user: mongoose.Types.ObjectId;
  coin: TransactionCoin;
  transactionType: TransactionType;
  amount: number;
  network: string | null;
  walletAddress: string;
  transactionHash: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema: Schema = new Schema<TransactionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coin: {
      type: String,
      enum: Object.values(TransactionCoin),
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: { type: Number, required: true },
    network: { type: String, default: null },
    walletAddress: { type: String },
    transactionHash: { type: String },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModel = model<TransactionDocument>(
  'Transaction',
  transactionSchema
);
export default TransactionModel;
