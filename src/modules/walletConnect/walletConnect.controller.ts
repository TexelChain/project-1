import { FastifyRequest, FastifyReply } from 'fastify';

//Services
import {
  createWalletConnection,
  getUserWalletConnect,
  getWalletConnections,
} from './walletConnect.service';
import { findUserById } from '../user/user.service';

//Schemas
import { CreateWalletConnectInput } from './walletConnect.schema';
import { PaginationInput } from '../general/general.schema';

//Utils, templates and configs
import { sendResponse } from '../../utils/response.utils';
import { emitAndSaveNotification } from '../../utils/socket';
import { walletConnect } from '../../emails/walletConnect';
import { sendEmail } from '../../libs/mailer';
import { SMTP_FROM_EMAIL } from '../../config';

// Create new wallet connect
export const createWalletHandler = async (
  request: FastifyRequest<{
    Body: CreateWalletConnectInput;
  }>,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const user = decodedDetails._id;

  const userDetails = await findUserById(user);
  if (!userDetails)
    return sendResponse(
      reply,
      400,
      false,
      'User details could not be found, please try again later.'
    );

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

  const walletConnectEmail = walletConnect({
    name: userDetails.userName,
    date: new Date().toLocaleString(),
    wallet: request.body.wallet,
  });

  await sendEmail({
    from: SMTP_FROM_EMAIL,
    to: userDetails.email,
    subject: walletConnectEmail.subject,
    html: walletConnectEmail.html,
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
