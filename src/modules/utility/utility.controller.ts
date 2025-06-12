import { FastifyRequest, FastifyReply } from 'fastify';

//Services
import { findAdminById } from '../admin/admin.service';
import { createUtility, getUtility, updateUtility } from './utility.service';

//Utility
import { sendResponse } from '../../utils/response.utils';
import { EditUtilityInput, ReadUtilityInput } from './utility.schema';

//Create a new utility
export const createUtilityHandler = async (
  request: FastifyRequest,
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

  const newUtility = await createUtility();
  return sendResponse(
    reply,
    201,
    true,
    'Your Utility was initialized successfully.',
    newUtility
  );
};

//Edit Utility
export const editUtilityHandler = async (
  request: FastifyRequest<{ Params: ReadUtilityInput; Body: EditUtilityInput }>,
  reply: FastifyReply
) => {
  const id = request.params.id;
  const body = request.body;

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

  const updatedUtility = await updateUtility(id, body);
  return sendResponse(
    reply,
    200,
    true,
    'The Utility was updated successfully.',
    updatedUtility
  );
};

//Get Utility
export const getUtilityHandler = async (
  request: FastifyRequest<{ Params: ReadUtilityInput }>,
  reply: FastifyReply
) => {
  const id = request.params.id;
  console.log('The Id', id);

  const utility = await getUtility(id);
  if (!utility) {
    return sendResponse(reply, 404, false, 'Utility not found');
  }

  return sendResponse(
    reply,
    200,
    true,
    'Utility was fetched successfully',
    utility
  );
};
