"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import port from "@/api/api";
import ReelCard from "@/components/ReelCard";
import ReelCardSkeleton from "@/components/ReelCardSkeleton";

type ReelItem = {
  post_id: number;
  author?: { name: string; avatar_url?: string | null };
  media: Array<{ media_url: string }>;
  content?: string;
  liked_by_me?: boolean;
  like_count: number;
  comment_count: number;
};

export default function Reels() {
  const [videos, setVideos] = useState<ReelItem[]>([]);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [isMuted, setIsMuted] = useState(true); // Bắt đầu tắt tiếng để cho phép autoplay
  const playbackObserver = useRef<IntersectionObserver | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setVideoRef = useCallback(
    (postId: number, el: HTMLVideoElement | null) => {
      videoRefs.current[postId] = el;
    },
    [],
  );

  useEffect(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const fetchReels = async () => {
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(`${port}/api/reels?page=${page}&limit=5`, {
          credentials: "include",
        });
        const data = await response.json();
        const items = data.data?.items || [];

        if (items.length > 0) {
          setVideos((prevVideos) => {
            const existingIds = new Set(prevVideos.map((v) => v.post_id));
            const uniqueNewItems = items.filter(
              (item: ReelItem) => !existingIds.has(item.post_id),
            );
            return [...prevVideos, ...uniqueNewItems];
          });
        }

        const moreAvailable = data.data.pagination.hasMore;
        hasMoreRef.current = moreAvailable;
        setHasMore(moreAvailable);
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    fetchReels();
  }, [page]);

  // Intersection Observer cho infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Nếu target hiển thị, không loading, và còn dữ liệu, thì tăng page
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 },
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isLoading, hasMore]);

  const ratiosMapRef = useRef<Map<HTMLVideoElement, number>>(new Map());

  useEffect(() => {
    if (!playbackObserver.current) {
      playbackObserver.current = new IntersectionObserver(
        (entries) => {
          // 1. Cập nhật ratio mới nhất cho những video vừa thay đổi
          entries.forEach((entry) => {
            ratiosMapRef.current.set(
              entry.target as HTMLVideoElement,
              entry.intersectionRatio,
            );
          });

          // 2. Tìm video có ratio cao nhất TRONG TOÀN BỘ danh sách đang theo dõi
          let bestVideo: HTMLVideoElement | null = null;
          let bestRatio = 0;
          ratiosMapRef.current.forEach((ratio, video) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestVideo = video;
            }
          });

          // 3. Chỉ play video tốt nhất, pause TẤT CẢ video còn lại
          ratiosMapRef.current.forEach((_, video) => {
            const shouldPlay = video === bestVideo && bestRatio >= 0.6;
            if (shouldPlay) {
              video.play().catch((err) => {
                if (err.name !== "NotAllowedError") {
                  console.error("Playback failed:", err);
                }
              });
            } else if (!video.paused) {
              video.pause();
            }
          });
        },
        { threshold: [0, 0.6] }, // thêm 0 để observer bắn callback cả khi video rời khỏi viewport
      );
    }

    const observer = playbackObserver.current;
    observer.disconnect();
    ratiosMapRef.current.clear(); // reset map khi danh sách video thay đổi

    const videosToObserve = Object.values(videoRefs.current).filter(
      (video): video is HTMLVideoElement => video !== null,
    );

    videosToObserve.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos.length]);

  return (
    <div className="gap-8 p-4 bg-[#121212]">
      <div className="flex justify-center">
        <div className="fixed top-0 left-0 z-100 p-4">
          <span className="text-white text-2xl">Reels</span>
        </div>
        <div className="">
          {videos.length > 0 && (
            <div className="flex flex-col gap-8">
              {videos.map((v: ReelItem) => (
                <ReelCard
                  item={v}
                  key={v.post_id}
                  setVideoRef={setVideoRef}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                />
              ))}
            </div>
          )}

          {/* Skeleton cho lần tải đầu tiên */}
          {isLoading && videos.length === 0 && (
            <div className="flex flex-col gap-8">
              {[1, 2].map((n) => (
                <ReelCardSkeleton key={n} />
              ))}
            </div>
          )}

          {/* Thông báo khi không có video */}
          {!isLoading && videos.length === 0 && (
            <div className="w-screen h-screen flex justify-center items-center bg-black">
              <p className="text-white">Chưa có video nào.</p>
            </div>
          )}

          {/* Observer Target và Loading Indicator */}
          <div
            ref={observerTarget}
            className="flex justify-center items-center mt-8"
          >
            {isLoading && videos.length > 0 && <ReelCardSkeleton />}
            {!hasMore && videos.length > 0 && (
              <p className="text-gray-500">Bạn đã xem hết video.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
