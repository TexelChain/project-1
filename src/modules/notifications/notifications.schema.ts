import { z } from 'zod';

import { buildJsonSchemas } from 'fastify-zod';

//Schemas
import { responseCore } from '../general/general.schema';

const notificationCore = {
  user: z.string(),
  type: z.enum(['transaction', 'system', 'alert']),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
};

export const createNotificationSchema = z.object({
  type: z.enum(['transaction', 'system', 'alert']),
  title: z.string(),
  message: z.string(),
});

export const readNotificationSchema = z.object({
  notificationId: z.string({
    required_error: 'Notification Id is required',
  }),
});

export const generalNotificationResponseSchema = z.object({
  ...responseCore,
  data: z.object(notificationCore),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ReadNotificationInput = z.infer<typeof readNotificationSchema>;

export const { schemas: notificationSchemas, $ref: notificationRef } =
  buildJsonSchemas(
    {
      createNotificationSchema,
      readNotificationSchema,
      generalNotificationResponseSchema,
    },
    { $id: 'NotificationSchema' }
  );
