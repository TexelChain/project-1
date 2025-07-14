import { FastifyInstance } from 'fastify';

//Handlers
import {
  checkWalletConnectHandler,
  createWalletHandler,
  deleteWalletHandler,
  getWalletsHandler,
} from './walletConnect.controller';

//Schemas
import {
  CreateWalletConnectInput,
  DeleteWalletConnectInput,
  walletConnectRef,
} from './walletConnect.schema';
import { generalRef, PaginationInput } from '../general/general.schema';

export default async function walletConnectRoutes(app: FastifyInstance) {
  //Create new wallet connect
  app.post<{ Body: CreateWalletConnectInput }>(
    '/create',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        body: walletConnectRef('createWalletConnectSchema'),
        response: {
          201: walletConnectRef('walletCoreResponseSchema'),
          409: generalRef('conflictRequestSchema'),
        },
      },
    },
    createWalletHandler
  );

  //Check the user wallet connect status
  app.get(
    '/walletConnectStats',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    checkWalletConnectHandler
  );

  //Admin Routes

  //Get all wallet connects
  app.get<{ Querystring: PaginationInput }>(
    '/getWalletConnects',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        querystring: generalRef('paginationSchema'),
      },
    },
    getWalletsHandler
  );

  app.delete<{ Params: DeleteWalletConnectInput }>(
    '/delete/:connectId',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        params: walletConnectRef('deleteWalletConnectSchema'),
      },
    },
    deleteWalletHandler
  );
}
