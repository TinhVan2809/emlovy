"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import port from "@/api/api";
import PostCard from "./PostCard";
import { useSocket } from "@/context/SocketContext";

type PostMedia = {
  post_media_id: number;
  media_url: string;
  type: string;
};

type PostAuthor = {
  user_id: number;
  name: string;
  username: string;
};

type Post = {
  post_id: number;
  content: string;
  media?: PostMedia[];
  author?: PostAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
};

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { socket } = useSocket();

  const observerTarget = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(
        `${port}/api/posts?page=${pageNum}&limit=10`,
        {
          credentials: "include",
        },
      );
      const result = await response.json();
      const { items, pagination } = result.data;

      setPosts((prev) => (isInitial ? items : [...prev, ...items]));
      setHasMore(pagination.hasMore);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Gọi fetch mỗi khi `page` thay đổi (bỏ qua lần mount đầu vì page=1 đã fetch ở trên)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchPosts(page);
  }, [page, fetchPosts]);

  // Socket realtime
  useEffect(() => {
    if (!socket) return;
    const handler = (newPost: Post) => setPosts((prev) => [newPost, ...prev]);
    socket.on("post:created", handler);
    return () => {
      socket.off("post:created", handler);
    };
  }, [socket]);

  // IntersectionObserver — sentinel giờ LUÔN tồn tại trong DOM nên effect này chỉ cần chạy 1 lần
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0, rootMargin: "200px" }, // load sớm trước khi chạm đáy tuyệt đối
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full items-center">
      {loading && posts.length === 0
        ? [1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-full max-w-xl h-40 bg-gray-200 animate-pulse rounded-xl"
            />
          ))
        : posts.map((post) => <PostCard i={post} key={post.post_id} />)}

      {/* Sentinel: KHÔNG còn nằm trong nhánh `if (loading) return` nữa */}
      <div
        ref={observerTarget}
        className="h-10 w-full flex justify-center items-center"
      >
        {loadingMore && (
          <p className="text-sm text-gray-500">Loading more posts...</p>
        )}
        {!hasMore && !loading && (
          <p className="text-sm text-gray-500">No more posts to show.</p>
        )}
      </div>
    </div>
  );
}
