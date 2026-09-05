# Recommendation System Documentation

## Tổng quan

Hệ thống gợi ý nội dung (Recommendation System) được thiết kế để cá nhân hóa trải nghiệm người dùng bằng cách xếp hạng các bài đăng dựa trên:

1. **Personalization** - Sở thích cá nhân của người dùng
2. **Engagement** - Mức độ tương tác (likes, comments, shares)
3. **Randomness** - Yếu tố khám phá (exploration factor)

## Workflow

```
          Posts
            ↓
     Calculate Score
            ↓
   ┌────────┴────────┐
   ↓                 ↓
Personalization   Randomness
   ↓                 ↓
   └────────┬────────┘
            ↓
          Ranking
            ↓
     Top N posts
```

## Score Calculation Formula

```typescript
score = interest × 10 + engagement + randomBonus

where:
  interest = User's interest score for post category (0-10)
  engagement = likes × 1 + comments × 3 + shares × 5
  randomBonus = random(0-10)
```

### Giải thích công thức:

- **Interest × 10**: Trọng số chính, phản ánh sở thích người dùng
  - Interest score từ 0-10 → Contribution từ 0-100
  
- **Engagement**: Đánh giá mức độ tương tác
  - Likes: Weight = 1 (tương tác thấp nhất)
  - Comments: Weight = 3 (tương tác trung bình)
  - Shares: Weight = 5 (tương tác cao nhất)
  
- **Random Bonus (0-10)**: Thêm yếu tố ngẫu nhiên
  - Giúp khám phá nội dung mới
  - Tránh echo chamber
  - ~10% variance trong kết quả

## Cấu trúc File

```
frontend-next/
├── types/
│   └── post.ts                    # Type definitions
├── utils/
│   └── recommendation.ts          # Core algorithm
├── hooks/
│   └── useUserInterests.ts        # Interest management
├── context/
│   └── RecommendationContext.tsx  # Global state
├── components/
│   ├── RecommendedPostFeed.tsx    # Main feed component
│   ├── InterestManager.tsx        # User preference UI
│   └── RecommendationDebug.tsx    # Debug visualization
└── app/(main)/recommended/
    └── page.tsx                   # Demo page
```

## Cách sử dụng

### 1. Setup Provider (Root Layout)

```tsx
import { RecommendationProvider } from "@/context/RecommendationContext";

export default function RootLayout({ children }) {
  return (
    <RecommendationProvider>
      {children}
    </RecommendationProvider>
  );
}
```

### 2. Sử dụng RecommendedPostFeed

```tsx
import RecommendedPostFeed from "@/components/RecommendedPostFeed";

export default function HomePage() {
  return <RecommendedPostFeed />;
}
```

### 3. Quản lý User Interests

```tsx
import InterestManager from "@/components/InterestManager";

export default function SettingsPage() {
  return <InterestManager />;
}
```

### 4. Access Recommendation Context

```tsx
import { useRecommendation } from "@/context/RecommendationContext";

function MyComponent() {
  const { interests, updateInterest, resetInterests } = useRecommendation();
  
  return (
    <div>
      {interests.map(interest => (
        <div key={interest.category}>
          {interest.category}: {interest.score}
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### `calculateScore(post, interests)`

Tính điểm gợi ý cho một bài đăng.

**Parameters:**
- `post: Post` - Bài đăng cần tính điểm
- `interests: UserInterest[]` - Danh sách sở thích người dùng

**Returns:** `number` - Điểm gợi ý (0-∞)

### `rankPosts(posts, interests, topN?)`

Xếp hạng và lấy top N bài đăng.

**Parameters:**
- `posts: Post[]` - Danh sách bài đăng
- `interests: UserInterest[]` - Sở thích người dùng
- `topN?: number` - Số lượng bài đăng trả về (default: 20)

**Returns:** `Post[]` - Danh sách bài đăng đã sắp xếp

### `getScoredPosts(posts, interests)`

Lấy danh sách bài đăng kèm điểm số (dùng cho debug).

**Parameters:**
- `posts: Post[]` - Danh sách bài đăng
- `interests: UserInterest[]` - Sở thích người dùng

**Returns:** `ScoredPost[]` - Array of `{ post, score }`

## Types

### `Post`

```typescript
type Post = {
  post_id: number;
  content: string;
  media?: PostMedia[];
  author?: PostAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  category?: string;  // Important for personalization!
};
```

### `UserInterest`

```typescript
type UserInterest = {
  category: string;  // e.g., "technology", "sports"
  score: number;     // 0-10
};
```

### `ScoredPost`

```typescript
type ScoredPost = {
  post: Post;
  score: number;
};
```

## Storage

User interests được lưu trong **localStorage** với key `userInterests`:

```json
[
  { "category": "technology", "score": 8 },
  { "category": "sports", "score": 3 },
  { "category": "lifestyle", "score": 6 }
]
```

## Default Categories

```typescript
const DEFAULT_INTERESTS = [
  { category: "technology", score: 5 },
  { category: "lifestyle", score: 3 },
  { category: "entertainment", score: 4 },
  { category: "sports", score: 2 },
  { category: "news", score: 3 },
];
```

## Debug Mode

Sử dụng `RecommendationDebug` component để visualize scores:

```tsx
import RecommendationDebug from "@/components/RecommendationDebug";

function Feed() {
  const posts = usePosts(); // Your posts hook
  
  return (
    <>
      <PostFeed posts={posts} />
      <RecommendationDebug posts={posts} />
    </>
  );
}
```

## Tùy chỉnh Algorithm

### Thay đổi trọng số engagement:

```typescript
// In utils/recommendation.ts
const engagement =
  post.like_count * 2 +      // Tăng weight của likes
  post.comment_count * 5 +   // Tăng weight của comments
  post.share_count * 10;     // Tăng weight của shares
```

### Thay đổi random factor:

```typescript
// Giảm randomness
const randomBonus = Math.random() * 5;  // 0-5 instead of 0-10

// Loại bỏ randomness hoàn toàn
const randomBonus = 0;
```

### Thêm time decay:

```typescript
function calculateScore(post: Post, interests: UserInterest[]) {
  const interest = interests.find(i => i.category === post.category)?.score ?? 0;
  const engagement = post.like_count * 1 + post.comment_count * 3 + post.share_count * 5;
  const randomBonus = Math.random() * 10;
  
  // Time decay: Bài cũ giảm điểm
  const hoursSincePosted = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.max(0, 1 - hoursSincePosted / 168); // Giảm dần trong 7 ngày
  
  return (interest * 10 + engagement + randomBonus) * timeDecay;
}
```

## Tích hợp Backend (Optional)

Để lưu user interests trên server:

```typescript
// hooks/useUserInterests.ts

useEffect(() => {
  const loadInterests = async () => {
    const response = await fetch(`${port}/api/user/interests`, {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      setInterests(data.interests);
    }
  };
  loadInterests();
}, []);

// Update interest on server
const updateInterest = async (category: string, score: number) => {
  await fetch(`${port}/api/user/interests`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, score }),
  });
  
  setInterests(prev => /* ... */);
};
```

## Performance Considerations

1. **Memoization**: `useMemo` được sử dụng để tránh tính toán lại score không cần thiết
2. **Lazy Loading**: Chỉ rank posts đã fetch, không fetch tất cả posts một lúc
3. **Incremental Updates**: Socket updates được merge vào cache, không refetch toàn bộ

## Testing

```typescript
// Example test cases
describe("calculateScore", () => {
  const interests = [
    { category: "tech", score: 8 },
    { category: "sports", score: 3 },
  ];

  it("should prioritize high interest posts", () => {
    const techPost = { category: "tech", like_count: 0, comment_count: 0, share_count: 0 };
    const sportsPost = { category: "sports", like_count: 0, comment_count: 0, share_count: 0 };
    
    // Tech post should have higher base score (8*10 vs 3*10)
    expect(calculateScore(techPost, interests)).toBeGreaterThan(
      calculateScore(sportsPost, interests)
    );
  });

  it("should reward high engagement", () => {
    const highEngagement = { category: "tech", like_count: 100, comment_count: 50, share_count: 20 };
    const lowEngagement = { category: "tech", like_count: 1, comment_count: 0, share_count: 0 };
    
    expect(calculateScore(highEngagement, interests)).toBeGreaterThan(
      calculateScore(lowEngagement, interests)
    );
  });
});
```

## Future Enhancements

1. **Machine Learning**: Train model dựa trên user behavior
2. **Collaborative Filtering**: Gợi ý dựa trên users tương tự
3. **Content-Based Filtering**: Phân tích nội dung bài đăng
4. **A/B Testing**: Test different scoring algorithms
5. **Real-time Updates**: Update scores based on live interactions
6. **User Feedback**: Explicit feedback (thumbs up/down)

## Troubleshooting

### Posts không được rank đúng

- Kiểm tra `post.category` có giá trị chưa
- Verify `interests` array có đúng categories không
- Check console để xem scores

### LocalStorage không persist

- Kiểm tra browser privacy settings
- Verify localStorage permissions
- Check for quota exceeded errors

### Performance issues

- Reduce number of posts ranked at once
- Increase pagination limit
- Consider server-side ranking

## License

MIT
