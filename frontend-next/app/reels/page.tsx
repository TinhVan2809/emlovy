"use client";

import { useEffect, useState, useRef } from "react";
import port from "@/api/api";
import ReelCard from "@/components/ReelCard";

type ReelItem = {
  post_id: number;
  author?: { name: string };
  media: Array<{ media_url: string }>;
  content?: string;
  liked_by_me?: boolean;
  like_count: number;
  comment_count: number;
  avatar_url?: string | null;
};

export default function Reels() {
  const [videos, setVideos] = useState<ReelItem[]>([]);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch(`${port}/api/reels`, {
          credentials: "include",
        });
        const data = await response.json();
        // Handle both nested and flat array responses
        const items = data.data?.items || data || [];
        setVideos(items);
      } catch (error) {
        console.error("Error fetching reels:", error);
      }
    };
    fetchReels();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
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
    Object.values(currentRefs).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      Object.values(currentRefs).forEach((video) => {
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
          {videos.length > 0 ? (
            <div className="flex flex-col gap-8">
              {videos.map((v: ReelItem) => (
                <ReelCard
                  v={v}
                  key={v.post_id}
                  setVideoRef={(el) => (videoRefs.current[v.post_id] = el)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
