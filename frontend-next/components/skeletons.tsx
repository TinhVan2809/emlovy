/**
 * Skeleton Loading Components cho Next.js
 * Hiển thị khi đang tải dữ liệu để cải thiện UX
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Avatar Skeleton
 */
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-full shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/**
 * Post Card Skeleton
 */
export function PostSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 animate-pulse">
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Image */}
      <div className="h-64 bg-gray-200 rounded-lg mb-3" />

      {/* Actions */}
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </div>
  );
}

/**
 * Feed Skeleton - Multiple posts
 */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Story Tray Skeleton
 */
export function StoryTraySkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Comment Skeleton
 */
export function CommentSkeleton() {
  return (
    <div className="flex gap-2 sm:gap-3 items-start p-3 animate-pulse">
      <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="bg-gray-100 rounded-lg sm:rounded-xl px-3 py-2">
          <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 bg-gray-200 rounded w-8" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Comments List Skeleton
 */
export function CommentsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Profile Header Skeleton
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      {/* Avatar and Stats */}
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="flex-1 flex justify-around">
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>

      {/* Name and Bio */}
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded flex-1" />
        <div className="h-9 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  );
}

/**
 * Grid Gallery Skeleton
 */
export function GalleryGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-20" />
    </div>
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="h-40 bg-gray-200 rounded-lg" />
    </div>
  );
}

/**
 * Video Player Skeleton
 */
export function VideoPlayerSkeleton() {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2 animate-pulse">
        <div className="h-2 bg-gray-700 rounded" />
        <div className="flex justify-between">
          <div className="h-4 bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="flex items-end justify-between h-40 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            // eslint-disable-next-line react-hooks/purity
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-8" />
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200 bg-gray-50">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded w-32" />
    </div>
  );
}

/**
 * Reel/Story Skeleton
 */
export function ReelSkeleton() {
  return (
    <div className="w-full h-screen bg-gray-900 relative">
      <div className="absolute inset-0 bg-linear-to-b from-black/50 to-transparent" />
      <div className="absolute bottom-20 left-4 right-20 space-y-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-700 rounded-full" />
          <div className="h-4 bg-gray-700 rounded w-24" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded" />
          <div className="h-4 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
      <div className="absolute bottom-20 right-4 space-y-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-12 h-12 bg-gray-700 rounded-full" />
        ))}
      </div>
    </div>
  );
}
