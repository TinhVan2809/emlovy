"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * Callback được gọi khi scroll đến cuối
   */
  onLoadMore: () => void;

  /**
   * Có còn dữ liệu để load không
   */
  hasMore: boolean;

  /**
   * Đang loading không
   */
  isLoading: boolean;

  /**
   * Khoảng cách từ bottom để trigger (pixels)
   * @default 100
   */
  rootMargin?: string;

  /**
   * Threshold để xác định intersecting (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Enable/disable infinite scroll
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook để implement infinite scroll với Intersection Observer
 * 
 * @example
 * ```tsx
 * function Feed() {
 *   const [posts, setPosts] = useState<Post[]>([]);
 *   const [hasMore, setHasMore] = useState(true);
 *   const [isLoading, setIsLoading] = useState(false);
 * 
 *   const loadMore = async () => {
 *     setIsLoading(true);
 *     const newPosts = await fetchPosts(page);
 *     setPosts(prev => [...prev, ...newPosts]);
 *     setHasMore(newPosts.length > 0);
 *     setIsLoading(false);
 *   };
 * 
 *   const observerTarget = useInfiniteScroll({
 *     onLoadMore: loadMore,
 *     hasMore,
 *     isLoading,
 *   });
 * 
 *   return (
 *     <div>
 *       {posts.map(post => <PostCard key={post.id} post={post} />)}
 *       <div ref={observerTarget} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !isLoading && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading, enabled]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element || !enabled) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, rootMargin, enabled]);

  return observerTarget;
}

/**
 * Hook phát hiện scroll direction
 */
export function useScrollDirection() {
  const lastScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useRef<'up' | 'down' | 'idle'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      if (Math.abs(difference) > 50) {
        setScrollDirection.current = difference > 0 ? 'down' : 'up';
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollDirection.current;
}

/**
 * Hook để track element visibility
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useCallback(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options, setIsInView]);

  return { ref, isInView };
}
