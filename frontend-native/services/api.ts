import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { ApiResponse, AuthPayload, LoginInput, RegisterInput, User } from '@/types/auth';

class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const getHostFromExpo = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.developer?.hostUri;

  return hostUri?.split(':')[0];
};

const getDefaultApiUrl = () => {
  const host = getHostFromExpo();

  if (host) {
    return `http://${host}:8080/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }

  return 'http://localhost:8080/api';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

type RequestOptions = RequestInit & {
  token?: string | null;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message || 'Không thể kết nối đến máy chủ.',
      payload?.detail,
    );
  }

  if (!payload) {
    throw new ApiError(response.status, 'Máy chủ trả về dữ liệu không hợp lệ.');
  }

  return payload;
};

export const authApi = {
  async login(input: LoginInput) {
    return request<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async register(input: RegisterInput) {
    return request<AuthPayload>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async me(token: string) {
    return request<{ user: User }>('/auth/me', {
      method: 'GET',
      token,
    });
  },
};

export { ApiError };
