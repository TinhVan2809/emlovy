export type User = {
  user_id: number;
  name: string;
  nickname: string;
  username: string;
  birthday: string | null;
  signature: string;
  gender: '0' | '1' | '2' | null;
  phone: string | null;
  avata: string | null;
  avatar_url: string | null;
  email: string | null;
  role: 'admin' | 'customer';
  status: number;
  created_at: string;
  is_verified: number;
};

export type ProfileStats = {
  posts: number;
  followers: number;
  following: number;
  likes: number;
};

export type Profile = User & {
  is_following?: boolean;
  is_self?: boolean;
  stats: ProfileStats;
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

export type UpdateProfileInput = {
  name?: string;
  username?: string;
  nickname?: string | null;
  birthday?: string | null;
  gender?: '0' | '1' | '2' | null;
  phone?: string | null;
  email?: string | null;
};

export type AvatarUploadInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type PostVisibility = 'public' | 'private' | 'friends' | 'followers';

export type PostMedia = {
  post_media_id: number;
  post_id: number;
  media_url: string;
  type: 'image' | 'video';
  sort_order: number;
  width: number | null;
  height: number | null;
  duration: number | null;
};

export type Post = {
  post_id: number;
  user_id: number;
  post_type?: 'post' | 'reel';
  content: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  save_count: number;
  visibility: PostVisibility;
  location: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  is_deleted: boolean;
  is_edited: boolean;
  is_pinned: boolean;
  liked_by_me: boolean;
  created_at: string;
  updated_at: string;
  author: User;
  media: PostMedia[];
};

export type Reel = Post & {
  post_type: 'reel';
  video: PostMedia | null;
  video_url: string | null;
};

export type StoryMedia = {
  story_media_id: number;
  story_id: number;
  media_url: string;
  type: 'image' | 'video';
  duration: number | null;
  position_x: string | number | null;
  position_y: string | number | null;
  created_at: string;
};

export type StoryItem = {
  story_id: number;
  user_id: number;
  content: string | null;
  background_color: string;
  music_url: string | null;
  expires_at: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author: User;
  media: StoryMedia[];
};

export type StoryGroup = {
  user_id: number;
  author: User;
  is_own: boolean;
  stories: StoryItem[];
  latest_created_at: string;
};

export type PostComment = {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  like_count: number;
  reply_count: number;
  liked_by_me: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author: User;
  replies: PostComment[];
};

export type PostsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type PostsPage = {
  items: Post[];
  pagination: PostsPagination;
};

export type ReelsPage = {
  items: Reel[];
  pagination: PostsPagination;
};

export type CommentsPage = {
  items: PostComment[];
  pagination: PostsPagination;
};

export type PostLikeSummary = {
  post_id: number;
  liked_by_me: boolean;
  like_count: number;
};

export type CommentLikeSummary = {
  id: number;
  post_id: number;
  liked_by_me: boolean;
  like_count: number;
};

export type CommentMutationResult = {
  comment: PostComment;
  post: {
    post_id: number;
    comment_count: number;
    visibility?: PostVisibility | null;
  };
};

export type ChatMessageType = 'text' | 'image' | 'video' | 'file' | 'sticker' | 'voice' | 'location';

export type ChatMessage = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string | null;
  message_type: ChatMessageType;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to_message_id: number | null;
  created_at: string;
  updated_at: string;
  sender: User;
  attachments: unknown[];
};

export type ChatParticipant = User & {
  role: 'member' | 'admin';
  joined_at: string;
  is_muted: boolean;
  is_archived: boolean;
  last_read_message_id: number | null;
};

export type ChatConversation = {
  conversation_id: number;
  type: 'private' | 'group';
  name: string | null;
  title: string;
  avatar: string | null;
  avatar_url: string | null;
  last_message_id: number | null;
  last_message_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message: ChatMessage | null;
  participants: ChatParticipant[];
  participant_ids: number[];
  unread_count: number;
};

export type ChatConversationsPage = {
  items: ChatConversation[];
  pagination: PostsPagination;
};

export type ChatMessagesPage = {
  items: ChatMessage[];
  pagination: PostsPagination;
};

export type CreateConversationInput = {
  participant_ids?: number[];
  participantIds?: number[];
  user_id?: number;
  userId?: number;
  target_user_id?: number;
  targetUserId?: number;
  type?: 'private' | 'group';
  name?: string | null;
};

export type SendMessageInput = {
  content: string;
  message_type?: ChatMessageType;
  messageType?: ChatMessageType;
  reply_to_message_id?: number | null;
};

export type PostMediaInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type CreatePostInput = {
  content?: string | null;
  location?: string | null;
  visibility?: PostVisibility;
  media?: PostMediaInput[];
};

export type UpdatePostInput = CreatePostInput & {
  replaceMedia?: boolean;
};

export type CreateReelInput = {
  caption?: string | null;
  video: PostMediaInput;
};

export type StoryMediaInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type CreateStoryInput = {
  content?: string | null;
  background_color?: string | null;
  music_url?: string | null;
  media?: StoryMediaInput[];
};

export type UpdateStoryInput = CreateStoryInput & {
  replaceMedia?: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  detail?: unknown;
};
