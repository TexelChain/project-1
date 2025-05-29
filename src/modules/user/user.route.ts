import { FastifyInstance } from 'fastify';

//Handlers
import {
  createUserHandler,
  editUserHandler,
  fetchCurrentUserHandler,
  fetchUserHandler,
  kycUploadHandler,
  resendVerification,
  updateProfilePictureHandler,
  updateUserHandler,
  verifyUserHandler,
} from './user.controller';

//Schemas
import {
  EditUserInput,
  FetchUserInput,
  userRef,
  VerifyUserInput,
} from './user.schema';
import { generalRef } from '../general/general.schema';
import { transactionRef } from '../transaction/transaction.schema';
import { getBalanceHandler } from '../transaction/transaction.controller';

//User Routes
export default async function userRoutes(app: FastifyInstance) {
  //Create new user
  app.post(
    '/create',
    {
      schema: {
        tags: ['Users'],
        body: userRef('createUserSchema'),
        response: {
          201: userRef('createUserResponseSchema'),
          403: generalRef('unauthorizedSchema'),
          409: generalRef('conflictRequestSchema'),
          400: generalRef('badRequestSchema'),
        },
      },
    },
    createUserHandler
  );

  //Verify new user
  app.post<{ Body: VerifyUserInput }>(
    '/verify',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        body: userRef('verifyUserSchema'),
        response: {
          200: generalRef('responseSchema'),
          400: generalRef('badRequestSchema'),
          409: generalRef('conflictRequestSchema'),
        },
      },
    },
    verifyUserHandler
  );

  //Resend Verification
  app.get(
    '/resend',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: generalRef('responseSchema'),
          400: generalRef('badRequestSchema'),
          409: generalRef('conflictRequestSchema'),
        },
      },
    },
    resendVerification
  );

  //KYC
  app.patch(
    '/kyc',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          415: generalRef('unsupportedSchema'),
          413: generalRef('payloadSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    kycUploadHandler
  );

  //Update Profile Picture
  app.patch(
    '/updateProfilePicture',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          415: generalRef('unsupportedSchema'),
          413: generalRef('payloadSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    updateProfilePictureHandler
  );

  //Update User Details
  app.patch<{ Body: EditUserInput }>(
    '/update',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    updateUserHandler
  );

  //Fetch User Balance
  app.get(
    '/getBalance',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users', 'Transactions'],
        security: [{ bearerAuth: [] }],
        response: {
          200: transactionRef('getBalanceResponseSchema'),
          400: generalRef('badRequestSchema'),
        },
      },
    },
    getBalanceHandler
  );

  //Fetch Current Logged In User
  app.get(
    '/currentUser',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          404: generalRef('unavailableSchema'),
        },
      },
    },
    fetchCurrentUserHandler
  );

  //Admin Endpoint

  //Edit user details
  app.patch<{ Body: EditUserInput }>(
    '/adminUpdate',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
          404: generalRef('unavailableSchema'),
        },
      },
    },
    editUserHandler
  );

  //Fetch User
  app.get<{ Params: FetchUserInput }>(
    '/getUser/:value',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userRef('generalUserResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
          404: generalRef('unavailableSchema'),
        },
      },
    },
    fetchUserHandler
  );
}
