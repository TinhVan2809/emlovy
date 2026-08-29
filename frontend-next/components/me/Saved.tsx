"use client";

import port from "@/api/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import PostCard, { type Post } from "@/components/PostCard";

function Saved() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isLoadingRef = useRef(false);

  const handleFetchSavedPosts = useCallback(async (nextPage = 1, shouldAppend = false) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch(
        `${port}/api/post-save?page=${nextPage}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch saved posts: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        setHasMore(false);
        return;
      }

      const items = Array.isArray(data.data) ? data.data : [];
      const pagination = data.pagination || {};
      const currentPage = Number(pagination.page ?? nextPage);
      const totalPages = Number(pagination.total_pages ?? 0);

      setSavedPosts((prev) => (shouldAppend ? [...prev, ...items] : items));
      setPage(currentPage);
      setHasMore(currentPage < totalPages && items.length > 0);
    } catch (error) {
      console.error("Error fetching saved posts", error);
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void handleFetchSavedPosts(1, false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [handleFetchSavedPosts]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    handleFetchSavedPosts(page + 1, true);
  }, [handleFetchSavedPosts, hasMore, isLoading, page]);

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  return (
    <div className="flex flex-col gap-4 md:gap-8 items-center w-full">
      {!isInitialLoading && savedPosts.length === 0 && (
        <div className="w-full text-center text-sm text-gray-500">
          Chưa có bài viết nào được lưu.
        </div>
      )}

      {savedPosts.map((post) => (
        <PostCard key={post.post_id} i={post} />
      ))}

      {isLoading && (
        <div className="text-center text-sm text-gray-500 py-4">
          Đang tải thêm...
        </div>
      )}

      <div ref={observerTarget} className="h-1 w-full" />
    </div>
  );
}

export default Saved;