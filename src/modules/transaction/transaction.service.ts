import TransactionModel, {
  TransactionCoin,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from './transaction.model';

//Type Declaration
type newTransaction = {
  user: string;
  coin: TransactionCoin;
  transactionType: TransactionType;
  amount: number;
  network?: string;
  status?: string;
  walletAddress: string;
  transactionHash: string;
};

//New Transaction
export const createNewTransaction = async (input: newTransaction) => {
  const newTransaction = await TransactionModel.create(input);
  return newTransaction;
};

//Fetch Transactions
export const fetchTransactions = async (user: string, coin: string) => {
  const transactions = await TransactionModel.find({ user, coin }).sort({
    createdAt: -1,
  });
  return transactions;
};

//Fetch a Particular Transaction
export const getTransactionById = async (id: string) => {
  return await TransactionModel.findById(id);
};

//Get the balance of each coin
export const getUserBalanceByCoin = async (userId: string) => {
  const transactions = await TransactionModel.find({
    user: userId,
    status: TransactionStatus.SUCCESSFUL,
  });

  // Initialize all coins with 0 balance
  const balanceByCoin: Record<TransactionCoin, number> = Object.values(
    TransactionCoin
  ).reduce(
    (acc, coin) => {
      acc[coin] = 0;
      return acc;
    },
    {} as Record<TransactionCoin, number>
  );

  // Calculate balance based on transactions
  for (const tx of transactions) {
    const coin = tx.coin;

    if (tx.transactionType === TransactionType.RECEIVED) {
      balanceByCoin[coin] += tx.amount;
    } else if (tx.transactionType === TransactionType.SENT) {
      balanceByCoin[coin] -= tx.amount;
    }
  }

  return balanceByCoin;
};

//Get a users last three transactions
export const getLastThreeTransactions = async (user: string) => {
  const transactions = await TransactionModel.find({ user })
    .sort({ createdAt: -1 })
    .limit(3);
  return transactions;
};

//Admin Services
//Fetch all transactions with pagination
export const getTransactions = async (
  transactionType?: TransactionType,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (transactionType) {
    filter.transactionType = transactionType;
  }

  const [transactions, total] = await Promise.all([
    TransactionModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('user', 'userName email accountId profilePicture'),
    TransactionModel.countDocuments(filter),
  ]);

  return {
    data: transactions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

//Fetch a specific user transactions
export const getUserTransactions = async (
  user: string,
  page = 1,
  limit = 20,
  transactionType?: TransactionType
) => {
  const skip = (page - 1) * limit;

  const filter: any = { user };
  if (transactionType) {
    filter.transactionType = transactionType;
  }

  const [transactions, total] = await Promise.all([
    TransactionModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filter),
  ]);

  return {
    data: transactions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

//Update a transaction
export const updateTransaction = async (
  id: string,
  data: Partial<TransactionDocument>
): Promise<{
  success: boolean;
  reason: string;
}> => {
  const transaction = await TransactionModel.findById(id);
  if (!transaction) return { success: false, reason: 'Transaction not found' };

  const isGoingSuccessful = data.status === TransactionStatus.SUCCESSFUL;
  const isSentType = transaction.transactionType === TransactionType.SENT;

  if (isGoingSuccessful && isSentType) {
    const balances = await getUserBalanceByCoin(transaction.user.toString());
    const userBalance = balances[transaction.coin] || 0;

    if (userBalance < transaction.amount) {
      return {
        success: false,
        reason: 'User has Insufficient balance for transaction',
      };
    }
  }

  const updated = await TransactionModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return { success: true, reason: 'Transaction was updated successfully.' };
};

//Delete a transaction
export const deleteTransaction = async (id: string) => {
  return await TransactionModel.findByIdAndDelete(id);
};
