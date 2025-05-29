import { FastifyRequest, FastifyReply } from 'fastify';

//Services
import {
  createCardRequest,
  deleteCardRequest,
  getCardRequests,
  getUserCardRequest,
  updateCardRequest,
  userHasRequestedCard,
} from './cardRequest.services';
import { findAdminById } from '../admin/admin.service';

//Schemas
import {
  DeleteCardRequestInput,
  UpdateCardRequestInput,
} from './cardRequest.schema';
import { PaginationInput } from '../general/general.schema';

//Utils
import { sendResponse } from '../../utils/response.utils';

//Create card request handler
export const createCardRequestHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const user = decodedDetails._id;

  const alreadyRequested = await userHasRequestedCard(user);
  if (alreadyRequested)
    return sendResponse(reply, 409, false, 'User has already requested a card');

  const cardRequest = await createCardRequest(user);
  return sendResponse(
    reply,
    201,
    true,
    'Your Card request was submitted successfully.',
    cardRequest
  );
};

//Get user card request
export const getUserCardRequestHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const decodedDetails = request.user;
  const user = decodedDetails._id;

  const cardRequest = await getUserCardRequest(user);
  return sendResponse(reply, 200, true, 'Card request fetched', cardRequest);
};

//Admin Endpoint

//Get card requests
export const getCardRequestsHandler = async (
  request: FastifyRequest<{ Querystring: PaginationInput }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '10' } = request.query;

  const result = await getCardRequests(parseInt(page), parseInt(limit));
  return sendResponse(reply, 200, true, 'Card requests fetched', result);
};

//Update card request
export const updateCardRequestHandler = async (
  request: FastifyRequest<{ Body: UpdateCardRequestInput }>,
  reply: FastifyReply
) => {
  const decodedAdmin = request.admin!;
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      401,
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

  const { requestId, status } = request.body;
  const updated = await updateCardRequest(requestId, status);
  return sendResponse(reply, 200, true, 'Card request updated', updated);
};

//Delete Card Request
export const deleteCardRequestHandler = async (
  request: FastifyRequest<{ Params: DeleteCardRequestInput }>,
  reply: FastifyReply
) => {
  const decodedAdmin = request.admin!;
  const admin = await findAdminById(decodedAdmin?._id);
  if (!admin)
    return sendResponse(
      reply,
      401,
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

  const deleted = await deleteCardRequest(request.params.requestId);
  return sendResponse(reply, 200, true, 'Card request deleted', deleted);
};
