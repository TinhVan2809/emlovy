// Post related types
export type PostMedia = {
  post_media_id: number;
  media_url: string;
  type: string;
};

export type PostAuthor = {
  user_id: number;
  name: string;
  username: string;
  avatar_url?: string;
};

export type Post = {
  post_id: number;
  content: string;
  media?: PostMedia[];
  author?: PostAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  category?: string;
};

export type PostsPage = {
  items: Post[];
  pagination: { hasMore: boolean };
};

export type UserInterest = {
  category: string;
  score: number;
};

export type ScoredPost = {
  post: Post;
  score: number;
};
