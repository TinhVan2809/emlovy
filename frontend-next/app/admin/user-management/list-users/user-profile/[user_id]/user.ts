export interface IUser {
  user_id: number;
  name: string;
  username: string;
  email?: string | null;
  role?: string; // Role có thể chỉ có trong danh sách hoặc ngữ cảnh admin
  status: number;
  avata?: string | null;
  stats?: {
    followers: number;
    following: number;
    posts: number;
    likes: number;
  };
  created_at: string;
  signature?: string | null; // Cụ thể cho trang hồ sơ
  is_verified?: number; // Cụ thể cho trang hồ sơ
}

export interface IPost {
  post_id: number;
  title: string;
  content: string;
  created_at: string;
  media: { media_url: string; type?: string }[] | string;
  like_count: number;
  comment_count: number;
}

export interface IPostsResponse {
  success: boolean;
  data: {
    items: IPost[];
  };
}


export interface IPaginationData {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface IUsersApiResponse {
  items: IUser[];
  pagination: IPaginationData;
}

export interface IUserProfileApiResponse {
  success: boolean;
  data: { profile: IUser; posts: IPost[] };
}