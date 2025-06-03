import { FastifyInstance } from 'fastify';

//Handlers
import {
  createNewTransactionHandler,
  createUserTransactionHandler,
  deleteUserTransactionHandler,
  fetchAllTransactionsHandler,
  fetchAllUserTransactionsHandler,
  fetchCoinDetailsHandler,
  fetchLastTransactionsHandler,
  fetchPricesHandler,
  fetchTransactionHandler,
  fetchTransactionsHandler,
  fetchUserTransactionHandler,
  getUserBalanceHandler,
  updateTransactionHandler,
} from './transaction.controller';

//Schemas
import {
  CreateTransactionInput,
  CreateUserTransactionInput,
  FetchTransactionInput,
  FetchTransactionsInput,
  FetchUserTransactionsInput,
  GetCoinDetailsInput,
  GetTransactionsWithTypeInput,
  GetUserTransactionInput,
  transactionRef,
  UpdateTransactionInput,
} from './transaction.schema';
import { generalRef, PaginationInput } from '../general/general.schema';

//Transaction Routes
export default async function transactionRoutes(app: FastifyInstance) {
  //Create new transaction
  app.post<{ Body: CreateTransactionInput }>(
    '/create',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
        body: transactionRef('createTransactionSchema'),
        response: {
          201: transactionRef('createTransactionResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    createNewTransactionHandler
  );

  //Fetches the price list
  app.get(
    '/fetchPrices',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    fetchPricesHandler
  );

  //Fetch coin details
  app.get<{ Params: GetCoinDetailsInput }>(
    '/getCoinDetails/:coin',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
        params: transactionRef('getCoinDetailsSchema'),
      },
    },
    fetchCoinDetailsHandler
  );

  //Fetch transactions for a particular coin
  app.post<{ Body: FetchTransactionsInput }>(
    '/getTransactions',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
        body: transactionRef('fetchTransactionsSchema'),
        response: {
          200: transactionRef('getTransactionsResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    fetchTransactionsHandler
  );

  //Get a user last three transactions
  app.get(
    '/getLastTransactions',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    fetchLastTransactionsHandler
  );

  //Fetch a single transaction
  app.get<{ Params: FetchTransactionInput }>(
    '/getTransaction/:transactionId',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
        params: transactionRef('fetchTransactionSchema'),
        response: {
          200: transactionRef('getTransactionResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    fetchTransactionHandler
  );

  //Fetch all transactions of a user
  app.get<{ Querystring: PaginationInput }>(
    '/userTransactions',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Transactions', 'Users'],
        security: [{ bearerAuth: [] }],
        querystring: generalRef('paginationSchema'),
      },
    },
    fetchAllUserTransactionsHandler
  );

  //Admin Routes

  //Create a new transaction for a user
  app.post<{ Body: CreateUserTransactionInput }>(
    '/createUserTransaction',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        body: transactionRef('createUserTransactionSchema'),
        response: {
          201: transactionRef('createTransactionResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
        },
      },
    },
    createUserTransactionHandler
  );

  //Fetch all transactions
  app.get<{
    Params: GetTransactionsWithTypeInput;
    Querystring: PaginationInput;
  }>(
    '/getAllTransactions/:transactionType',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        params: transactionRef('getTransactionsWithTypeSchema'),
        querystring: generalRef('paginationSchema'),
      },
    },
    fetchAllTransactionsHandler
  );

  //Update Transactions
  app.patch<{ Body: UpdateTransactionInput }>(
    '/updateTransaction',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        body: transactionRef('updateTransactionSchema'),
        response: {
          200: transactionRef('getTransactionResponseSchema'),
          400: generalRef('badRequestSchema'),
          403: generalRef('forbiddenSchema'),
          404: generalRef('unavailableSchema'),
        },
      },
    },
    updateTransactionHandler
  );

  //Fetch User Transactions
  app.post<{
    Body: GetUserTransactionInput;
    Querystring: PaginationInput;
  }>(
    '/getUserTransactions',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        body: transactionRef('getUserTransactionsSchema'),
        querystring: generalRef('paginationSchema'),
        response: {
          200: transactionRef('getTransactionsResponseSchema'),
          400: generalRef('badRequestSchema'),
        },
      },
    },
    fetchUserTransactionHandler
  );

  //Get a User Balance
  app.post<{ Params: FetchUserTransactionsInput }>(
    '/getUserBalance/:userId',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        params: transactionRef('fetchUserTransactionsSchema'),
        response: {
          200: transactionRef('getBalanceResponseSchema'),
          400: generalRef('badRequestSchema'),
        },
      },
    },
    getUserBalanceHandler
  );

  //Delete a transaction
  app.delete<{ Params: FetchTransactionInput }>(
    '/delete/:transactionId',
    {
      preHandler: app.authenticateAdmin,
      schema: {
        tags: ['Transactions', 'Admins'],
        security: [{ bearerAuth: [] }],
        params: transactionRef('fetchTransactionSchema'),
      },
    },
    deleteUserTransactionHandler
  );
}
