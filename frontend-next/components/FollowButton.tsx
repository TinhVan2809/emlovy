"use client";

import { useFollow } from "@/hooks/useFollow";
import { RiUserAddLine, RiUserFollowLine } from "@remixicon/react";

interface FollowButtonProps {
  userId: string;
  initialFollowStatus: boolean;
  variant?: "icon" | "text" | "full";
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Component nút Follow/Unfollow có thể tái sử dụng
 */
export default function FollowButton({
  userId,
  initialFollowStatus,
  variant = "full",
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const { isFollowing, isLoading, error, toggleFollow } = useFollow(
    initialFollowStatus
  );

  const handleClick = async () => {
    const success = await toggleFollow(userId);
    if (success && onFollowChange) {
      onFollowChange(!isFollowing);
    }
  };

  // Variant: Chỉ hiển thị icon
  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`cursor-pointer border border-gray-400 rounded-md p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={isFollowing ? "Hủy theo dõi" : "Theo dõi"}
      >
        {isFollowing ? (
          <RiUserFollowLine size={20} className="opacity-70" />
        ) : (
          <RiUserAddLine size={20} className="opacity-70" />
        )}
      </button>
    );
  }

  // Variant: Chỉ hiển thị text
  if (variant === "text") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-4 py-1 md:px-20 md:py-1.5 rounded-md shadow-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? "bg-gray-200 hover:bg-gray-300"
            : "bg-[#e7eaee] hover:bg-blue-50"
        } ${className}`}
      >
        {isLoading ? "Đang xử lý..." : isFollowing ? "Đang theo dõi" : "Theo dõi"}
      </button>
    );
  }

  // Variant: Full (icon + text)
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        } ${className}`}
      >
        {isFollowing ? (
          <RiUserFollowLine size={20} />
        ) : (
          <RiUserAddLine size={20} />
        )}
        <span>
          {isLoading ? "Đang xử lý..." : isFollowing ? "Đang theo dõi" : "Theo dõi"}
        </span>
      </button>
      {error && (
        <span className="text-xs text-red-500 text-center">{error}</span>
      )}
    </div>
  );
}
