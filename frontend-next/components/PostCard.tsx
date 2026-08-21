"use client";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import port from "@/api/api";

import {
  RiMoreLine,
  RiHeart3Line,
  RiHeart3Fill,
  RiChat3Line,
  RiSendPlaneLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiVerifiedBadgeFill
} from "@remixicon/react";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import CommentSheet from "./comments-sheet";
import EditPostModal, { type EditPostData } from "./EditPostModal";
import { useUser } from "@/context/useUserContext";
import DeletePost from "./DeletePost";
import Report from "./Report";

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
  is_verified?: number;
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

interface PostCardProps {
  i: Post;
}

function PostCard({ i }: PostCardProps) {
  const router = useRouter();
  const user = useUser();
  const [postData, setPostData] = useState<Post>(i);
  const [postOptionsMenu, setPostOptionsMenu] = useState<boolean>(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<EditPostData | null>(null);

  // State lưu trạng thái đóng mở xác nhận xóa post
  const [isDelete, setIsDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  // State lưu post_id
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Kiểm tra post này là có thuộc về người đang đăng nhập
  const isMyPost = postData.author?.user_id === user?.user?.user_id;

  // Kiểm tra tài khoản đã được verifed
  const isVerifed = postData.author?.is_verified === 1 ? true : false;


  // hàm mở PostOptionsMenu
  const onPostOptionsMenu = (postId?: number) => {
    setPostOptionsMenu((v) => !v);
    if (typeof postId === "number") {
      setSelectedPostId(postId);
    } else {
      setSelectedPostId(null);
    }
  };

  // State lưu trạng thái comment
  const [isComment, setIsComment] = useState<boolean>(false);

  const avatarSrc = postData.author?.avatar_url
    ? `${port}/${postData.author.avatar_url}`
    : "/Profile-Default.webp";

  const [liked, setLiked] = useState<boolean>(postData.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState<number>(i.like_count ?? 0);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);


  // Hàm kiểm tra bài viết này đã lưu trước đó chưa
  useEffect(() => {
    const checkSaved = async () => {
      try {
        const response = await fetch(
          `${port}/api/post-save/${postData.post_id}/check`,
          { credentials: "include" },
        );

        if (!response.ok) return;

        const result = await response.json();
        setIsSaved(result.success && result.data?.is_saved === true);
      } catch (error) {
        console.error("Lỗi khi kiểm tra bài viết đã lưu:", error);
      }
    };

    checkSaved();
  }, [postData.post_id]);

  useEffect(() => {
    setLiked(postData.liked_by_me ?? false);
    setLikeCount(postData.like_count ?? 0);
  }, [postData.liked_by_me, postData.like_count]);

  const handleTogglePostLike = useCallback(async () => {
    if (isLiking) return;

    const nextLiked = !liked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);
    setIsLiking(true);

    try {
      const response = await fetch(`${port}/api/posts/${postData.post_id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật lượt thích.");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setLiked(result.data.liked_by_me);
        setLikeCount(result.data.like_count);
      } else {
        throw new Error(result.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert back on error
      setLiked(!nextLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  }, [liked, likeCount, isLiking, postData.post_id]);

  // Mở comment
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const onToggleComment = (post: Post | null) => {
    setIsComment((v) => !v);
    setSelectedPost(post);
  };

  // Đóng comment
  const onCloseComment = () => {
    setIsComment((v) => !v);
    setSelectedPost(null);
  };

  // Báo cáo bài viểt
  const [isReport, setIsReport] = useState<boolean>(false);

  // Mở báo cáo bài viét
  const onToggleReport = (post_id: number) => {
    setIsReport(true)
    setSelectedPostId(post_id);
  }

  // Đóng báo cáo bài viết
  const onCloseReport = () => {
    setIsReport(false);
    setSelectedPostId(null);
    setPostOptionsMenu(false);
  }

  useEffect(() => {
    if (postOptionsMenu || isEditingPost || isDelete) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [postOptionsMenu, isEditingPost, isDelete]);

  // Mở model edit post
  const handleOpenEditPost = () => {
    setEditingPost({
      post_id: postData.post_id,
      content: postData.content,
      media: postData.media,
    });
    setIsEditingPost(true);
    setPostOptionsMenu(false);
  };


  // Cập nhật sau khi edit post
  const handleSavedPost = (updatedPost: EditPostData) => {
    setPostData((prev) => ({
      ...prev,
      content: updatedPost.content ?? prev.content,
      media: (updatedPost.media ?? prev.media ?? []).map((media) => ({
        post_media_id: media.post_media_id ?? 0,
        media_url: media.media_url,
        type: media.type ?? "image",
      })),
    }));
    setEditingPost((prev) => (prev ? { ...prev, ...updatedPost } : prev));
  };

  // Xóa post
  const handleOpenDelete = () => {
    setIsDelete(true);
    setPostOptionsMenu(false);
  };

  // Đóng/Hủy xóa post
  const handleCloseDelete = () => {
    setSelectedPostId(null);
    setIsDelete(false);
  };

  const handleDeletedPost = () => {
    setIsDeleted(true);
    setIsDelete(false);
    setSelectedPostId(null);
  };

  if (isDeleted) {
    return null;
  }

  // Hàm kiểm tra và lưu/xóa lưu bài viết 
  const handleSaveThisPost = async (postId: number) => {
    if (isSaving) return;

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setIsSaving(true);

    try {
      const response = await fetch(`${port}/api/post-save/${postId}`, {
        method: nextSaved ? "POST" : "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể cập nhật bài viết đã lưu.");
      }
    } catch (error) {
      setIsSaved(!nextSaved);
      console.error("Lỗi khi cập nhật bài viết đã lưu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="w-full max-w-150 lg:rounded-xl bg-white mb-4"
        key={i.post_id}
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={isMyPost ? () => router.push(`/me/${postData.author?.user_id}`) : () => router.push(`/profile/${postData.author?.user_id}`)}
            >
              <div className="relative w-10 h-10">
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  fill
                  className="rounded-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-sm flex items-center gap-1">
                  {postData.author?.name || "Anonymous"}
                  <span>{isVerifed ? <RiVerifiedBadgeFill size={15} color="#0864f9" /> : ""}</span>
                </p>
                <p className="text-xs opacity-50">
                  {new Date(postData.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="cursor-pointer duration-150 hover:bg-gray-100 p-2 rounded-full"
              onClick={() => onPostOptionsMenu(i.post_id)}
            >
              <RiMoreLine size={20} />
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-gray-800">
            {postData.content}
          </p>
        </div>
        <div className="relative w-full bg-black overflow-hidden flex justify-center md:rounded-md">
          {postData.media && postData.media.length > 0 && (
            <div className="w-full flex flex-col gap-1">
              <Swiper
                modules={[Pagination]}
                pagination={postData.media.length > 1 ? { type: "fraction" } : false}
                grabCursor
                spaceBetween={0}
                slidesPerView={1}
                className="w-full bg-black/60 text-white text-xs font-medium"
              >
                {postData.media.map((m: PostMedia) => {
                  const mediaSrc = m.media_url
                    ? `${port}${m.media_url}`
                    : "/placeholder.jpg";
                  return (
                    <SwiperSlide
                      key={m.post_media_id}
                      className="relative w-full min-h-70 md:min-h-100"
                    >
                      <Image
                        src={mediaSrc}
                        alt="post_url"
                        fill
                        priority={false}
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 600px"
                        loading="eager"
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex gap-4">
            <button
              onClick={handleTogglePostLike}
              disabled={isLiking}
              className="flex items-center gap-1.5 hover:opacity-60 transition"
            >
              {liked ? (
                <RiHeart3Fill size={24} className="text-red-500 fill-current" />
              ) : (
                <RiHeart3Line size={24} />
              )}
              <span className="text-sm font-medium">
                {likeCount > 0 ? likeCount : null}
              </span>
            </button>
            <button
              className="flex items-center gap-1.5 hover:opacity-60 transition"
              onClick={() => onToggleComment(postData)}
            >
              <RiChat3Line size={24} />
              <span className="text-sm font-medium">
                {postData.comment_count > 0 ? postData.comment_count : null}
              </span>
            </button>
            <button className="flex items-center gap-1.5 hover:opacity-60 transition">
              <RiSendPlaneLine size={24} />
              <span className="text-sm font-medium">
                {postData.share_count > 0 ? postData.share_count : null}
              </span>
            </button>
          </div>
          <div
            className="hover:opacity-60 cursor-pointer transition"
            onClick={() => handleSaveThisPost(postData.post_id)}
            aria-label={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
          >
            {isSaved ? <RiBookmarkFill size={24} /> : <RiBookmarkLine size={24} />}
          </div>
        </div>
      </div>

      {/* Mở postOptionsMenu */}
      {postOptionsMenu && (
        <div className="">
          {isMyPost ? (
            <div
              className="w-full h-screen bg-black/40 fixed inset-0 z-1000 flex justify-center items-center p-4"
              onClick={() => onPostOptionsMenu()}
            >
              <div
                className="bg-white flex flex-col w-full max-w-xs rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="p-4 border-b border-black/10 hover:bg-gray-50 transition"
                  onClick={handleOpenEditPost}
                >
                  Chỉnh sửa bài viết
                </button>
                <button
                  className="p-4 border-b text-red-500 border-black/10 hover:bg-gray-50 transition"
                  onClick={handleOpenDelete}
                >
                  Gỡ bài viết
                </button>
                <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
                  Chia sẻ
                </button>
                <button
                  className="p-4 hover:bg-gray-50 transition"
                  onClick={() => onPostOptionsMenu()}
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-screen bg-black/40 fixed inset-0 z-1000 flex justify-center items-center p-4"
              onClick={() => onPostOptionsMenu()}
            >
              <div
                className="bg-white flex flex-col w-full max-w-xs rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="p-4 text-red-500 font-bold border-b border-black/10 hover:bg-gray-50 transition" onClick={() => onToggleReport(postData.post_id)}>
                  Báo vi phạm
                </button>
                <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
                  Lưu bài viết
                </button>
                <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
                  Chia sẻ
                </button>
                <button
                  className="p-4 hover:bg-gray-50 transition"
                  onClick={() => onPostOptionsMenu()}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <EditPostModal
        open={isEditingPost}
        post={editingPost}
        onClose={() => setIsEditingPost(false)}
        onSaved={handleSavedPost}
      />

      {/* Mở comment */}
      {isComment && (
        <div className="">
          <CommentSheet
            onClose={onCloseComment}
            post={selectedPost}
            kind={"post"}
          />
        </div>
      )}

      {/* Mở xác nhận gỡ bái viết*/}
      {isDelete && selectedPostId !== null && (
        <DeletePost
          post_id={selectedPostId}
          type="post"
          onClose={handleCloseDelete}
          onDeleted={handleDeletedPost}
        />
      )}

      {/* Báo cáo bài viết */}
      {isReport && (
        <Report post_id={selectedPostId} onCloseReport={onCloseReport} />
      )}
    </>
  );
}

export default PostCard;
