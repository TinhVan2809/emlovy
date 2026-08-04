# 🚀 Hướng Dẫn Lazy Loading - Frontend (Next.js & React Native)

## Mục Lục

1. [Frontend Next.js (Web)](#frontend-nextjs-web)
2. [Frontend React Native (Mobile)](#frontend-react-native-mobile)
3. [Best Practices Chung](#best-practices-chung)

---

## Frontend Next.js (Web)

### 1. Image Lazy Loading với next/image

#### ✅ Đã có sẵn trong code
Next.js `<Image>` component tự động lazy load images:

```tsx
import Image from "next/image";

<Image
  src={`${port}${m.media_url}`}
  alt="post_url"
  fill
  className="object-contain"
  // Next.js tự động lazy load, không cần thêm gì
/>
```

#### 🎯 Tối ưu hơn với Priority và Sizes

```tsx
import Image from "next/image";

// Ảnh trên viewport đầu tiên (trên fold) - ưu tiên tải trước
<Image
  src={avatarUrl}
  alt="avatar"
  fill
  priority  // Tải ngay lập tức, không lazy
  sizes="(max-width: 768px) 32px, 48px"  // Responsive sizing
  className="rounded-full object-cover"
/>

// Ảnh dưới viewport - lazy load
<Image
  src={postImage}
  alt="post"
  fill
  loading="lazy"  // Mặc định, có thể bỏ qua
  sizes="(max-width: 768px) 100vw, 800px"
  className="object-cover"
/>
```

### 2. Component Lazy Loading với next/dynamic

#### Lazy load Comments Sheet
```tsx
// app/page.tsx hoặc component cha
import dynamic from 'next/dynamic';

// Lazy load CommentsSheet - chỉ tải khi cần
const CommentsSheet = dynamic(() => import('@/components/comments-sheet'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  ),
  ssr: false  // Không render server-side (vì modal client-only)
});

// Sử dụng
<CommentsSheet 
  onClose={handleCloseComments}
  post={selectedCommentPost}
  kind="post"
/>
```

#### Lazy load Modal & Heavy Components

```tsx
// components/lazy-components.tsx
import dynamic from 'next/dynamic';

// Lazy load các modal
export const PostComposerModal = dynamic(
  () => import('./post-composer-modal'),
  { ssr: false }
);

export const StoryComposerModal = dynamic(
  () => import('./story-composer-modal'),
  { ssr: false }
);

// Lazy load chart/visualization (nặng)
export const AnalyticsChart = dynamic(
  () => import('./analytics-chart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Lazy load video player
export const VideoPlayer = dynamic(
  () => import('./video-player'),
  {
    ssr: false,
    loading: () => <VideoPlayerSkeleton />
  }
);
```

### 3. Virtual Scrolling với @tanstack/react-virtual

Bạn đã có `@tanstack/react-virtual` trong package.json! Đây là cách sử dụng:

```tsx
// components/virtual-feed.tsx
"use client";

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import PostCard from './post-card';

export function VirtualFeed({ posts }: { posts: Post[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 600, // Ước lượng chiều cao mỗi post
    overscan: 3, // Render thêm 3 items trên/dưới viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-screen overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Intersection Observer cho Images

Thay thế hoặc bổ sung cho next/image trong trường hợp custom:

```tsx
// hooks/use-lazy-image.ts
"use client";

import { useEffect, useRef, useState } from 'react';

export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Tải trước 200px
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  return { imgRef, imageSrc, isLoaded, setIsLoaded };
}

// Sử dụng
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { imgRef, imageSrc, isLoaded, setIsLoaded } = useLazyImage(src);

  return (
    <div ref={imgRef} className="relative w-full h-64 bg-gray-100">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
```

### 5. Route-based Code Splitting (Tự động)

Next.js tự động chia code theo route:

```tsx
// app/profile/page.tsx - được split tự động
export default function ProfilePage() {
  return <ProfileContent />;
}

// app/settings/page.tsx - được split tự động
export default function SettingsPage() {
  return <SettingsContent />;
}
```

### 6. Skeleton Loading UI

```tsx
// components/skeletons.tsx
export function PostSkeleton() {
  return (
    <div className="animate-pulse p-4 border-b">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="mt-3 h-64 bg-gray-200 rounded-lg" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 7. Infinite Scroll tối ưu

```tsx
// hooks/use-infinite-scroll.ts
"use client";

import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px', // Trigger trước 100px
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  return observerTarget;
}

// Sử dụng
function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    // Fetch more posts...
    setIsLoading(false);
  };

  const observerTarget = useInfiniteScroll(loadMore, hasMore, isLoading);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isLoading && <Spinner />}
      </div>
    </div>
  );
}
```

---

## Frontend React Native (Mobile)

### 1. FlatList Optimization (Đã có trong code ✅)

```tsx
// app/(tabs)/index.tsx - BẠN ĐÃ LÀM TỐT!
<FlatList
  data={posts}
  keyExtractor={keyExtractor}
  renderItem={renderPostItem}
  
  // Lazy loading configurations
  initialNumToRender={3}              // Chỉ render 3 items đầu
  maxToRenderPerBatch={3}             // Render thêm 3 items mỗi batch
  windowSize={5}                      // Giữ 5 màn hình trong memory
  updateCellsBatchingPeriod={100}     // Batch updates mỗi 100ms
  
  // Remove clipped views (quan trọng!)
  removeClippedSubviews={Platform.OS === "android"}
  
  // Pagination
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.55}        // Trigger ở 55% từ bottom
  
  // Pull to refresh
  refreshControl={refreshControl}
  
  // Performance
  getItemLayout={getItemLayout}       // Nếu biết chính xác height
  extraData={listExtraData}          // Force re-render khi cần
/>
```

### 2. expo-image cho Lazy Loading (Bạn đã cài!)

```tsx
// components/lazy-image.tsx
import { Image } from 'expo-image';
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LazyImageProps {
  source: { uri: string } | number;
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill';
  blurhash?: string;
}

export function LazyImage({ 
  source, 
  style, 
  contentFit = 'cover',
  blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={200}              // Fade in animation
        placeholder={{ blurhash }}    // Blur placeholder
        onLoad={() => setIsLoading(false)}
        cachePolicy="memory-disk"     // Cache strategy
        priority="normal"             // Hoặc 'high' cho ảnh quan trọng
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 3. Memo & useMemo cho Components (Đã có ✅)

```tsx
// Bạn đã làm tốt với memo!
const FeedPostItem = memo(function FeedPostItem({ post, ...props }) {
  return <PostCard post={post} {...props} />;
});

// useMemo cho values không đổi
const listHeader = useMemo(
  () => <FeedHeader count={pagination?.total || 0} />,
  [pagination?.total]
);

const listFooter = useMemo(
  () => isLoadingMore ? <ActivityIndicator /> : null,
  [isLoadingMore]
);
```

### 4. Video Preloading & Caching (Tuyệt vời! ✅)

```tsx
// services/video-cache.ts - BẠN ĐÃ CÓ TRONG CODE REELS!
import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}videos/`;

export async function preloadVideo(url: string): Promise<string> {
  const filename = url.split('/').pop() || `video-${Date.now()}.mp4`;
  const localPath = `${CACHE_DIR}${filename}`;

  // Kiểm tra đã cache chưa
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (fileInfo.exists) {
    return localPath;
  }

  // Download và cache
  await FileSystem.downloadAsync(url, localPath);
  return localPath;
}

export async function getCachedVideoUrl(url: string): Promise<string> {
  const filename = url.split('/').pop() || `video-${Date.now()}.mp4`;
  const localPath = `${CACHE_DIR}${filename}`;

  const fileInfo = await FileSystem.getInfoAsync(localPath);
  return fileInfo.exists ? localPath : url;
}

// Sử dụng trong component
useEffect(() => {
  if (activeIndex < 0 || reels.length === 0) return;

  // Preload videos lân cận
  for (
    let idx = activeIndex - 1;
    idx <= activeIndex + 2;
    idx += 1
  ) {
    if (idx < 0 || idx >= reels.length) continue;
    
    const videoUrl = getReelVideoUrl(reels[idx]);
    if (videoUrl) {
      preloadVideo(videoUrl).catch(console.error);
    }
  }
}, [activeIndex, reels]);
```

### 5. Conditional Mounting (Đã có trong Reels ✅)

```tsx
// Chỉ mount video khi gần viewport
const shouldMountVideo =
  activeIndex >= 0 &&
  index >= activeIndex - REEL_MOUNT_WINDOW_BEHIND &&
  index <= activeIndex + REEL_MOUNT_WINDOW_AHEAD;

return (
  <View>
    {shouldMountVideo ? (
      <VideoView player={player} />
    ) : (
      <Image source={{ uri: thumbnailUri }} />
    )}
  </View>
);
```

### 6. Scroll-based Buffer Management (Advanced ✅)

```tsx
// Điều chỉnh buffer dựa trên hướng scroll - BẠN ĐÃ CÓ!
const getBufferMode = useCallback(
  (index: number): 'heavy' | 'light' => {
    const distanceFromActive = index - activeIndex;

    if (distanceFromActive === 0) {
      return 'heavy'; // Video đang xem - buffer nhiều
    }

    if (scrollDirectionState === 'up') {
      // Scroll lên - ưu tiên buffer video phía trên
      return distanceFromActive === -1 ? 'heavy' : 'light';
    }

    // Scroll xuống - ưu tiên buffer video phía dưới
    return distanceFromActive > 0 ? 'heavy' : 'light';
  },
  [activeIndex, scrollDirectionState]
);

// Sử dụng buffer mode
player.bufferOptions = {
  preferredForwardBufferDuration: bufferMode === 'heavy' ? 5 : 2
};
```

### 7. React.lazy cho Code Splitting

```tsx
// App.tsx hoặc navigation
import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lazy load màn hình nặng
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// Sử dụng
function AppNavigator() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Stack.Navigator>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
```

### 8. Optimized Scroll Handler với Reanimated

```tsx
// Sử dụng worklet để xử lý scroll trên UI thread
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue,
  runOnJS 
} from 'react-native-reanimated';

function OptimizedFeed() {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      
      // Detect scroll direction
      const diff = scrollY.value - lastScrollY.value;
      if (Math.abs(diff) > 50) {
        runOnJS(handleScrollDirection)(diff > 0 ? 'down' : 'up');
      }
      lastScrollY.value = scrollY.value;
    },
  });

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      data={items}
      renderItem={renderItem}
    />
  );
}
```

---

## Best Practices Chung

### 1. Measure Performance

```tsx
// React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number,
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

<Profiler id="FeedList" onRender={onRenderCallback}>
  <FeedList />
</Profiler>
```

### 2. Debounce Search & Input

```tsx
// hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // Gọi API search
      searchApi(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 3. Prefetch Data

```tsx
// Prefetch khi hover (Web) hoặc onPress (Mobile)
function PostCard({ post, onNavigate }: Props) {
  const prefetchComments = () => {
    // Prefetch comments data
    queryClient.prefetchQuery({
      queryKey: ['comments', post.post_id],
      queryFn: () => fetchComments(post.post_id),
    });
  };

  return (
    <div 
      onMouseEnter={prefetchComments} // Web
      onTouchStart={prefetchComments}  // Mobile
    >
      {/* Post content */}
    </div>
  );
}
```

### 4. Bundle Size Analysis

```bash
# Next.js
npm run build
# Xem .next/analyze/client.html

# React Native
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res --sourcemap-output sourcemap.js
```

### 5. Lazy Load Fonts

```tsx
// Next.js - app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Hiển thị fallback font trước
  preload: true,
});

// React Native - App.tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Custom-Font': require('./assets/fonts/custom.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <AppContent />;
}
```

---

## 📊 Performance Metrics

### Web (Next.js)
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTI (Time to Interactive)**: < 3.8s

### Mobile (React Native)
- **Startup Time**: < 1s
- **JS Thread FPS**: > 55
- **UI Thread FPS**: > 55
- **Memory Usage**: < 200MB

---

## 🎯 Checklist Tổng Hợp

### Next.js
- ✅ Sử dụng next/image cho lazy loading
- ✅ Dynamic import cho components nặng
- ✅ Virtual scrolling cho danh sách dài
- ✅ Skeleton loading UI
- ✅ Infinite scroll với Intersection Observer
- ✅ Code splitting theo route (tự động)

### React Native
- ✅ FlatList với windowSize, initialNumToRender
- ✅ expo-image với blurhash placeholder
- ✅ memo() cho components
- ✅ useMemo/useCallback cho values/functions
- ✅ removeClippedSubviews={true}
- ✅ getItemLayout nếu biết height
- ✅ Video preloading & caching
- ✅ Conditional mounting dựa trên viewport

---

## 🚀 Kết Luận

Code của bạn đã có nhiều optimization tốt! Những điểm cần cải thiện:

1. **Next.js**: Thêm dynamic import cho modal components
2. **React Native**: Đã tối ưu rất tốt, có thể thêm image blurhash
3. **Cả hai**: Implement skeleton loading UI toàn diện

Lazy loading giúp:
- ⚡ Giảm initial bundle size 40-60%
- 🎨 FPS ổn định 55-60
- 📉 Memory usage giảm 30-50%
- 🚀 Time to Interactive giảm 50%+
