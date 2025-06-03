import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';

//Services
import {
  createNewTransaction,
  deleteTransaction,
  fetchTransactions,
  getLastThreeTransactions,
  getTransactionById,
  getTransactions,
  getUserBalanceByCoin,
  getUserTransactions,
  updateTransaction,
} from './transaction.service';
import { findUserById } from '../user/user.service';
import { findAdminById } from '../admin/admin.service';

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
  UpdateTransactionInput,
} from './transaction.schema';
import { PaginationInput } from '../general/general.schema';

//Utils, Enums and Configs
import { generateTransactionHash } from '../../utils/generate';
import { sendResponse } from '../../utils/response.utils';
import { coinIds } from '../../enums';
import { COINGECKO_API_KEY, SMTP_FROM_EMAIL } from '../../config';
import { emitAndSaveNotification } from '../../utils/socket';
import { formatAddress } from '../../utils/format';
import { sendEmail } from '../../libs/mailer';

//Email Templates
import send from '../../emails/send';

//Constants
const cache = new Map();
const CACHE_KEY = 'prices';
const CACHE_TTL = 2 * 60 * 1000;
const coingeckoURL = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;

//Create a new transaction
export const createNewTransactionHandler = async (
  request: FastifyRequest<{ Body: CreateTransactionInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure the user still exists
  const user = await findUserById(userId);
  if (!user)
    sendResponse(
      reply,
      400,
      false,
      'Sorry, that user account could not be found. Please verify the information and try again.'
    );

  //Throw an error if user is suspended
  if (user && user.isSuspended)
    return sendResponse(
      reply,
      403,
      false,
      'Account suspended. Transaction cannot be completed.'
    );

  //Generate hash, create new transaction and send a notification
  const transactionHash = generateTransactionHash();
  const newTransaction = await createNewTransaction({
    ...request.body,
    user: userId,
    transactionHash,
  });
  await emitAndSaveNotification({
    user: userId,
    type: 'transaction',
    title: `${request.body.coin} ${request.body.transactionType}`,
    message: `You ${request.body.transactionType} ${request.body.coin} to ${formatAddress(request.body.walletAddress)}`,
  });
  const sendTransactionEmailContent = send({
    name: user!.userName,
    coin: newTransaction.coin,
    amount: newTransaction.amount,
    walletAddress: formatAddress(newTransaction.walletAddress),
    transactionHash: formatAddress(newTransaction.transactionHash),
    date: new Date().toLocaleString(),
  });
  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: user!.email,
    subject: sendTransactionEmailContent.subject,
    html: sendTransactionEmailContent.html,
  });

  return sendResponse(
    reply,
    201,
    true,
    'Your transaction was created successfully',
    newTransaction
  );
};

//Fetch Prices
export const fetchPricesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const now = Date.now();
  const cached = cache.get(CACHE_KEY);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return sendResponse(
      reply,
      200,
      true,
      'Coins prices were fetched successfully (from cache)',
      cached.data
    );
  }

  try {
    const { data } = await axios.get(coingeckoURL, {
      headers: {
        Accept: 'application/json',
        'x-cg-demo-api-key': COINGECKO_API_KEY,
      },
    });

    cache.set(CACHE_KEY, {
      data,
      timestamp: now,
    });

    return sendResponse(
      reply,
      200,
      true,
      'Coins prices were fetched successfully',
      data
    );
  } catch (error) {
    request.log.error('Failed to fetch prices:', error);
    return sendResponse(
      reply,
      500,
      false,
      'Failed to fetch coin prices. Please try again later.'
    );
  }
};

//Fetch the prices of a coin
export const fetchCoinDetailsHandler = async (
  request: FastifyRequest<{ Params: GetCoinDetailsInput }>,
  reply: FastifyReply
) => {
  const coin = request.params.coin;
  const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coin}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'x-cg-demo-api-key': COINGECKO_API_KEY,
      },
    });

    return sendResponse(
      reply,
      200,
      true,
      'Coins details was fetched successfully',
      data
    );
  } catch (error) {
    request.log.error(`Failed to fetch ${coin} details:`, error);
    return sendResponse(
      reply,
      500,
      false,
      `Failed to fetch ${coin} details. Please try again later.`
    );
  }
};

//Fetch a users transactions of a specified coin
export const fetchTransactionsHandler = async (
  request: FastifyRequest<{ Body: FetchTransactionsInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure the user still exists
  const user = await findUserById(userId);
  if (!user)
    sendResponse(
      reply,
      400,
      false,
      'Sorry, that user account could not be found. Please verify the information and try again.'
    );

  //Throw an error if user is suspended
  if (user && user.isSuspended)
    return sendResponse(
      reply,
      403,
      false,
      'Account suspended. Transaction cannot be completed.'
    );

  const transactions = await fetchTransactions(userId, request.body.coin);
  if (!transactions)
    return sendResponse(
      reply,
      403,
      false,
      'Unable to retrieve transactions at this time. Please try again later.'
    );

  return sendResponse(
    reply,
    200,
    true,
    'Your transactions was fetched successfully',
    transactions
  );
};

//Fetch a users last three transactions
export const fetchLastTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure the user still exists
  const user = await findUserById(userId);
  if (!user)
    sendResponse(
      reply,
      400,
      false,
      'Sorry, that user account could not be found. Please verify the information and try again.'
    );

  //Throw an error if user is suspended
  if (user && user.isSuspended)
    return sendResponse(
      reply,
      403,
      false,
      'Account suspended. Transaction cannot be completed.'
    );

  //Fetch transactions and return them
  const transactions = await getLastThreeTransactions(userId);
  return sendResponse(
    reply,
    200,
    true,
    'All Transactions was fetched successfully',
    transactions
  );
};

//Fetch a single Transaction
export const fetchTransactionHandler = async (
  request: FastifyRequest<{ Params: FetchTransactionInput }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  const transaction = await getTransactionById(request.params.transactionId);

  //Throw an error if the transactionID does not exist
  if (!transaction)
    return sendResponse(
      reply,
      400,
      false,
      'No record of a transaction matching the given identifier was found.'
    );

  //Throw an error if the logged user isn't the same with the user
  if (transaction.user.toString() !== userId)
    return sendResponse(
      reply,
      403,
      false,
      'You do not have permission to view the details of this transaction.'
    );

  return sendResponse(
    reply,
    200,
    true,
    'Transaction Details was fetched successfully.'
  );
};

//Fetch all transaction
export const fetchAllUserTransactionsHandler = async (
  request: FastifyRequest<{ Querystring: PaginationInput }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '20' } = request.query;

  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure the user still exists
  const user = await findUserById(userId);
  if (!user)
    sendResponse(
      reply,
      400,
      false,
      'Sorry, that user account could not be found. Please verify the information and try again.'
    );

  //Throw an error if user is suspended
  if (user && user.isSuspended)
    return sendResponse(
      reply,
      403,
      false,
      'Account suspended. Transaction cannot be completed.'
    );

  //Fetch transactions and return them
  const transactions = await getUserTransactions(
    userId,
    parseInt(page),
    parseInt(limit)
  );
  return sendResponse(
    reply,
    200,
    true,
    'All Transactions was fetched successfully',
    transactions
  );
};

//Get user coin balance
export const getBalanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const userId = decodedDetails._id;

  //Make sure the user still exists
  const user = await findUserById(userId);
  if (!user)
    sendResponse(
      reply,
      400,
      false,
      'Sorry, that user account could not be found. Please verify the information and try again.'
    );

  const userBalance = await getUserBalanceByCoin(userId);
  return sendResponse(
    reply,
    200,
    true,
    'Your balance was fetched successfully',
    userBalance
  );
};

// Administrative Endpoint

//Create a new transaction
export const createUserTransactionHandler = async (
  request: FastifyRequest<{ Body: CreateUserTransactionInput }>,
  reply: FastifyReply
) => {
  const { user, coin, walletAddress, transactionType, amount } = request.body;
  const decodedAdmin = request.admin!;

  //Fetch admin and make sure he is a super admin
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      400,
      false,
      'Sorry, but you are not authorized to perform this action'
    );
  if (admin.role !== 'super_admin')
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized enough to perform this action'
    );

  //Generate hash, create new transaction and send a notification
  const transactionHash = generateTransactionHash();
  const newTransaction = await createNewTransaction({
    ...request.body,
    transactionHash,
  });
  const formattedMessage =
    transactionType === 'sent'
      ? `You sent ${amount} ${coin} to ${formatAddress(walletAddress)}`
      : `You received ${amount} ${coin} from ${formatAddress(walletAddress)}`;

  await emitAndSaveNotification({
    user: user,
    type: 'transaction',
    title: `${coin} ${transactionType}`,
    message: formattedMessage,
  });

  return sendResponse(
    reply,
    201,
    true,
    'Your transaction was created successfully',
    newTransaction
  );
};

//Fetch all transaction
export const fetchAllTransactionsHandler = async (
  request: FastifyRequest<{
    Params: GetTransactionsWithTypeInput;
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) => {
  const type = request.params.transactionType;
  console.log('The type', type);
  const { page = '1', limit = '20' } = request.query;

  //Fetch transactions and return them
  const transactions = await getTransactions(
    type,
    parseInt(page),
    parseInt(limit)
  );
  return sendResponse(
    reply,
    200,
    true,
    'All Transactions was fetched successfully',
    transactions
  );
};

//Update Transaction
export const updateTransactionHandler = async (
  request: FastifyRequest<{ Body: UpdateTransactionInput }>,
  reply: FastifyReply
) => {
  const { status, transactionId } = request.body;
  const decodedAdmin = request.admin!;

  //Fetch admin and make sure he is a super admin
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      400,
      false,
      'Sorry, but you are not authorized to perform this action'
    );
  if (admin.role !== 'super_admin')
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized enough to perform this action'
    );

  //Fetch Transaction and Update
  const transaction = await getTransactionById(transactionId);
  if (!transaction)
    return sendResponse(
      reply,
      404,
      false,
      'The specified transaction details do not correspond to any record.'
    );

  //Update transaction and return
  const updatedTransaction = await updateTransaction(transactionId, { status });
  return sendResponse(
    reply,
    200,
    true,
    'The transaction was updated successfully.',
    updatedTransaction
  );
};

//Get User Transaction
export const fetchUserTransactionHandler = async (
  request: FastifyRequest<{
    Body: GetUserTransactionInput;
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) => {
  const { userId, transactionType } = request.body;
  const { page = '1', limit = '20' } = request.query;

  // Check if user exists
  const user = await findUserById(userId);
  if (!user) {
    return sendResponse(
      reply,
      400,
      false,
      'The specified user details do not exist in our records.'
    );
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  // Fetch Transactions
  const result = await getUserTransactions(
    userId,
    pageNumber,
    limitNumber,
    transactionType
  );

  return sendResponse(
    reply,
    200,
    true,
    'User transactions fetched successfully.',
    result
  );
};

//Get User Balance
export const getUserBalanceHandler = async (
  request: FastifyRequest<{ Params: FetchUserTransactionsInput }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;

  // Check if user exists
  const user = await findUserById(userId);
  if (!user) {
    return sendResponse(
      reply,
      400,
      false,
      'The specified user details do not exist in our records.'
    );
  }

  const userBalance = await getUserBalanceByCoin(userId);
  return sendResponse(
    reply,
    200,
    true,
    'Your balance was fetched successfully',
    userBalance
  );
};

//Delete a Transaction
export const deleteUserTransactionHandler = async (
  request: FastifyRequest<{ Params: FetchTransactionInput }>,
  reply: FastifyReply
) => {
  const decodedAdmin = request.admin!;
  const transactionId = request.params.transactionId;

  //Fetch admin and make sure he is a super admin
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      400,
      false,
      'Sorry, but you are not authorized to perform this action'
    );
  if (admin.role !== 'super_admin')
    return sendResponse(
      reply,
      403,
      false,
      'Sorry, you are not authorized enough to perform this action'
    );

  const deleted = await deleteTransaction(transactionId);
  return sendResponse(
    reply,
    200,
    true,
    'Transaction was deleted successfully',
    deleted
  );
};
