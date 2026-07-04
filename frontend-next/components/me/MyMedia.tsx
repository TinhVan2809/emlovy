"use client";

import { useEffect, useRef, useState } from "react";
import port from "@/api/api";
import { useUser } from "@/context/useUserContext";

type MediaItem = {
  post_id: number;
  user_id?: number;
  content?: string;
  media?: Array<{
    media_url: string;
    type?: string;
  }>;
  author?: {
    user_id?: number;
  };
};

function MediaCard({ item }: { item: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleHoverStart = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
      await video.play();
    } catch (error) {
      console.warn("Unable to play media preview:", error);
    }
  };

  const handleHoverEnd = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  };

  const videoMedia = (item.media || []).find((media) => {
    const path = media.media_url || "";
    return media.type === "video" || /\.(mp4|mov|webm|ogg)$/i.test(path);
  });

  const videoSrc = videoMedia?.media_url ? `${port}${videoMedia.media_url}` : null;

  return (
    <div
      key={item.post_id}
      className="group relative aspect-3/4 overflow-hidden rounded-xl bg-black"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          loop
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
          Không có video
        </div>
      )}
    </div>
  );
}

function MyMedia() {
  const { user } = useUser();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.user_id) {
      return;
    }

    const fetchMyMedia = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${port}/api/reels?page=1&limit=50`, {
          credentials: "include",
        });
        const data = await response.json();

        const items = (data?.data?.items || []) as MediaItem[];
        const filteredItems = items.filter((item) => {
          const itemUserId = Number(item.user_id ?? item.author?.user_id ?? 0);
          const currentUserId = Number(user.user_id ?? 0);

          if (itemUserId !== currentUserId) {
            return false;
          }

          return (item.media || []).some((media) => {
            const path = media.media_url || "";
            return (
              media.type === "video" || /\.(mp4|mov|webm|ogg)$/i.test(path)
            );
          });
        });

        setMediaItems(filteredItems);
      } catch (error) {
        console.error("Error fetching user media:", error);
        setMediaItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyMedia();
  }, [user?.user_id]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-3/4 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!mediaItems.length) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
        Bạn chưa có thước phim nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
      {mediaItems.map((item) => (
        <MediaCard key={item.post_id} item={item} />
      ))}
    </div>
  );
}

export default MyMedia;
