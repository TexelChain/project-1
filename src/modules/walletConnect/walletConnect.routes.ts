import { FastifyInstance } from 'fastify';

//Handlers
import {
  checkWalletConnectHandler,
  createWalletHandler,
  getWalletsHandler,
} from './walletConnect.controller';

//Schemas
import {
  CreateWalletConnectInput,
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
  app.get<{ Querystring: PaginationInput }>(
    '/getWalletConnects',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Admins'],
        security: [{ bearerAuth: [] }],
        querystring: generalRef('paginationSchema'),
      },
    },
    getWalletsHandler
  );
}
