# Recommendation System - Emlovy Social Network

## ✅ Đã triển khai hoàn chỉnh!

Hệ thống gợi ý nội dung thông minh đã được tích hợp với đầy đủ các thành phần:

### 📦 Các file đã tạo:

1. **Core System**
   - `types/post.ts` - Type definitions
   - `utils/recommendation.ts` - Core algorithm & functions
   - `utils/recommendation.test.ts` - Unit tests

2. **State Management**
   - `hooks/useUserInterests.ts` - Hook quản lý user interests
   - `context/RecommendationContext.tsx` - Global context

3. **Components**
   - `components/RecommendedPostFeed.tsx` - Feed với recommendation
   - `components/InterestManager.tsx` - UI quản lý sở thích
   - `components/RecommendationDebug.tsx` - Debug visualization

4. **Pages**
   - `app/(main)/recommended/page.tsx` - Demo page

5. **Documentation**
   - `docs/recommendation-system.md` - Full documentation
   - `RECOMMENDATION_README.md` - Quick start guide

---

## 🎯 Algorithm Overview

```ts
// Tính điểm
function calculateScore(
  post: Post,
  interests: UserInterest[]
) {
  const interest =
    interests.find(i => i.category === post.category)?.score ?? 0;

  const engagement =
      post.like_count * 1
    + post.comment_count * 3
    + post.share_count * 5;

  const randomBonus = Math.random() * 10;

  return (
      interest * 10
    + engagement
    + randomBonus
  );
}
```

sau đó: 
```ts
posts
  .map(post => ({
    post,
    score: calculateScore(post, interests)
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 20);
```

---

## 📊 System Workflow

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
     Top 20 posts
```

---

## 🚀 Quick Start

### 1. Thêm Provider vào Layout

```tsx
// app/layout.tsx
import { RecommendationProvider } from "@/context/RecommendationContext";

export default function RootLayout({ children }) {
  return (
    <RecommendationProvider>
      {children}
    </RecommendationProvider>
  );
}
```

### 2. Sử dụng Component

```tsx
// app/(main)/page.tsx
import RecommendedPostFeed from "@/components/RecommendedPostFeed";
import InterestManager from "@/components/InterestManager";

export default function Home() {
  return (
    <>
      <InterestManager />
      <RecommendedPostFeed />
    </>
  );
}
```

### 3. Test ngay

Truy cập: `http://localhost:3000/recommended`

---

## 📚 Documentation

- **Quick Start**: Xem `RECOMMENDATION_README.md`
- **Full Docs**: Xem `docs/recommendation-system.md`

---

## 🎮 Features

✅ Personalization based on user interests  
✅ Engagement-based ranking (likes, comments, shares)  
✅ Exploration factor (randomness)  
✅ LocalStorage persistence  
✅ Real-time updates via Socket.io  
✅ Debug visualization tool  
✅ User preference management UI  
✅ Infinite scroll support  
✅ TypeScript support  
✅ Unit tests included  

---

## 🔧 Tùy chỉnh

### Thay đổi công thức:

```tsx
// utils/recommendation.ts
const engagement =
  post.like_count * 2 +      // Change weights
  post.comment_count * 5 +
  post.share_count * 10;
```

### Thêm time decay:

```tsx
const hoursSincePosted = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
const timeDecay = Math.max(0, 1 - hoursSincePosted / 168); // 7 days
return score * timeDecay;
```

---

Made with ❤️ by Kiro
