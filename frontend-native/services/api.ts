import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type {
  ApiResponse,
  AuthPayload,
  AvatarUploadInput,
  CommentLikeSummary,
  CommentMutationResult,
  CommentsPage,
  CreatePostInput,
  LoginInput,
  Post,
  PostLikeSummary,
  PostMediaInput,
  PostsPage,
  Profile,
  RegisterInput,
  UpdatePostInput,
  UpdateProfileInput,
  User,
} from '@/types/auth';

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
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  headers.set('Accept', 'application/json');

  if (options.body && !isFormData && !headers.has('Content-Type')) {
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

const getAvatarFileName = (input: AvatarUploadInput) => {
  if (input.fileName) {
    return input.fileName;
  }

  const nameFromUri = input.uri.split('/').pop();
  return nameFromUri || `avatar-${Date.now()}.jpg`;
};

const getPostMediaFileName = (input: PostMediaInput, index: number) => {
  if (input.fileName) {
    return input.fileName;
  }

  const nameFromUri = input.uri.split('/').pop();
  return nameFromUri || `post-media-${Date.now()}-${index}.jpg`;
};

const createPostFormData = (input: CreatePostInput | UpdatePostInput) => {
  const formData = new FormData();

  if (Object.prototype.hasOwnProperty.call(input, 'content')) {
    formData.append('content', input.content ?? '');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'location')) {
    formData.append('location', input.location ?? '');
  }

  if (input.visibility) {
    formData.append('visibility', input.visibility);
  }

  if ('replaceMedia' in input && input.replaceMedia !== undefined) {
    formData.append('replaceMedia', input.replaceMedia ? 'true' : 'false');
  }

  input.media?.forEach((file, index) => {
    formData.append('media', {
      uri: file.uri,
      name: getPostMediaFileName(file, index),
      type: file.mimeType || 'image/jpeg',
    } as unknown as Blob);
  });

  return formData;
};

const normalizePostsPage = (data: PostsPage | Post[], page: number, limit: number): PostsPage => {
  if (!Array.isArray(data)) {
    return data;
  }

  return {
    items: data,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: 1,
      hasMore: false,
    },
  };
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

export const profileApi = {
  async getMe(token: string) {
    return request<{ profile: Profile }>('/profile/me', {
      method: 'GET',
      token,
    });
  },
  async updateMe(token: string, input: UpdateProfileInput) {
    return request<{ profile: Profile; user: User }>('/profile/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(input),
    });
  },
  async uploadAvatar(token: string, input: AvatarUploadInput) {
    const formData = new FormData();
    const fileName = getAvatarFileName(input);
    const mimeType = input.mimeType || 'image/jpeg';

    formData.append('avatar', {
      uri: input.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    return request<{ profile: Profile; user: User }>('/profile/me/avatar', {
      method: 'POST',
      token,
      body: formData,
    });
  },
};

export const postApi = {
  async getFeed({ page = 1, limit = 10, token }: { page?: number; limit?: number; token?: string | null } = {}) {
    const response = await request<PostsPage | Post[]>(`/posts?page=${page}&limit=${limit}`, {
      method: 'GET',
      token,
    });

    return {
      ...response,
      data: normalizePostsPage(response.data, page, limit),
    };
  },
  async getMyPosts(token: string, { page = 1, limit = 12 }: { page?: number; limit?: number } = {}) {
    const response = await request<PostsPage | Post[]>(`/posts/me?page=${page}&limit=${limit}`, {
      method: 'GET',
      token,
    });

    return {
      ...response,
      data: normalizePostsPage(response.data, page, limit),
    };
  },
  async create(token: string, input: CreatePostInput) {
    return request<Post>('/posts', {
      method: 'POST',
      token,
      body: createPostFormData(input),
    });
  },
  async update(token: string, postId: number, input: UpdatePostInput) {
    return request<Post>(`/posts/${postId}`, {
      method: 'PATCH',
      token,
      body: createPostFormData(input),
    });
  },
  async delete(token: string, postId: number) {
    return request<null>(`/posts/${postId}`, {
      method: 'DELETE',
      token,
    });
  },
  async like(token: string, postId: number) {
    return request<PostLikeSummary>(`/posts/${postId}/like`, {
      method: 'POST',
      token,
    });
  },
  async unlike(token: string, postId: number) {
    return request<PostLikeSummary>(`/posts/${postId}/like`, {
      method: 'DELETE',
      token,
    });
  },
  async getComments(
    postId: number,
    { page = 1, limit = 20, sort = 'top', token }: { page?: number; limit?: number; sort?: 'top' | 'new'; token?: string | null } = {},
  ) {
    return request<CommentsPage>(`/posts/${postId}/comments?page=${page}&limit=${limit}&sort=${sort}`, {
      method: 'GET',
      token,
    });
  },
  async comment(token: string, postId: number, content: string) {
    return request<CommentMutationResult>(`/posts/${postId}/comments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  },
  async reply(token: string, postId: number, commentId: number, content: string) {
    return request<CommentMutationResult>(`/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  },
  async likeComment(token: string, commentId: number) {
    return request<CommentLikeSummary>(`/posts/comments/${commentId}/like`, {
      method: 'POST',
      token,
    });
  },
  async unlikeComment(token: string, commentId: number) {
    return request<CommentLikeSummary>(`/posts/comments/${commentId}/like`, {
      method: 'DELETE',
      token,
    });
  },
};

export { ApiError };
