import { FastifyRequest, FastifyReply } from 'fastify';

//Services
import {
  createWalletConnection,
  getUserWalletConnect,
  getWalletConnections,
} from './walletConnect.service';

//Schemas
import { CreateWalletConnectInput } from './walletConnect.schema';
import { PaginationInput } from '../general/general.schema';

//Utils
import { sendResponse } from '../../utils/response.utils';
import { emitAndSaveNotification } from '../../utils/socket';

// Create new wallet connect
export const createWalletHandler = async (
  request: FastifyRequest<{
    Body: CreateWalletConnectInput;
  }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const user = decodedDetails._id;

  const existingWalletConnect = await getUserWalletConnect(user);
  if (existingWalletConnect.exists)
    return sendResponse(
      reply,
      409,
      false,
      'Multiple wallet connections are not permitted. An existing wallet is already linked to your account.'
    );

  //Create a new wallet connect and send notification
  const newWallet = await createWalletConnection({ user, ...request.body });
  await emitAndSaveNotification({
    user: user,
    type: 'alert',
    title: 'Wallet connection',
    message: 'Wallet connection was successful!',
  });

  //Return response
  return sendResponse(
    reply,
    201,
    true,
    'Wallet connection successful. Please contact our support team if you require further assistance or information.',
    newWallet
  );
};

//Check if a user has connected their wallet
export const checkWalletConnectHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const user = decodedDetails._id;

  const hasWalletConnect = await getUserWalletConnect(user);

  return sendResponse(
    reply,
    200,
    true,
    'User connect wallet details was fetched successfully',
    hasWalletConnect
  );
};

//Admin Endpoint

// READ (All - paginated)
export const getWalletsHandler = async (
  request: FastifyRequest<{
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) => {
  const page = Number(request.query.page || 1);
  const limit = Number(request.query.limit || 10);
  const result = await getWalletConnections(page, limit);
  return sendResponse(
    reply,
    200,
    true,
    'Users wallet connect was fetched successfully',
    result
  );
};
