import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

//General Schema
import { responseCore } from '../general/general.schema';

const walletConnectCore = z.object({
  wallet: z.string({
    required_error: 'Wallet is required',
  }),
  passPhrase: z.array(z.string()),
});

const createWalletConnectSchema = walletConnectCore;

const walletCoreWithMeta = walletConnectCore.extend({
  user: z.string(),
  _id: z.string(),
  createdAt: z.string().datetime(),
});

const deleteWalletConnectSchema = z.object({
  connectId: z.string({
    required_error: 'Connection ID is required',
  }),
});

const walletCoreResponseSchema = z.object({
  ...responseCore,
  data: walletCoreWithMeta,
});

const fetchWalletConnectResponseSchema = z.object({
  ...responseCore,
  data: z.array(walletCoreWithMeta),
});

export type CreateWalletConnectInput = z.infer<
  typeof createWalletConnectSchema
>;
export type DeleteWalletConnectInput = z.infer<
  typeof deleteWalletConnectSchema
>;

export const { schemas: walletConnectSchemas, $ref: walletConnectRef } =
  buildJsonSchemas(
    {
      createWalletConnectSchema,
      deleteWalletConnectSchema,
      walletCoreResponseSchema,
      fetchWalletConnectResponseSchema,
    },
    { $id: 'WalletConnectSchema' }
  );
