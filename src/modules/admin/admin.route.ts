import { FastifyInstance } from 'fastify';

//Handler
import {
  createAdminHandler,
  fetchAdminsHandler,
  sampleAdminCreationHandler,
  updateAdminHandler,
} from './admin.controller';

//Schemas
import { adminRef, CreateAdminInput, UpdateAdminInput } from './admin.schema';
import { generalRef } from '../general/general.schema';

export default async function adminRoutes(app: FastifyInstance) {
  //Create new admin
  app.post<{ Body: CreateAdminInput }>(
    '/create',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        body: adminRef('createAdminSchema'),
        response: {
          201: adminRef('generalAdminResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
          409: generalRef('conflictRequestSchema'),
        },
      },
    },
    createAdminHandler
  );

  //Create sample admin
  app.post<{ Body: CreateAdminInput }>(
    '/sampleCreate',
    {
      schema: {
        tags: ['Admins'],
        body: adminRef('createAdminSchema'),
        response: {
          201: adminRef('generalAdminResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
          409: generalRef('conflictRequestSchema'),
        },
      },
    },
    sampleAdminCreationHandler
  );

  //Fetch admins
  app.get(
    '/getAdmins',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: adminRef('fetchAdminsResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    fetchAdminsHandler
  );

  //Update admin
  app.patch<{ Body: UpdateAdminInput }>(
    '/updateAdmin',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        body: adminRef('updateAdminSchema'),
        response: {
          200: adminRef('generalAdminResponseSchema'),
          401: generalRef('unauthorizedSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    updateAdminHandler
  );
}
