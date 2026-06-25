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
} from "@remixicon/react";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import CommentSheet from "./comments-sheet";

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

interface PostCardProps {
  i: Post;
}

function PostCard({ i }: PostCardProps) {
  const router = useRouter();
  const [postOptionsMenu, setPostOptionsMenu] = useState<boolean>(false);

  // hàm mở PostOptionsMenu
  const onPostOptionsMenu = () => {
    setPostOptionsMenu((v) => !v);
  };

  // State lưu trạng thái comment
  const [isComment, setIsComment] = useState<boolean>(false);

  const avatarSrc = i.author?.avatar_url
    ? `${port}${i.author.avatar_url}`
    : "/Profile-Default.webp";

  const [liked, setLiked] = useState<boolean>(i.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState<number>(i.like_count ?? 0);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(i.liked_by_me ?? false);
    setLikeCount(i.like_count ?? 0);
  }, [i.liked_by_me, i.like_count]);

  const handleTogglePostLike = useCallback(async () => {
    if (isLiking) return;

    const nextLiked = !liked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);
    setIsLiking(true);

    try {
      const response = await fetch(`${port}/api/posts/${i.post_id}/like`, {
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
  }, [liked, likeCount, isLiking, i.post_id]);

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
              onClick={() => router.push(`/profile/${i.author?.user_id}`)}
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
                <p className="font-semibold text-sm hover:underline">
                  {i.author?.name || "Anonymous"}
                </p>
                <p className="text-xs opacity-50">
                  {new Date(i.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="cursor-pointer duration-150 hover:bg-gray-100 p-2 rounded-full"
              onClick={() => onPostOptionsMenu()}
            >
              <RiMoreLine size={20} />
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-gray-800">
            {i.content}
          </p>
        </div>
        <div className="relative w-full bg-black overflow-hidden flex justify-center md:rounded-md">
          {i.media && i.media.length > 0 && (
            <div className="w-full flex flex-col gap-1">
              <Swiper
                modules={[Pagination]}
                pagination={i.media.length > 1 ? { type: "fraction" } : false}
                grabCursor
                spaceBetween={0}
                slidesPerView={1}
                className="w-full bg-black/60 text-white text-xs font-medium"
              >
                {i.media.map((m: PostMedia) => {
                  const mediaSrc = m.media_url
                    ? `${port}${m.media_url}`
                    : "/placeholder.jpg";
                  return (
                    <SwiperSlide
                      key={m.post_media_id}
                      className="relative w-full min-h-75 md:min-h-100"
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
              onClick={() => onToggleComment(i)}
            >
              <RiChat3Line size={24} />
              <span className="text-sm font-medium">
                {i.comment_count > 0 ? i.comment_count : null}
              </span>
            </button>
            <button className="flex items-center gap-1.5 hover:opacity-60 transition">
              <RiSendPlaneLine size={24} />
              <span className="text-sm font-medium">
                {i.share_count > 0 ? i.share_count : null}
              </span>
            </button>
          </div>
          <div className="hover:opacity-60 cursor-pointer transition">
            <RiBookmarkLine size={24} />
          </div>
        </div>
      </div>

      {/* Mở postOptionsMenu */}
      {postOptionsMenu && (
        <div
          className="w-full h-screen bg-black/40 fixed inset-0 z-1000 flex justify-center items-center p-4"
          onClick={() => onPostOptionsMenu()}
        >
          <div
            className="bg-white flex flex-col w-full max-w-xs rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="p-4 text-red-500 font-bold border-b border-black/10 hover:bg-gray-50 transition">
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
    </>
  );
}

export default PostCard;
