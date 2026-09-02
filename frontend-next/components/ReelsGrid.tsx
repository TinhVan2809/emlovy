"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import port from "@/api/api";
import CommentSheet from "./comments-sheet";

type ReelMedia = {
  post_media_id: number;
  media_url: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
};

type ReelAuthor = {
  user_id: number;
  name: string;
  username: string;
  avatar_url?: string;
};

type Reel = {
  post_id: number;
  content?: string;
  video?: ReelMedia;
  video_url?: string;
  media?: ReelMedia[];
  author?: ReelAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me?: boolean;
};

type ReelsPage = {
  items: Reel[];
  pagination: { hasMore: boolean };
};

async function fetchReelsPage({
  pageParam,
  queryKey,
}: {
  pageParam: number;
  queryKey: readonly (string | number)[];
}): Promise<ReelsPage> {
  const [, randomSeed] = queryKey;
  const res = await fetch(
    `${port}/api/reels/random?page=${pageParam}&limit=10&seed=${randomSeed}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch reels");
  const result = await res.json();
  return result.data;
}

export default function ReelsGrid() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [randomSeed] = useState(() => Math.floor(Math.random() * 2147483647));

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["random-reels", randomSeed],
    queryFn: fetchReelsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pagination.hasMore ? allPages.length + 1 : undefined,
  });

  const reels = data?.pages.flatMap((page) => page.items) ?? [];

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

  // skeleton
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="aspect-9/16 bg-gray-200 animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex justify-center py-8">
        <p className="text-sm text-red-500">Không tải được reels.</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="w-full flex justify-center py-8">
        <p className="text-sm text-gray-500">Chưa có reels nào.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
        {reels.map((reel) => (
          <ReelCard key={reel.post_id} reel={reel} />
        ))}
      </div>

      <div
        ref={observerTarget}
        className="h-20 w-full flex justify-center items-center"
      >
        {isFetchingNextPage && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 w-full">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-9/16 bg-gray-200 animate-pulse rounded-md"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const videoUrl = reel.video_url || reel.video?.media_url;

  const [isCommentSheetOpent, setIsCommentSheetOpen] = useState(false);

  const handleToggleCommentSheet = () => {
    setIsCommentSheetOpen((prev) => !prev);
  };

  const handleCloseCommentSheet = () => {
    setIsCommentSheetOpen(false);
  };

  return (

    <>
      <div
        className="group relative aspect-9/16 bg-black rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleToggleCommentSheet}
      >
        {/* Video thumbnail hoặc placeholder */}
        <div className="w-full h-full relative bg-gray-900">
          {videoUrl && (
            <video
              src={`${port}${videoUrl}`}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                video.currentTime = 0;
                video.play().catch(() => {
                  // Ignore autoplay errors
                });
              }}
              onMouseLeave={(e) => {
                const video = e.currentTarget;
                video.pause();
                video.currentTime = 0;
              }}
            />
          )}
        </div>

        {/* Overlay with stats */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatNumber(reel.like_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatNumber(reel.comment_count)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>
      {isCommentSheetOpent && (
        <CommentSheet
          onClose={handleCloseCommentSheet}
          post={reel as any}
          kind="reel"
        />
      )}
    </>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
