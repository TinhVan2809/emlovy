"use client";
import port from "@/api/api";
import { VscUnmute, VscMute } from "react-icons/vsc";
import Image from "next/image";

import { TbPlayerPauseFilled, TbPlayerPlayFilled } from "react-icons/tb";
import { CiHeart, CiBookmark, CiSearch } from "react-icons/ci";
import { PiShareNetworkThin } from "react-icons/pi";
import { IoChatbubbleOutline } from "react-icons/io5";
import { RiMoreLine } from "react-icons/ri";
import { IoMdHeart } from "react-icons/io";

import React, {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  useCallback,
} from "react";
import CommentSheet from "./comments-sheet";
type ReelItem = {
  post_id: number;
  author?: { name: string; avatar_url?: string | null };
  media: Array<{ media_url: string }>;
  content?: string;
  liked_by_me?: boolean;
  like_count: number;
  comment_count: number;
};

function ReelCard({
  item: v,
  setVideoRef,
  isMuted,
  onToggleMute,
}: {
  item: ReelItem;
  setVideoRef: (postId: number, el: HTMLVideoElement | null) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // percent 0-100
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

  useEffect(() => {
    const vid = localRef.current;
    if (!vid) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    vid.addEventListener("play", handlePlay);
    vid.addEventListener("pause", handlePause);

    // Đồng bộ trạng thái ban đầu khi component được mount
    setIsPlaying(!vid.paused);

    return () => {
      vid.removeEventListener("play", handlePlay);
      vid.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleRef = useCallback(
    (el: HTMLVideoElement | null) => {
      localRef.current = el;
      setVideoRef(v.post_id, el);
    },
    [setVideoRef, v.post_id],
  );

  const togglePlay = async () => {
    const vid = localRef.current;
    if (!vid) return;
    try {
      if (vid.paused) {
        await vid.play();
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      // play() may fail due to browser policy
      console.warn("Video play failed", e);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggleMute();
  };

  const onTimeUpdate = () => {
    const vid = localRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  };

  const onLoadedMetadata = () => {
    const vid = localRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const vid = localRef.current;
    if (!vid || !vid.duration) return;
    const pct = Number(e.target.value);
    vid.currentTime = (pct / 100) * vid.duration;
    setProgress(pct);
  };

  const videoSrc = v.author?.avatar_url
    ? `${port}${v.author?.avatar_url}`
    : "/default-avata.jpeg";

  const handleToggleCommentSheet = () => {
    setIsCommentSheetOpen((prev) => !prev);
    // Pause video when opening comments
    if (localRef.current && !localRef.current.paused) {
      localRef.current.pause();
    }
  };

  const handleCloseCommentSheet = () => {
    setIsCommentSheetOpen(false);
  };

  // Adapt ReelItem to the Post type expected by CommentSheet
  const postForSheet = {
    ...v,
    media: v.media.map((m, index) => ({
      ...m,
      post_media_id: v.post_id + index, // Create a unique key for the media item
      type: "video",
    })),
  };
  return (
    <>
      <div
        className="max-w-87.5 w-full border rounded-lg overflow-hidden bg-black shadow-lg"
        key={v.post_id}
        data-post-id={v.post_id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative group aspect-9/16 bg-zinc-900 flex items-center justify-center overflow-hidden">
          {v.media && v.media.length > 0 && (
            <video
              ref={handleRef}
              src={`${port}${v.media[0].media_url}`}
              muted={isMuted}
              playsInline
              loop
              preload="none"
              width={1080}
              height={1920}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay controls: appear on hover */}
          <div
            className={`absolute inset-0 z-10 flex flex-col justify-between transition-opacity duration-150 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex p-3 justify-between pointer-events-auto">
              <button className="bg-black/60 text-white p-2 rounded-full shadow-sm">
                <CiSearch />
              </button>
              <button
                onClick={toggleMute}
                aria-pressed={!isMuted}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="bg-black/60 text-white p-2 rounded-full shadow-sm"
              >
                {isMuted ? <VscMute /> : <VscUnmute />}
              </button>
            </div>

            <div className="flex items-center justify-center pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="bg-white/90 text-black p-3 rounded-full shadow-lg"
              >
                {isPlaying ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />}
              </button>
            </div>

            <div className="w-full pointer-events-auto">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.min(Math.max(progress || 0, 0), 100)}
                onChange={handleSeek}
                className="w-full h-1 accent-white"
                aria-label="Seek"
              />
            </div>
          </div>

          {/* Author info and Actions */}
          <div className="absolute right-0 bottom-0 z-1 inset-0 flex justify-end items-end">
            <div className="flex w-full justify-between items-end">
              <div className="py-3 px-5 flex flex-col gap-1">
                <div className="flex gap-1.5 text-white items-center">
                  <div className="relative h-9 w-9">
                    <Image
                      src={videoSrc}
                      alt="avatar"
                      fill
                      className="rounded-full"
                      loading="eager"
                    />
                  </div>
                  <span className="text-sm">{v.author?.name}</span>
                  <button className="text-[12px] px-2 rounded-[20px] border border-0.5">
                    Theo dõi
                  </button>
                </div>
                <div className="">
                  <span className="text-white text-sm">{v.content}</span>
                </div>
              </div>
              <div className="flex flex-col gap-5 py-7 px-2 justify-center items-center">
                <div className="flex flex-col items-center">
                  {v.liked_by_me ? (
                    <IoMdHeart size={30} className="text-red-500" />
                  ) : (
                    <CiHeart
                      size={41}
                      className="text-white p-1.5 rounded-full hover:bg-white/10"
                    />
                  )}
                  <span className="text-[10px] text-white">{v.like_count}</span>
                </div>
                <div className="flex flex-col items-center">
                  <button onClick={handleToggleCommentSheet}>
                    <IoChatbubbleOutline
                      size={36}
                      className="text-white p-1.5 rounded-full hover:bg-white/10"
                    />
                  </button>
                  <span className="text-[10px] text-white">
                    {v.comment_count}
                  </span>
                </div>
                <div className="">
                  <PiShareNetworkThin
                    size={36}
                    className="text-white p-1.5 rounded-full hover:bg-white/10"
                  />
                </div>
                <div className="">
                  <CiBookmark
                    size={36}
                    className="text-white p-1.5 rounded-full hover:bg-white/10"
                  />
                </div>
                <div className="">
                  <RiMoreLine
                    size={36}
                    className="text-white p-1.5 rounded-full hover:bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {isCommentSheetOpen && (
          <CommentSheet
            onClose={handleCloseCommentSheet}
            post={postForSheet as any}
            kind="reel"
          />
        )}
      </div>
    </>
  );
}

export default React.memo(ReelCard);
