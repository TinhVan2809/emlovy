/**
 * Lazy Load Components cho Next.js
 * Giảm initial bundle size bằng cách chỉ tải components khi cần
 * 
 * CÁCH SỬ DỤNG:
 * 1. Import component cần dùng: import { CommentsSheet } from '@/components/lazy-components'
 * 2. Sử dụng như component bình thường, nó sẽ tự động lazy load
 * 3. Component chỉ được download khi cần thiết (khi render lần đầu)
 */

import dynamic from "next/dynamic";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}

// Skeleton cho modal - nhỏ gọn
function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-1100 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full animate-pulse shadow-2xl">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
        <div className="flex gap-2 justify-end">
          <div className="h-10 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

// Skeleton cho delete modal - nhỏ hơn
function DeleteModalSkeleton() {
  return (
    <div className="fixed inset-0 z-1100 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full animate-pulse shadow-2xl">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-4/5 mb-4" />
        <div className="flex gap-2 justify-end">
          <div className="h-9 bg-gray-200 rounded w-16" />
          <div className="h-9 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Comments Sheet - Chỉ load khi người dùng click vào comments
 * Tiết kiệm: ~50KB bundle size
 */
export const CommentsSheet = dynamic(
  () => import("./comments-sheet"),
  {
    loading: () => <ModalSkeleton />,
    ssr: false, // Client-only component
  }
);

/**
 * Edit Post Modal - Chỉ load khi người dùng click edit
 * Tiết kiệm: ~35KB bundle size
 */
export const EditPostModal = dynamic(
  () => import("./EditPostModal"),
  {
    loading: () => <ModalSkeleton />,
    ssr: false,
  }
);

/**
 * Delete Post Modal - Chỉ load khi người dùng click delete
 * Tiết kiệm: ~15KB bundle size
 */
// export const DeletePost = dynamic(
//   () => import("./DeletePost"),
//   {
//     loading: () => <DeleteModalSkeleton />,
//     ssr: false,
//   }
// );

/**
 * Post Composer Modal - Chỉ load khi người dùng tạo post
 * Tiết kiệm: ~30KB bundle size
 */
// export const PostComposerModal = dynamic(
//   () => import("./post-composer-modal").then(mod => ({ default: mod.PostComposerModal })),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false,
//   }
// );

// /**
//  * Story Composer Modal - Chỉ load khi người dùng tạo story
//  * Tiết kiệm: ~25KB bundle size
//  */
// export const StoryComposerModal = dynamic(
//   () => import("./story-composer-modal").then(mod => ({ default: mod.StoryComposerModal })),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false,
//   }
// );

// /**
//  * Video Player - Chỉ load khi có video trong viewport
//  * Tiết kiệm: ~100KB bundle size
//  */
// export const VideoPlayer = dynamic(
//   () => import("./video-player"),
//   {
//     loading: () => (
//       <div className="w-full h-full bg-gray-900 flex items-center justify-center">
//         <LoadingSpinner />
//       </div>
//     ),
//     ssr: false,
//   }
// );

// /**
//  * Chart/Analytics Components - Chỉ load trong settings/analytics
//  * Tiết kiệm: ~200KB bundle size (recharts rất nặng)
//  */
// export const AnalyticsChart = dynamic(
//   () => import("./analytics-chart"),
//   {
//     loading: () => (
//       <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
//     ),
//     ssr: false,
//   }
// );

// /**
//  * Image Editor/Cropper - Chỉ load khi edit ảnh
//  * Tiết kiệm: ~150KB bundle size
//  */
// export const ImageEditor = dynamic(
//   () => import("./image-editor"),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false,
//   }
// );

// /**
//  * Emoji Picker - Chỉ load khi người dùng click vào emoji button
//  * Tiết kiệm: ~80KB bundle size
//  */
// export const EmojiPicker = dynamic(
//   () => import("./emoji-picker"),
//   {
//     loading: () => (
//       <div className="w-64 h-48 bg-white shadow-lg rounded-lg p-4 animate-pulse">
//         <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
//         <div className="grid grid-cols-6 gap-2">
//           {Array.from({ length: 12 }).map((_, i) => (
//             <div key={i} className="h-8 bg-gray-200 rounded" />
//           ))}
//         </div>
//       </div>
//     ),
//     ssr: false,
//   }
// );

// /**
//  * Map Component - Chỉ load khi xem location
//  * Tiết kiệm: ~200KB+ bundle size
//  */
// export const MapView = dynamic(
//   () => import("./map-view"),
//   {
//     loading: () => (
//       <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
//         <span className="text-gray-400">Loading map...</span>
//       </div>
//     ),
//     ssr: false,
//   }
// );

// /**
//  * PDF Viewer - Chỉ load khi xem PDF
//  * Tiết kiệm: ~150KB bundle size
//  */
// export const PDFViewer = dynamic(
//   () => import("./pdf-viewer"),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// );

// /**
//  * Markdown Editor - Chỉ load trong trang edit/create article
//  * Tiết kiệm: ~120KB bundle size
//  */
// export const MarkdownEditor = dynamic(
//   () => import("./markdown-editor"),
//   {
//     loading: () => (
//       <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />
//     ),
//     ssr: false,
//   }
// );

// /**
//  * Audio Player - Chỉ load khi có audio file
//  * Tiết kiệm: ~40KB bundle size
//  */
// export const AudioPlayer = dynamic(
//   () => import("./audio-player"),
//   {
//     loading: () => (
//       <div className="w-full h-20 bg-gray-100 animate-pulse rounded-lg" />
//     ),
//     ssr: false,
//   }
// );

// /**
//  * QR Code Generator/Scanner - Chỉ load khi cần
//  * Tiết kiệm: ~60KB bundle size
//  */
// export const QRCodeScanner = dynamic(
//   () => import("./qr-scanner"),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// );

// /**
//  * Share Dialog - Chỉ load khi click share
//  * Tiết kiệm: ~20KB bundle size
//  */
// export const ShareDialog = dynamic(
//   () => import("./share-dialog"),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false,
//   }
// );

// /**
//  * Report Modal - Chỉ load khi báo cáo
//  * Tiết kiệm: ~15KB bundle size
//  */
// export const ReportModal = dynamic(
//   () => import("./report-modal"),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false,
//   }
// );

// /**
//  * Settings Panel - Chỉ load trong trang settings
//  * Tiết kiệm: ~50KB bundle size
//  */
// export const SettingsPanel = dynamic(
//   () => import("./settings-panel"),
//   {
//     loading: () => (
//       <div className="space-y-4 p-4">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
//         ))}
//       </div>
//     ),
//   }
// );

// /**
//  * Notification Panel - Chỉ load khi mở notifications
//  * Tiết kiệm: ~30KB bundle size
//  */
// export const NotificationPanel = dynamic(
//   () => import("./notification-panel"),
//   {
//     loading: () => (
//       <div className="w-80 bg-white shadow-lg rounded-lg p-4">
//         <div className="space-y-3">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className="flex gap-3 animate-pulse">
//               <div className="w-10 h-10 bg-gray-200 rounded-full" />
//               <div className="flex-1 space-y-2">
//                 <div className="h-3 bg-gray-200 rounded w-3/4" />
//                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     ),
//     ssr: false,
//   }
// );
