"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import port from "@/api/api";
import StoryCard, { type StoryGroup, type StoryItem } from "./StoryCard";
import StoryUploadModal from "./StoryUploadModal";

interface StoryListProps {
  groups: StoryGroup[];
}

const storyImage = (story: StoryItem) => story.media?.[0]?.media_url;
const assetUrl = (value?: string | null) => value && /^https?:\/\//.test(value) ? value : value ? `${port}${value.startsWith("/") ? "" : "/"}${value}` : "/Profile-Default.webp";

export default function StoryList({ groups }: StoryListProps) {
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const activeStory = activeGroup?.stories[activeIndex];
  const activeMedia = activeStory ? storyImage(activeStory) : undefined;

  const moveStory = (direction: 1 | -1) => {
    if (!activeGroup) return;
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= activeGroup.stories.length) {
      setActiveGroup(null);
      return;
    }
    setActiveIndex(nextIndex);
  };

  const openUpload = () => {
    setActiveGroup(null); // đóng viewer nếu đang mở
    setShowUploadModal(true);
  };

  return (
    <section aria-label="Stories" className="w-full bg-white py-4 sm:rounded-xl">
      <div className="scrollbar-none flex gap-4 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
        {groups.map((group) => (
          <StoryCard
            key={group.user_id}
            group={group}
            onOpen={() => { setActiveGroup(group); setActiveIndex(0); }}
            onCreateStory={openUpload}
          />
        ))}
      </div>

      {activeGroup && activeStory && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog">
          <button aria-label="Đóng story" className="absolute right-5 top-5 z-10 text-3xl text-white" onClick={() => setActiveGroup(null)} type="button">×</button>
          <div className="relative h-[min(78vh,680px)] w-full max-w-97.5 overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
            {/* Progress bar */}
            <div className="absolute left-3 right-3 top-3 z-10 flex gap-1">
              {activeGroup.stories.map((story, index) => (
                <span className="h-1 flex-1 rounded-full bg-white/40" key={story.story_id}>
                  <span className={`block h-full rounded-full bg-white ${index <= activeIndex ? "w-full" : "w-0"}`} />
                </span>
              ))}
            </div>

            {/* Author info */}
            <div className="absolute left-4 top-8 z-10 flex items-center gap-2 text-white">
              <img alt="" className="h-8 w-8 rounded-full object-cover" src={assetUrl(activeGroup.author?.avatar_url || activeGroup.author?.avata)} />
              <span className="text-sm font-semibold">{activeGroup.author?.username || activeGroup.author?.name || "Story"}</span>
            </div>

            {/* Story content */}
            {activeMedia ? (
              <img alt="" className="h-full w-full object-cover" src={assetUrl(activeMedia)} />
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-2xl font-semibold text-slate-800" style={{ backgroundColor: activeStory.background_color || "#FFE1D6" }}>
                {activeStory.content}
              </div>
            )}

            {/* Navigation */}
            <button aria-label="Story trước" className="absolute inset-y-0 left-0 w-1/3" onClick={() => moveStory(-1)} type="button" />
            <button aria-label="Story tiếp theo" className="absolute inset-y-0 right-0 w-2/3" onClick={() => moveStory(1)} type="button" />

            {/* Nút "Thêm story" — chỉ hiện khi xem story của chính mình */}
            {activeGroup.is_own && (
              <button
                type="button"
                onClick={openUpload}
                className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
                aria-label="Thêm story mới"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Thêm story
              </button>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <StoryUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => router.refresh()}
        />
      )}
    </section>
  );
}
