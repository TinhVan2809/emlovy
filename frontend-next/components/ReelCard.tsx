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

import { useEffect, useRef, useState, type ChangeEvent } from "react";

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
  v,
  setVideoRef,
}: {
  v: ReelItem;
  setVideoRef: (el: HTMLVideoElement | null) => void;
}) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // percent 0-100

  useEffect(() => {
    // expose the video element to parent and ensure initial mute
    setVideoRef(localRef.current);
    if (localRef.current) {
      localRef.current.muted = false;
      setIsMuted(false);
    }
    return () => setVideoRef(null);
  }, [setVideoRef]);

  const handleRef = (el: HTMLVideoElement | null) => {
    localRef.current = el;
    setVideoRef(el);
  };

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
    const vid = localRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
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

  return (
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
            autoPlay
            loop
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
            <button  className="bg-black/60 text-white p-2 rounded-full shadow-sm">
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
                <IoChatbubbleOutline
                  size={36}
                  className="text-white p-1.5 rounded-full hover:bg-white/10"
                />
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
    </div>
  );
}

export default ReelCard;
