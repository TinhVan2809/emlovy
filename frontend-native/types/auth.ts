export type User = {
  user_id: number;
  name: string;
  username: string;
  birthday: string | null;
  gender: '0' | '1' | '2' | null;
  phone: string | null;
  avata: string | null;
  email: string | null;
  role: 'admin' | 'customer';
  status: number;
  created_at: string;
};

export type AuthPayload = {
  user: User;
  token: string;
};

export type LoginInput = {
  login: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  detail?: unknown;
};
