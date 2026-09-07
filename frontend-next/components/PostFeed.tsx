"use client";

import { useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import port from "@/api/api";
import PostCard from "./PostCard";
import { useSocket } from "@/context/SocketContext";
import { useUserInterests } from "@/hooks/useUserInterests";
import { rankPosts } from "@/utils/recommendation";
import { Post, PostsPage } from "@/types/post";

type PostsQueryData = {
  pages: PostsPage[];
  pageParams: unknown[];
};

async function fetchPostsPage({
  pageParam,
}: {
  pageParam: number;
}): Promise<PostsPage> {
  const res = await fetch(`${port}/api/posts?page=${pageParam}&limit=10`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const result = await res.json();
  return result.data;
}

export default function PostFeed() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { interests, isLoading: isLoadingInterests } = useUserInterests();

  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPostsPage,
    initialPageParam: 1,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pagination.hasMore ? allPages.length + 1 : undefined,
  });

  // Apply recommendation algorithm
  const recommendedPosts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

    if (isLoadingInterests || allPosts.length === 0) {
      return allPosts;
    }

    // Rank all fetched posts by recommendation score
    return rankPosts(allPosts, interests, allPosts.length);
  }, [data?.pages, interests, isLoadingInterests]);

  useEffect(() => {
    if (!socket) return;

    const handler = (newPost: Post) => {
      queryClient.setQueryData<PostsQueryData>(["posts"], (old) => {
        if (!old) return old;
        const [firstPage, ...restPages] = old.pages;

        // Prevent duplicate posts
        const alreadyExists = firstPage.items.some(
          (p: Post) => p.post_id === newPost.post_id
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

    const updateHandler = (updatedPost: Post) => {
      queryClient.setQueryData<PostsQueryData>(["posts"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: PostsPage) => ({
            ...page,
            items: page.items.map((post) =>
              post.post_id === updatedPost.post_id ? updatedPost : post
            ),
          })),
        };
      });
    };

    const removeHandler = ({ post_id }: { post_id: number }) => {
      queryClient.setQueryData<PostsQueryData>(["posts"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: PostsPage) => ({
            ...page,
            items: page.items.filter((post) => post.post_id !== post_id),
          })),
        };
      });
    };

    socket.on("post:created", handler);
    socket.on("post:updated", updateHandler);
    socket.on("post:deleted", removeHandler);
    socket.on("post:hidden", removeHandler);
    return () => {
      socket.off("post:created", handler);
      socket.off("post:updated", updateHandler);
      socket.off("post:deleted", removeHandler);
      socket.off("post:hidden", removeHandler);
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
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading || isLoadingInterests) {
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
      {recommendedPosts.map((post) => (
        <PostCard i={post} key={post.post_id} />
      ))}
      <div
        ref={observerTarget}
        className="h-10 w-full flex justify-center items-center"
      >
        {isFetchingNextPage && (
          <div className="flex flex-col gap-5 md:gap-8 w-full items-center">
            <div className="w-full max-w-xl animate-pulse flex flex-col gap-3">
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
          </div>
        )}
      </div>
    </div>
  );
}
