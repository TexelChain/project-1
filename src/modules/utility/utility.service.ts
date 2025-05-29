import UtilityModel from './utility.model';

//Schemas
import { EditUtilityInput } from './utility.schema';

//Create Utility
export const createUtility = async () => {
  const utility = await UtilityModel.create();
  return utility;
};

//Edit a Utility
export const updateUtility = async (id: string, input: EditUtilityInput) => {
  const updatedUtility = await UtilityModel.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { new: true, runValidators: true }
  );

  return updatedUtility;
};

//Fetch a Utility
export const getUtility = async (id: string) => {
  const utility = await UtilityModel.findById(id);
  return utility;
};
