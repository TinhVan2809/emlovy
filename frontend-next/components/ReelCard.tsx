"use client";
import port from "@/api/api";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

type ReelItem = {
  post_id: number;
  author?: { name: string };
  media: Array<{ media_url: string }>;
  content?: string;
  liked_by_me?: boolean;
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
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // percent 0-100

  useEffect(() => {
    // expose the video element to parent and ensure initial mute
    setVideoRef(localRef.current);
    if (localRef.current) {
      localRef.current.muted = true;
      setIsMuted(true);
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
          className={`absolute inset-0 z-10 flex flex-col justify-between p-3 transition-opacity duration-150 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex justify-end pointer-events-auto">
            <button
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="bg-black/60 text-white p-2 rounded-full shadow-sm"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.383 3.35A1 1 0 018 4v12a1 1 0 01-1.707.707L3.586 15H2a1 1 0 01-1-1V6a1 1 0 011-1h1.586l2.707-1.707A1 1 0 018 2v1.35z" />
                  <path d="M15.536 6.464a5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.244 1 1 0 011.414-1.414z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.383 3.35A1 1 0 018 4v12a1 1 0 01-1.707.707L3.586 15H2a1 1 0 01-1-1V6a1 1 0 011-1h1.586l2.707-1.707A1 1 0 018 2v1.35z" />
                  <path d="M12.586 5.586a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.244 1 1 0 010-1.414z" />
                </svg>
              )}
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
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
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
      </div>
      <div className="p-4 bg-white">
        <p className="font-bold text-sm text-black">{v.author?.name || "Anonymous"}</p>
        <p className="text-gray-600 text-sm">{v.content || ""}</p>
      </div>
    </div>
  );
}

export default ReelCard;
