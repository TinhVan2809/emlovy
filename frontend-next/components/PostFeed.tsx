"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

type PostsPage = {
  items: Post[];
  pagination: { hasMore: boolean };
};

async function fetchPostsPage({
  pageParam,
}: {
  pageParam: number;
}): Promise<PostsPage> {
  const res = await fetch(`${port}/api/posts?page=${pageParam}&limit=10`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const result = await res.json();
  return result.data; // { items, pagination }
}

export default function PostFeed() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts"], // key này = "địa chỉ" cache, dùng lại ở mọi nơi cần đụng tới feed
    queryFn: fetchPostsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pagination.hasMore ? allPages.length + 1 : undefined,
  });

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    if (!socket) return;

    const handler = (newPost: Post) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        const [firstPage, ...restPages] = old.pages;

        // chặn trùng key: nếu post đã có trong cache thì bỏ qua
        const alreadyExists = firstPage.items.some(
          (p: Post) => p.post_id === newPost.post_id,
        );
        if (alreadyExists) return old;

        return {
          ...old,
          pages: [
            { ...firstPage, items: [newPost, ...firstPage.items] },
            ...restPages,
          ],
        };
      });
    };

    socket.on("post:created", handler);
    return () => {
      socket.off("post:created", handler);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 md:gap-8 w-full items-center">
        {[1, 2, 3].map((n) => (
          <div
            className="w-full max-w-xl animate-pulse flex flex-col gap-3"
            key={n}
          > 
            <div className="flex w-full gap-2 items-center">
              <div className="bg-gray-200 rounded-full w-10 h-10" />
              <div className="flex flex-col gap-1">
                <div className="bg-gray-200 rounded-2xl w-40 h-3" />
                <div className="bg-gray-200 rounded-2xl w-20 h-2" />
              </div>
            </div>
            <div className="w-full h-3 rounded-2xl bg-gray-200" />
            <div className="w-full h-3 rounded-2xl bg-gray-200" />
            <div className="bg-gray-200 rounded-md h-60" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">Không tải được bài viết.</p>;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full items-center">
      {posts.map((post) => (
        <PostCard i={post} key={post.post_id} />
      ))}
      <div
        ref={observerTarget}
        className="h-10 w-full flex justify-center items-center"
      >
        {isFetchingNextPage && (
          <p className="text-sm text-gray-500">Loading more posts...</p>
        )}
        {!hasNextPage && (
          <p className="text-sm text-gray-500">No more posts to show.</p>
        )}
      </div>
    </div>
  );
}
