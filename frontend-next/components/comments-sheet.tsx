"use client";

import port from "@/api/api";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { RiHeart3Line, RiHeart3Fill } from "@remixicon/react";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/useUserContext";
import {
  RiAddLine,
  RiSendInsFill,
  RiMore2Fill,
  RiMessage3Line,
} from "@remixicon/react";

import { LuImagePlus } from "react-icons/lu";
import { MdInsertEmoticon } from "react-icons/md";
import { RiAttachmentLine, RiHashtag } from "@remixicon/react";

interface PostMedia {
  post_media_id: number;
  media_url: string;
  type: string;
}

interface PostAuthor {
  user_id: number;
  name: string;
  username: string;
  avatar_url?: string;
}

interface Post {
  post_id: number;
  content: string;
  media?: PostMedia[];
  author?: PostAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  liked_by_me?: boolean;
}

type CommentAuthor = {
  user_id: number;
  name: string;
  avatar_url?: string;
};

type Comment = {
  id: number;
  content: string;
  like_count: number;
  liked_by_me: boolean;
  created_at: string;
  author: CommentAuthor;
  replies: Comment[];
  is_edited?: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};
type User = {
  user_id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
};

type Props = {
  onClose: React.MouseEventHandler<HTMLDivElement>;
  post: Post | null;
  kind: "post" | "reel";
};

function CommentItem({
  comment,
  onReply,
  currentUser,
}: {
  comment: Comment;
  onReply: (comment: Comment) => void;
  currentUser: User | null;
}) {
  const avatarSrc = comment.author?.avatar_url
    ? `${port}${comment.author.avatar_url}`
    : "/Profile-Default.webp";

  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const isOwner = Number(currentUser?.user_id) === comment.author.user_id; // Nếu user_id của người đang đăng nhập bằng user_id của người bình luận => isOwner = true.

  const handleDelete = async () => {
    if (
      isDeleting ||
      !window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")
    )
      return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${port}/api/posts/comments/${comment.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      // Socket event will handle UI removal
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Không thể xóa bình luận. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      isSubmittingEdit ||
      !editedContent.trim() ||
      editedContent.trim() === comment.content
    ) {
      setIsEditing(false);
      return;
    }
    setIsSubmittingEdit(true);
    try {
      const response = await fetch(`${port}/api/posts/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editedContent.trim() }),
      });
      if (!response.ok) throw new Error("Failed to update comment");
      // On success, just exit edit mode. Socket event will update the content.
      setIsEditing(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Không thể cập nhật bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
    setIsMenuOpen(false);
  };
  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const newLikedState = !liked;
    const newLikeCount = likeCount + (newLikedState ? 1 : -1);

    // Optimistic update
    setLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      const response = await fetch(
        `${port}/api/posts/comments/${comment.id}/like`,
        {
          method: newLikedState ? "POST" : "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setLiked(result.data.liked_by_me);
        setLikeCount(result.data.like_count);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Revert on error
      setLiked(comment.liked_by_me);
      setLikeCount(comment.like_count);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 items-start">
      <div className="relative w-6 sm:w-8 h-6 sm:h-8 shrink-0 mt-1">
        <Image
          src={avatarSrc}
          alt="avatar"
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full min-w-0">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="w-full">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="font-semibold hover:text-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-gray-100 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 w-fit relative group">
              <p className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm">
                  {comment.author.name}
                </span>
                <span className="text-[9px] sm:text-[10px] text-black/50 whitespace-nowrap">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </p>
              <p className="text-xs sm:text-sm wrap-break-word">{comment.content}</p>
              {isOwner && (
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setIsMenuOpen((o) => !o)}
                    className="p-0.5 sm:p-1 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                  >
                    <RiMore2Fill size={12} className="sm:size-3.5" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md text-xs sm:text-sm w-24 sm:w-28 z-20">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="block w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 text-red-600 text-xs sm:text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm px-2 sm:px-3 text-gray-500 flex-wrap">
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`font-semibold hover:text-gray-700 transition-colors ${liked ? "text-red-500 hover:text-red-600" : ""}`}
          >
            {liked ? "Bỏ thích" : "Thích"}
          </button>
          <button onClick={() => onReply(comment)} className="font-semibold hover:text-gray-700 transition-colors">
            Phản hồi
          </button>
          {likeCount > 0 && (
            <div className="flex items-center gap-1 ml-auto sm:ml-0">
              {liked ? (
                <RiHeart3Fill size={12} className="sm:size-3.5 text-red-500" />
              ) : (
                <RiHeart3Line size={12} className="sm:size-3.5" />
              )}
              <span className="text-xs sm:text-sm">{likeCount}</span>
            </div>
          )}
          {comment.is_edited && !isEditing && (
            <span className="text-gray-400 text-xs">(đã chỉnh sửa)</span>
          )}
        </div>
        {hasReplies && (
          <button
            onClick={() => setAreRepliesVisible(!areRepliesVisible)}
            className="w-fit text-xs sm:text-sm font-semibold text-gray-600 mt-1 px-2 sm:px-3 hover:underline transition-all"
          >
            {areRepliesVisible
              ? "Ẩn phản hồi"
              : `Xem ${comment.replies.length} phản hồi`}
          </button>
        )}
        {hasReplies && areRepliesVisible && (
          <div className="mt-2 space-y-2 pl-3 sm:pl-4 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSheet({ onClose, post, kind }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { user: currentUser } = useUser();
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // State trạng thái đóng mở thêm hình ảnh/icons/hastag khi thêm bình luận
  const [isMenu, setIsMenu] = useState(false);

  const fetchComments = useCallback(
    async (pageNum: number, replace = false) => {
      if (!post) return;
      setIsLoading(true);
      try {
        const apiPrefix = kind === "reel" ? "reels" : "posts";
        const response = await fetch(
          `${port}/api/${apiPrefix}/${post.post_id}/comments?page=${pageNum}&limit=20`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error(`ERROR HTTP ${response.status}`);

        const data = await response.json();

        if (data.success) {
          setComments((prev) =>
            replace ? data.data.items : [...prev, ...data.data.items],
          );
          setPagination(data.data.pagination);
        }
      } catch (_err) {
        console.error("Error fetching comment", _err);
      } finally {
        setIsLoading(false);
      }
    },
    [post, kind],
  );

  useEffect(() => {
    if (post) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComments([]);
      setPage(1);
      fetchComments(1, true);
    }
  }, [post, fetchComments]);

  useEffect(() => {
    if (!socket || !post) return;

    const commentEventName = kind === "reel" ? "reel:commented" : "post:commented";

    const handleNewComment = (data: { post_id: number; comment: Comment }) => {
      // Chỉ cập nhật nếu bình luận thuộc về bài viết đang xem
      if (data.post_id === post.post_id) {
        setComments((prevComments) => {
          // Tránh thêm bình luận trùng lặp (ví dụ: khi người dùng tự bình luận và nhận lại qua socket)
          if (prevComments.some((c) => c.id === data.comment.id)) {
            return prevComments;
          }
          // Thêm bình luận mới vào đầu danh sách để hiển thị ngay lập tức
          return [data.comment, ...prevComments];
        });
      }
    };

    const handleUpdatedComment = (updatedComment: Comment) => {
      const updateRecursive = (items: Comment[]): Comment[] => {
        return items.map((item) => {
          if (item.id === updatedComment.id) {
            return { ...item, ...updatedComment };
          }
          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: updateRecursive(item.replies) };
          }
          return item;
        });
      };
      setComments((prev) => updateRecursive(prev));
    };

    const handleDeletedComment = ({ commentId }: { commentId: number }) => {
      const removeRecursive = (items: Comment[], id: number): Comment[] => {
        return items.reduce((acc, item) => {
          if (item.id === id) {
            return acc; // Skip this item
          }
          if (item.replies) {
            item.replies = removeRecursive(item.replies, id);
          }
          acc.push(item);
          return acc;
        }, [] as Comment[]);
      };
      setComments((prev) => removeRecursive(prev, commentId));
    };

    socket.on(commentEventName, handleNewComment);
    socket.on("comment:updated", handleUpdatedComment);
    socket.on("comment:deleted", handleDeletedComment);

    // Dọn dẹp listener khi component unmount hoặc khi post thay đổi
    return () => {
      socket.off(commentEventName, handleNewComment);
      socket.off("comment:updated", handleUpdatedComment);
      socket.off("comment:deleted", handleDeletedComment);
    };
  }, [socket, post, kind]);

  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && !isLoading && pagination?.hasMore) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        // threshold
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post || isSubmitting) return;

    setIsSubmitting(true);

    const apiPrefix = kind === "reel" ? "reels" : "posts";
    // The endpoint for creating a reel comment is singular
    const commentPath = kind === "reel" ? "comment" : "comments";

    const endpoint = replyingTo
      ? `${port}/api/${apiPrefix}/${post.post_id}/comments/${replyingTo.id}/replies`
      : `${port}/api/${apiPrefix}/${post.post_id}/${commentPath}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const result = await response.json();

      if (result.success) {
        // Socket.IO will handle the update, so we just clear the form.
        // If replying, we might need to manually update the parent comment's reply list
        // or refetch. For now, we rely on the 'post:commented' event which should
        // also be fired for replies.
        setCommentContent("");
        setReplyingTo(null);

        // Scroll to bottom to see new comment (if not using socket for updates)
        commentsContainerRef.current?.scrollTo({
          top: commentsContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetReplyingTo = (comment: Comment) => {
    setReplyingTo(comment);
    // Optionally focus the input field
  };

  const cancelReply = () => setReplyingTo(null);

  // Ngăn cuộn phía sau khi comment sheet mở
  useEffect(() => {
    if (post) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [post]);

  if (!post) return null;

  return (
    <div
      className="w-full h-screen fixed top-0 right-0 z-10000 bg-black/50 flex justify-center items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute top-0 right-0 z-100 p-4 sm:p-6 md:p-8 cursor-pointer" onClick={onClose}>
        <span className="text-3xl sm:text-4xl text-white font-light hover:opacity-70 transition-opacity">&times;</span>
      </div>
      <div
        className="w-full h-full sm:h-[95vh] md:h-[90vh] lg:max-w-6xl xl:max-w-7xl bg-white shadow-2xl sm:rounded-lg flex flex-col sm:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-[45%] sm:h-[50%] md:h-full lg:w-1/2 bg-black flex items-center justify-center shrink-0">
          {post.media && post.media.length > 0 && (
            <>
              {kind === "reel" ? (
                <video
                  src={`${port}${post.media[0].media_url}`}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <Swiper
                  modules={[SwiperPagination]}
                  pagination={
                    post.media.length > 1 ? { type: "fraction" } : false
                  }
                  grabCursor
                  slidesPerView={1}
                  className="w-full h-full"
                >
                  {post.media.map((m) => (
                    <SwiperSlide
                      key={m.post_media_id}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={`${port}${m.media_url}`}
                        alt="post_url"
                        fill
                        className="object-contain"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </>
          )}
        </div>
        <div className="w-full sm:w-1/2 lg:w-full lg:flex-1 flex flex-col overflow-hidden">
          <div
            ref={commentsContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4"
          >
            {comments.length > 0 ? (
              <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleSetReplyingTo}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full gap-2">
                <RiMessage3Line size={32} className="opacity-45 sm:size-40" />
                <span className="text-sm sm:text-base">Chưa có bình luận nào</span>
                <span className="text-xs sm:text-sm text-gray-500">Hãy trở thành người bình luận đầu tiên</span>
              </div>
            )}
            {isLoading && (
              <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center animate-pulse">
                <div className="w-full max-w-xs sm:max-w-sm flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-6 sm:w-8 h-6 sm:h-8"></div>
                    <div className="bg-gray-100 w-24 sm:w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-12 sm:h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-full max-w-xs sm:max-w-sm flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-6 sm:w-8 h-6 sm:h-8"></div>
                    <div className="bg-gray-100 w-20 sm:w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-12 sm:h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-full max-w-xs sm:max-w-sm flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-6 sm:w-8 h-6 sm:h-8"></div>
                    <div className="bg-gray-100 w-28 sm:w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-12 sm:h-15 rounded-xl w-full"></div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="shrink-0 p-2.5 sm:p-3 md:p-4 border-t border-gray-100 bg-white">
            {replyingTo && (
              <div className="text-xs sm:text-sm text-gray-500 mb-2 flex justify-between items-center px-2">
                <span className="truncate">
                  Đang trả lời{" "}
                  <span className="font-semibold">
                    {replyingTo.author.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="text-xs font-bold ml-2 whitespace-nowrap"
                >
                  HỦY
                </button>
              </div>
            )}
            <div className="p-1.5 sm:p-2 bg-gray-100 rounded-full sm:rounded-2xl flex items-center justify-between gap-2 sm:gap-3">
              <div className="relative flex gap-1.5 sm:gap-2 w-full min-w-0">
                <div
                  className={`absolute bottom-full left-0 mb-2 z-50 bg-white shadow-lg rounded-lg sm:rounded-2xl p-2 w-fit duration-200 transition-all origin-bottom transform ease-in-out ${isMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <div className="p-1.5 sm:p-2 flex flex-col gap-2 sm:gap-3">
                    <p className="flex gap-1.5 sm:gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity">
                      <LuImagePlus className="text-black/70 shrink-0" size={16} />
                      <span className="text-xs sm:text-sm">Hình ảnh</span>
                    </p>
                    <p className="flex gap-1.5 sm:gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity">
                      <RiAttachmentLine size={16} className="text-black/70 shrink-0" />
                      <span className="text-xs sm:text-sm">Files</span>
                    </p>
                    <p className="flex gap-1.5 sm:gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity">
                      <RiHashtag size={16} className="text-black/70 shrink-0" />
                      <span className="text-xs sm:text-sm">Hashtag</span>
                    </p>
                    <p className="flex gap-1.5 sm:gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity">
                      <MdInsertEmoticon className="text-black/70 shrink-0" size={16} />
                      <span className="text-xs sm:text-sm">Emoji</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 sm:p-1.5 rounded-full bg-white cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                  onClick={() => setIsMenu((v) => !v)}
                >
                  <RiAddLine size={18} className="sm:size-5" />
                </button>
                <input
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={
                    replyingTo
                      ? `Trả lời ${replyingTo.author.name}...`
                      : "Nhập bình luận của bạn..."
                  }
                  className="w-full min-w-0 text-sm sm:text-base outline-0 bg-transparent placeholder-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={!commentContent.trim() || isSubmitting}
                className="text-blue-500 disabled:text-gray-400 p-1.5 sm:p-2 hover:opacity-70 disabled:hover:opacity-100 transition-opacity shrink-0"
              >
                <RiSendInsFill size={18} className="sm:size-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
