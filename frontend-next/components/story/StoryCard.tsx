import port from "@/api/api";
import Image from "next/image";

export interface StoryMedia {
    media_url: string;
    type?: string;
}

export interface StoryItem {
    story_id: number;
    content?: string | null;
    background_color?: string | null;
    media?: StoryMedia[];
}

export interface StoryGroup {
    user_id: number;
    is_own?: boolean;
    author?: {
        name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
        avata?: string | null;
    };
    stories: StoryItem[];
}

interface StoryCardProps {
    group: StoryGroup;
    onOpen: () => void;
    onCreateStory?: () => void;
}

export default function StoryCard({ group, onOpen, onCreateStory }: StoryCardProps) {
    const authorName = group.is_own ? "Tin của bạn" : group.author?.name || group.author?.username || "Người dùng";
    const avatarPath = group.author?.avatar_url || group.author?.avata;
    const avatar = avatarPath ? (/^https?:\/\//.test(avatarPath) ? avatarPath : `${port}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`) : "/Profile-Default.webp";

    // Own card: nếu có story → click xem story; không có → mở tạo story
    const hasStories = group.is_own && group.stories.length > 0;
    const handleClick = group.is_own
        ? (hasStories ? onOpen : (onCreateStory ?? onOpen))
        : onOpen;

    return (
        <button className="group flex w-19 shrink-0 flex-col items-center gap-2 text-center" onClick={handleClick} type="button">
            <span className={`relative rounded-full p-0.75 transition-transform group-hover:scale-105 ${
                group.is_own && !hasStories
                    ? "bg-slate-200"
                    : "bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            }`}>
                <span className="block rounded-full bg-white p-0.5">
                    <div className="relative h-16 w-16">
                        <Image alt="story" className="rounded-full object-center" fill loading="eager" src={avatar}/>
                    </div>
                </span>
                {group.is_own && (
                    <span
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-sky-500 text-lg font-light leading-none text-white transition-transform hover:scale-110"
                        role="button"
                        aria-label="Tạo story mới"
                        onClick={(e) => { e.stopPropagation(); onCreateStory?.(); }}
                    >+</span>
                )}
            </span>
            <span className="w-full truncate text-xs text-slate-700">{authorName}</span>
        </button>
    );
}