"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [isMuted, setIsMuted] = useState(true); // Bắt đầu tắt tiếng để cho phép autoplay

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    // Đừng fetch nếu đang loading hoặc không còn dữ liệu
    if (isLoading || (page > 1 && !hasMore)) return;

    const fetchReels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${port}/api/reels?page=${page}&limit=3`, {
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
        setHasMore(data.data.pagination.hasMore);
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Intersection Observer cho video playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Tìm video hiển thị nhiều nhất trong viewport
        let mostVisibleEntry: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (
            !mostVisibleEntry ||
            entry.intersectionRatio > mostVisibleEntry.intersectionRatio
          ) {
            mostVisibleEntry = entry;
          }
        });

        // Chỉ phát video hiển thị nhiều nhất và tạm dừng các video còn lại
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (
            entry === mostVisibleEntry &&
            entry.intersectionRatio >= 0.6
          ) {
            videoElement
              .play()
              .catch((err) => console.error("Playback failed:", err));
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.6 }, // Callback chỉ kích hoạt khi đúng 60% diện tích video xuất hiện trong viewport. Giá trị từ 0 (1px) đến 1 (100%).
    );

    const currentRefs = videoRefs.current;
    const videosToObserve = Object.values(currentRefs).filter(Boolean);

    videosToObserve.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videosToObserve.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [videos]);

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
                  v={v}
                  key={v.post_id}
                  setVideoRef={(el) => (videoRefs.current[v.post_id] = el)}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                />
              ))}
            </div>
          )}

          {/* Skeleton cho lần tải đầu tiên */}
          {isLoading && videos.length === 0 && (
            <div className="flex flex-col gap-8">
              {[1, 2].map((n) => <ReelCardSkeleton key={n} />)}
            </div>
          )}

          {/* Thông báo khi không có video */}
          {!isLoading && videos.length === 0 && (
           <div className="w-screen h-screen flex justify-center items-center bg-black">
              <p className="text-white">Chưa có video nào.</p>
           </div>
          )}

          {/* Observer Target và Loading Indicator */}
          <div ref={observerTarget} className="flex justify-center items-center mt-8">
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
