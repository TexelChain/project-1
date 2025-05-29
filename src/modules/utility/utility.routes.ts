import { FastifyInstance } from 'fastify';

//Handlers
import {
  createUtilityHandler,
  editUtilityHandler,
  getUtilityHandler,
} from './utility.controller';

//Schemas
import {
  EditUtilityInput,
  ReadUtilityInput,
  utilityRef,
} from './utility.schema';
import { generalRef } from '../general/general.schema';

export default async function (app: FastifyInstance) {
  //Create Utility
  app.post(
    '/create',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        response: {
          201: utilityRef('generalUtilityResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    createUtilityHandler
  );

  //Get Utility
  app.get(
    '/get',
    {
      schema: {
        tags: ['Admin', 'Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: utilityRef('generalUtilityResponseSchema'),
        },
      },
    },
    getUtilityHandler
  );

  //Edit Utility
  app.patch<{ Params: ReadUtilityInput; Body: EditUtilityInput }>(
    `/edit/:id`,
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        params: utilityRef('readUtilitySchema'),
        body: utilityRef('editUtilitySchema'),
        response: {
          200: utilityRef('generalUtilityResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    editUtilityHandler
  );
}
