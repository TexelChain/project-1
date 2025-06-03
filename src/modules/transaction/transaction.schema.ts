import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import {
  TransactionType,
  TransactionStatus,
  TransactionCoin,
} from './transaction.model';

//General Schema
import { responseCore } from '../general/general.schema';

const transactionCore = z.object({
  coin: z.nativeEnum(TransactionCoin, {
    required_error: 'Coin is required',
  }),
  transactionType: z.nativeEnum(TransactionType, {
    required_error: 'Transaction type is required',
  }),
  amount: z.number({
    required_error: 'Amount is required',
  }),
  network: z.string().optional(),
  walletAddress: z.string({
    required_error: 'Wallet is required',
  }),
});

const transactionWithMeta = transactionCore.extend({
  user: z.string(),
  _id: z.string(),
  transactionHash: z.string().optional(),
  status: z.string(),
  createdAt: z.string().datetime(),
});

const createTransactionSchema = transactionCore;

const createUserTransactionSchema = createTransactionSchema.extend({
  user: z.string({
    required_error: 'User is required',
  }),
  status: z.nativeEnum(TransactionStatus, {
    required_error: 'Status is required',
  }),
});

const fetchTransactionsSchema = z.object({
  coin: z.nativeEnum(TransactionCoin, {
    required_error: 'Coin is required',
  }),
});

const fetchTransactionSchema = z.object({
  transactionId: z.string({
    required_error: 'TransactionID is required',
  }),
});

const fetchUserTransactionsSchema = z.object({
  userId: z.string({
    required_error: 'UserID is required',
  }),
});

const getCoinDetailsSchema = z.object({
  coin: z.string({
    required_error: 'Coin is Required',
  }),
});

const createTransactionResponseSchema = z.object({
  ...responseCore,
  data: transactionWithMeta,
});

const getTransactionsResponseSchema = z.object({
  ...responseCore,
  data: z.array(transactionWithMeta),
});

const getTransactionResponseSchema = z.object({
  ...responseCore,
  data: transactionWithMeta,
});

const getBalanceResponseSchema = z.object({
  ...responseCore,
  data: z.record(z.nativeEnum(TransactionCoin), z.number()),
});

// Administrative Endpoints
const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus, {
    required_error: 'Status is required',
  }),
  transactionId: z.string({
    required_error: 'TransactionID is required',
  }),
});

const getTransactionsWithTypeSchema = z.object({
  transactionType: z.nativeEnum(TransactionType).optional(),
});

const getUserTransactionsSchema = z.object({
  userId: z.string({
    required_error: 'UserId is required',
  }),
  transactionType: z.nativeEnum(TransactionType).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateUserTransactionInput = z.infer<
  typeof createUserTransactionSchema
>;
export type FetchTransactionsInput = z.infer<typeof fetchTransactionsSchema>;
export type FetchTransactionInput = z.infer<typeof fetchTransactionSchema>;
export type GetCoinDetailsInput = z.infer<typeof getCoinDetailsSchema>;
export type FetchUserTransactionsInput = z.infer<
  typeof fetchUserTransactionsSchema
>;

//Administrative
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type GetTransactionsWithTypeInput = z.infer<
  typeof getTransactionsWithTypeSchema
>;
export type GetUserTransactionInput = z.infer<typeof getUserTransactionsSchema>;

export const { schemas: transactionSchemas, $ref: transactionRef } =
  buildJsonSchemas(
    {
      createTransactionSchema,
      createUserTransactionSchema,
      fetchTransactionsSchema,
      fetchTransactionSchema,
      fetchUserTransactionsSchema,
      getCoinDetailsSchema,
      createTransactionResponseSchema,
      getTransactionsResponseSchema,
      getTransactionResponseSchema,
      getBalanceResponseSchema,
      updateTransactionSchema,
      getTransactionsWithTypeSchema,
      getUserTransactionsSchema,
    },
    { $id: 'TransactionSchema' }
  );
