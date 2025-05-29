//For the Response
declare type IGenericObject = {
  [key: string]: any;
};

declare type PaginatedData<T> = {
  total: number;
  page: number;
  pageSize: number;
  results: T[];
};

declare type ResponseData<T> = T | PaginatedData<T>;

declare type ApiResponse<T = any> = {
  status: number;
  success: boolean;
  message: string;
  data?: T;
};

//Users
declare type User = {
  _id: string;
  userName: string;
  accountId: string;
  email: string;
  phoneNumber: string;
  country: string;
  passPhrase: string[];
  profilePicture: string;
  gender: 'male' | 'female' | 'prefer not to say';
  isVerified: boolean;
  isSuspended: boolean;
  suspendedDate: Date | null;
  depositMessage: string;
  minimumTransfer: number | null;
  lastSession: Date;
  createdAt: Date;
};

//Login Details
declare type IPInfo = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  error?: boolean;
  reason?: string;
};

//Create new user
declare type newUser = {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  country: string;
  encryptedPassword: string;
  passPhrase: string[];
};

//Admin
declare type Admin = {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  isSuspended: boolean;
  lastSession: Date;
  createdAt: Date;
};

//Create new admin
declare type newAdmin = {
  password: string;
  email: string;
  role?: string | undefined;
  encryptedPassword: string;
};
