# Recommendation System Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ RecommendedPost  │  │  InterestManager │  │ Recommendation│  │
│  │      Feed        │  │                  │  │    Debug      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    RecommendationContext                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              useUserInterests Hook                       │    │
│  │                                                          │    │
│  │  • Load interests from localStorage/API                 │    │
│  │  • Update interests                                     │    │
│  │  • Reset to defaults                                    │    │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                    Data Layer                                    │
│                         │                                        │
│  ┌──────────────────────┼──────────────────────────────┐        │
│  │       React Query (TanStack Query)                  │        │
│  │                      │                               │        │
│  │  • Infinite scroll pagination                       │        │
│  │  • Cache management                                 │        │
│  │  • Real-time updates via Socket.io                  │        │
│  └──────────────────────┼──────────────────────────────┘        │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                 Recommendation Engine                            │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────┐        │
│  │     utils/recommendation.ts                         │        │
│  │                                                      │        │
│  │  ┌────────────────────────────────────────────┐    │        │
│  │  │  calculateScore(post, interests)           │    │        │
│  │  │                                             │    │        │
│  │  │  score = interest×10 + engagement + random │    │        │
│  │  └────────────────────────────────────────────┘    │        │
│  │                                                      │        │
│  │  ┌────────────────────────────────────────────┐    │        │
│  │  │  rankPosts(posts, interests, topN)         │    │        │
│  │  │                                             │    │        │
│  │  │  • Map posts to scores                     │    │        │
│  │  │  • Sort by score DESC                      │    │        │
│  │  │  • Slice top N                             │    │        │
│  │  └────────────────────────────────────────────┘    │        │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                   Storage Layer                                  │
│                         │                                        │
│  ┌──────────────────────┼──────────────────────────┐           │
│  │              localStorage                       │           │
│  │                      │                          │           │
│  │  Key: "userInterests"                          │           │
│  │  Value: UserInterest[]                         │           │
│  └──────────────────────┼──────────────────────────┘           │
│                         │                                       │
│  ┌──────────────────────┼──────────────────────────┐           │
│  │         Backend API (Optional)                  │           │
│  │                      │                          │           │
│  │  GET  /api/user/interests                      │           │
│  │  POST /api/user/interests                      │           │
│  └──────────────────────┼──────────────────────────┘           │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      Backend Server                              │
│                                                                  │
│  GET /api/posts?page=1&limit=10                                 │
│  → Returns: { items: Post[], pagination: {...} }                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Initial Load

```
User opens app
     │
     ├─> Load user interests (localStorage)
     │       └─> Default interests if not found
     │
     ├─> Fetch posts (page 1)
     │       └─> Backend: GET /api/posts?page=1&limit=10
     │
     ├─> Calculate scores for each post
     │       └─> calculateScore(post, interests)
     │
     ├─> Sort posts by score
     │       └─> posts.sort((a,b) => b.score - a.score)
     │
     └─> Render RecommendedPostFeed
```

### 2. Scroll for More

```
User scrolls to bottom
     │
     ├─> IntersectionObserver triggers
     │
     ├─> Fetch next page
     │       └─> Backend: GET /api/posts?page=2&limit=10
     │
     ├─> Merge with existing posts
     │
     ├─> Re-calculate scores for ALL posts
     │       └─> Ensures consistent ranking
     │
     ├─> Re-sort all posts
     │
     └─> Render updated feed
```

### 3. Update Interests

```
User adjusts interest slider
     │
     ├─> updateInterest(category, newScore)
     │
     ├─> Save to localStorage
     │       └─> localStorage.setItem("userInterests", ...)
     │
     ├─> Optional: POST to backend
     │       └─> Backend: POST /api/user/interests
     │
     ├─> Re-calculate ALL post scores
     │       └─> useMemo triggers recomputation
     │
     ├─> Re-sort posts
     │
     └─> Feed updates immediately
```

### 4. Real-time Post Created

```
New post created by another user
     │
     ├─> Backend emits Socket event
     │       └─> socket.emit("post:created", newPost)
     │
     ├─> Client receives event
     │       └─> socket.on("post:created", handler)
     │
     ├─> Insert post to cache (top of first page)
     │       └─> queryClient.setQueryData(...)
     │
     ├─> Re-calculate scores with new post
     │
     ├─> Re-sort all posts
     │
     └─> New post appears in correct position
```

---

## 📊 Score Calculation Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                    calculateScore()                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: post, interests[]                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Step 1: Find matching interest                    │    │
│  │  ─────────────────────────────────────────────     │    │
│  │  interest = interests.find(                        │    │
│  │    i => i.category === post.category               │    │
│  │  )?.score ?? 0                                     │    │
│  │                                                     │    │
│  │  Example:                                          │    │
│  │    post.category = "technology"                    │    │
│  │    interest.score = 8                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Step 2: Calculate engagement score                │    │
│  │  ───────────────────────────────────────────       │    │
│  │  engagement =                                      │    │
│  │    post.like_count    × 1 +                       │    │
│  │    post.comment_count × 3 +                       │    │
│  │    post.share_count   × 5                         │    │
│  │                                                     │    │
│  │  Example:                                          │    │
│  │    likes: 50    → 50  × 1 = 50                    │    │
│  │    comments: 10 → 10  × 3 = 30                    │    │
│  │    shares: 5    → 5   × 5 = 25                    │    │
│  │    engagement = 105                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Step 3: Add exploration factor                    │    │
│  │  ───────────────────────────────────────────       │    │
│  │  randomBonus = Math.random() × 10                 │    │
│  │                                                     │    │
│  │  Example:                                          │    │
│  │    randomBonus = 6.3                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Step 4: Combine all factors                       │    │
│  │  ─────────────────────────────────────────────     │    │
│  │  score = interest×10 + engagement + randomBonus   │    │
│  │                                                     │    │
│  │  Example:                                          │    │
│  │    8×10 + 105 + 6.3 = 191.3                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Output: 191.3                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
App
 └─ RecommendationProvider
     │
     ├─ Page: /recommended
     │   │
     │   ├─ InterestManager
     │   │   └─ Category sliders (0-10)
     │   │
     │   ├─ Story
     │   │
     │   └─ RecommendedPostFeed
     │       │
     │       ├─ useInfiniteQuery (posts data)
     │       │
     │       ├─ useUserInterests (interests)
     │       │
     │       ├─ useMemo (ranked posts)
     │       │
     │       ├─ PostCard (foreach post)
     │       │
     │       └─ IntersectionObserver (infinite scroll)
     │
     └─ RecommendationDebug (optional)
         └─ Score breakdown visualization
```

---

## 🔐 Type System

```typescript
┌─────────────────────────────────────────────────────────────┐
│                      Core Types                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Post                                                        │
│  ├─ post_id: number                                         │
│  ├─ content: string                                         │
│  ├─ media?: PostMedia[]                                     │
│  ├─ author?: PostAuthor                                     │
│  ├─ created_at: string                                      │
│  ├─ like_count: number                                      │
│  ├─ comment_count: number                                   │
│  ├─ share_count: number                                     │
│  └─ category?: string        ← Important for ranking!       │
│                                                              │
│  UserInterest                                               │
│  ├─ category: string                                        │
│  └─ score: number (0-10)                                    │
│                                                              │
│  ScoredPost                                                 │
│  ├─ post: Post                                              │
│  └─ score: number                                           │
│                                                              │
│  PostsPage                                                  │
│  ├─ items: Post[]                                           │
│  └─ pagination: { hasMore: boolean }                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Performance Optimizations

### 1. Memoization

```tsx
const recommendedPosts = useMemo(() => {
  return rankPosts(allPosts, interests, allPosts.length);
}, [allPosts, interests]);
```

### 2. Incremental Loading

- Fetch 10 posts at a time
- Rank only fetched posts (not all posts in DB)
- Pagination prevents memory issues

### 3. Cache Management

```tsx
queryClient.setQueryData(["posts"], (old) => {
  // Merge new post without refetching
  return mergeNewPost(old, newPost);
});
```

### 4. LocalStorage for Persistence

- Save interests locally
- No API call on every load
- Sync to backend in background

---

## 🧪 Testing Strategy

```
Unit Tests
├─ calculateScore()
│  ├─ Test interest matching
│  ├─ Test engagement calculation
│  ├─ Test random bonus range
│  └─ Test edge cases
│
├─ rankPosts()
│  ├─ Test sorting order
│  ├─ Test topN limit
│  ├─ Test empty arrays
│  └─ Test boundary values
│
Integration Tests
├─ RecommendedPostFeed
│  ├─ Test initial load
│  ├─ Test infinite scroll
│  ├─ Test real-time updates
│  └─ Test interest updates
│
└─ InterestManager
   ├─ Test slider updates
   ├─ Test localStorage persistence
   └─ Test reset functionality
```

---

## 🚀 Deployment Checklist

- [ ] Add RecommendationProvider to root layout
- [ ] Ensure posts have `category` field in backend
- [ ] Test localStorage permissions
- [ ] Configure Socket.io for real-time updates
- [ ] Set up analytics for score tracking (optional)
- [ ] Add backend API for interest persistence (optional)
- [ ] Run unit tests
- [ ] Test in production-like environment
- [ ] Monitor performance metrics
- [ ] Set up A/B testing (optional)

---

## 📈 Future Enhancements

1. **Machine Learning Integration**
   - Train ML model on user behavior
   - Predict interest scores automatically
   - Collaborative filtering

2. **Advanced Features**
   - Time decay (recent posts prioritized)
   - Diversity injection (avoid filter bubbles)
   - Explicit feedback (thumbs up/down)
   - Follow-based boosting
   - Trending topics detection

3. **Analytics**
   - Track click-through rates
   - Measure engagement by score range
   - A/B test different formulas
   - User satisfaction surveys

4. **Optimization**
   - Server-side ranking for scale
   - Edge caching
   - Pre-computed scores
   - Batch processing

---

Made with ❤️ by Kiro
