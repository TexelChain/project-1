import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

//Import Schema
import { responseCore } from '../general/general.schema';

const utilityCore = {
  _id: z.string(),
  cardPrice: z.number(),
  minimumAmount: z.number(),
};

const editUtilitySchema = z.object({
  cardPrice: z.number().optional(),
  minimumAmount: z.number().optional(),
});

const readUtilitySchema = z.object({
  id: z.string(),
});

const generalUtilityResponseSchema = z.object({
  ...responseCore,
  data: z.object(utilityCore),
});

export type ReadUtilityInput = z.infer<typeof readUtilitySchema>;
export type EditUtilityInput = z.infer<typeof editUtilitySchema>;

export const { schemas: utilitySchemas, $ref: utilityRef } = buildJsonSchemas({
  readUtilitySchema,
  editUtilitySchema,
  generalUtilityResponseSchema,
});
