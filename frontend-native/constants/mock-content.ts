export type Story = {
  id: string;
  name: string;
  initials: string;
  tone: string;
  accent: string;
  isOwn?: boolean;
};

export type Post = {
  id: string;
  user: string;
  handle: string;
  location: string;
  caption: string;
  likes: string;
  comments: string;
  time: string;
  label: string;
  tone: string;
  accent: string;
};

export type SearchTile = {
  id: string;
  label: string;
  height: number;
  tone: string;
  accent: string;
};

export type Reel = {
  id: string;
  title: string;
  creator: string;
  audio: string;
  views: string;
  likes: string;
  comments: string;
  label: string;
  tone: string;
  accent: string;
};

export type ActivityItem = {
  id: string;
  user: string;
  message: string;
  time: string;
  tone: string;
  accent: string;
  buttonLabel?: string;
  previewTone?: string;
};

export const stories: Story[] = [
  { id: 'you', name: 'Bạn', initials: 'E', tone: '#FFE1D6', accent: '#FF7A59', isOwn: true },
  { id: 'linh', name: 'Linh', initials: 'L', tone: '#FDE8C9', accent: '#F3A94E' },
  { id: 'mai', name: 'Mai', initials: 'M', tone: '#D9EFE1', accent: '#46B07D' },
  { id: 'khanh', name: 'Khanh', initials: 'K', tone: '#DDE7FF', accent: '#5B86FF' },
  { id: 'tram', name: 'Tram', initials: 'T', tone: '#F5DCF9', accent: '#D56AE0' },
  { id: 'bao', name: 'Bao', initials: 'B', tone: '#FFEAD8', accent: '#FF9052' },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    user: 'Linh Tran',
    handle: 'linhtran',
    location: 'District 1, Ho Chi Minh City',
    caption: 'Soft tailoring, tiny coffee cups, and a playlist that makes the whole room feel golden.',
    likes: '12.8k',
    comments: '128 bình luận',
    time: '23 phút trước',
    label: 'coffee club',
    tone: '#FFDCCD',
    accent: '#FF7A59',
  },
  {
    id: 'post-2',
    user: 'Mai Nguyen',
    handle: 'maing',
    location: 'Da Nang, Vietnam',
    caption: 'Keeping it breezy with sea-salt tones, oversized shirts, and a camera roll full of sun.',
    likes: '8.4k',
    comments: '73 bình luận',
    time: '1 giờ trước',
    label: 'seaside fit',
    tone: '#D8EFE8',
    accent: '#46B07D',
  },
  {
    id: 'post-3',
    user: 'Khanh Ho',
    handle: 'khanhho',
    location: 'Thu Duc, Ho Chi Minh City',
    caption: 'Late afternoon edits, mirrored halls, and a neutral palette that still knows how to pop.',
    likes: '15.1k',
    comments: '201 bình luận',
    time: '2 giờ trước',
    label: 'studio set',
    tone: '#E2E8FF',
    accent: '#5B86FF',
  },
];

export const searchTiles: SearchTile[] = [
  { id: 'search-1', label: 'city mood', height: 176, tone: '#FFE6D6', accent: '#FF8A5B' },
  { id: 'search-2', label: 'soft glam', height: 218, tone: '#F4DDF9', accent: '#D56AE0' },
  { id: 'search-3', label: 'new cafe', height: 154, tone: '#DFF1E7', accent: '#46B07D' },
  { id: 'search-4', label: 'street cast', height: 204, tone: '#DDE7FF', accent: '#5B86FF' },
  { id: 'search-5', label: 'golden edit', height: 230, tone: '#FDE8C9', accent: '#F3A94E' },
  { id: 'search-6', label: 'monochrome', height: 160, tone: '#F4EEE7', accent: '#A58E7A' },
  { id: 'search-7', label: 'travel set', height: 196, tone: '#D8EBF9', accent: '#3F9DD8' },
  { id: 'search-8', label: 'night out', height: 212, tone: '#FBE1EC', accent: '#EE5D96' },
];

export const reels: Reel[] = [
  {
    id: 'reel-1',
    title: 'Morning layers and neutral bags',
    creator: 'anna.studio',
    audio: 'sunset synth',
    views: '148k',
    likes: '12.3k',
    comments: '314',
    label: 'style edit',
    tone: '#FFD9C5',
    accent: '#FF7A59',
  },
  {
    id: 'reel-2',
    title: 'Tiny details for your cafe carousel',
    creator: 'mai.notes',
    audio: 'vinyl bloom',
    views: '96k',
    likes: '9.1k',
    comments: '201',
    label: 'camera tips',
    tone: '#D9EFE1',
    accent: '#46B07D',
  },
  {
    id: 'reel-3',
    title: 'Five frames that make a profile feel expensive',
    creator: 'khanhcuts',
    audio: 'soft focus loop',
    views: '173k',
    likes: '17.6k',
    comments: '428',
    label: 'profile refresh',
    tone: '#E0E6FF',
    accent: '#5B86FF',
  },
];

export const activitySections: { title: string; items: ActivityItem[] }[] = [
  {
    title: 'Hôm nay',
    items: [
      {
        id: 'activity-1',
        user: 'Mai',
        message: 'đã thích bài đăng mới của bạn.',
        time: '3 giờ',
        tone: '#FFE1D6',
        accent: '#FF7A59',
        previewTone: '#FFF1EA',
      },
      {
        id: 'activity-2',
        user: 'Nhi',
        message: 'muốn theo dõi bạn.',
        time: '5 giờ',
        tone: '#D9EFE1',
        accent: '#46B07D',
        buttonLabel: 'Theo dõi',
      },
      {
        id: 'activity-3',
        user: 'Bao',
        message: 'đã nhắc bạn trong một reel.',
        time: '6 giờ',
        tone: '#E0E6FF',
        accent: '#5B86FF',
        previewTone: '#EEF1FF',
      },
    ],
  },
  {
    title: 'Tuần này',
    items: [
      {
        id: 'activity-4',
        user: 'Tram',
        message: 'đã lưu bài viết về outfit của bạn.',
        time: '2 ngày',
        tone: '#F5DCF9',
        accent: '#D56AE0',
        previewTone: '#FAEDFD',
      },
      {
        id: 'activity-5',
        user: 'Khanh',
        message: 'đã chia sẻ reel của bạn cho bạn bè.',
        time: '3 ngày',
        tone: '#FDE8C9',
        accent: '#F3A94E',
        previewTone: '#FFF5DE',
      },
    ],
  },
];

export const profileHighlights: Story[] = [
  { id: 'highlight-1', name: 'Looks', initials: 'L', tone: '#FFE1D6', accent: '#FF7A59' },
  { id: 'highlight-2', name: 'Trips', initials: 'T', tone: '#D8EBF9', accent: '#3F9DD8' },
  { id: 'highlight-3', name: 'Studio', initials: 'S', tone: '#E0E6FF', accent: '#5B86FF' },
  { id: 'highlight-4', name: 'Mood', initials: 'M', tone: '#F5DCF9', accent: '#D56AE0' },
];

export const profileGrid: SearchTile[] = [
  { id: 'grid-1', label: 'neutral set', height: 112, tone: '#FFE6D6', accent: '#FF8A5B' },
  { id: 'grid-2', label: 'mirror day', height: 112, tone: '#DFF1E7', accent: '#46B07D' },
  { id: 'grid-3', label: 'soft blue', height: 112, tone: '#DDE7FF', accent: '#5B86FF' },
  { id: 'grid-4', label: 'city light', height: 112, tone: '#F4DDF9', accent: '#D56AE0' },
  { id: 'grid-5', label: 'lobby fit', height: 112, tone: '#FDE8C9', accent: '#F3A94E' },
  { id: 'grid-6', label: 'late brunch', height: 112, tone: '#F4EEE7', accent: '#A58E7A' },
  { id: 'grid-7', label: 'airport', height: 112, tone: '#D8EBF9', accent: '#3F9DD8' },
  { id: 'grid-8', label: 'pink hour', height: 112, tone: '#FBE1EC', accent: '#EE5D96' },
  { id: 'grid-9', label: 'after class', height: 112, tone: '#E7F5EA', accent: '#2DB46F' },
];
