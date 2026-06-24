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
import {RiAddLine, RiSendInsFill} from '@remixicon/react';

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
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type Props = {
  onClose: React.MouseEventHandler<HTMLDivElement>;
  post: Post | null;
  kind: string;
};

function CommentItem({ comment }: { comment: Comment }) {
  const avatarSrc = comment.author?.avatar_url
    ? `${port}${comment.author.avatar_url}`
    : "/Profile-Default.webp";

  return (
    <div className="flex gap-3 items-start">
      <div className="relative w-8 h-8 shrink-0">
        <Image
          src={avatarSrc}
          alt="avatar"
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full">
        <div className="bg-gray-100 rounded-xl px-3 py-2 w-fit">
         <p className="flex items-center gap-3 md:gap-5">
           <span className="font-semibold text-sm">{comment.author.name}</span>
           <span className="text-[10px] text-black/50">{new Date(comment.created_at).toLocaleDateString()}</span>
         </p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex gap-3 text-xs px-3 text-gray-500">
          <button className="font-semibold">Thích</button>
          <button className="font-semibold">Phản hồi</button>
          {comment.like_count > 0 && (
            <div className="flex items-center gap-1">
              {comment.liked_by_me ? (
                <RiHeart3Fill size={14} className="text-red-500" />
              ) : (
                <RiHeart3Line size={14} />
              )}
              <span>{comment.like_count}</span>
            </div>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
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

  const fetchComments = useCallback(
    async (pageNum: number, replace = false) => {
      if (!post) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${port}/api/posts/${post.post_id}/comments?page=${pageNum}&limit=20`,
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
    [post],
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

    socket.on("post:commented", handleNewComment);

    // Dọn dẹp listener khi component unmount hoặc khi post thay đổi
    return () => {
      socket.off("post:commented", handleNewComment);
    };
  }, [socket, post]);

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

  if (!post) return null;


  return (
    <div
      className="w-full h-screen fixed top-0 right-0 z-10000 bg-black/50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="w-full h-full md:h-[90vh] md:max-w-7xl bg-white shadow-2xl md:rounded-lg flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-[55%] md:h-full md:w-1/2 bg-black flex items-center justify-center">
          {post.media && post.media.length > 0 && (
            <Swiper
              modules={[SwiperPagination]}
              pagination={post.media.length > 1 ? { type: "fraction" } : false}
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
        </div>
        <div className="w-full md:w-1/2 flex flex-col flex-1">
          <div
            ref={commentsContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 overflow-y-auto space-y-4"
          >
            {comments.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <p>Chưa có bình luận nào.</p>
            )}
            {isLoading && (
              <div className="w-full flex flex-col gap-4 items-center justify-center animate-pulse">
                <div className="w-60 flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-8 h-8"></div>
                    <div className="bg-gray-100 w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-40 flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-8 h-8"></div>
                    <div className="bg-gray-100 w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-50 flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-8 h-8"></div>
                    <div className="bg-gray-100 w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-50 flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-8 h-8"></div>
                    <div className="bg-gray-100 w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-15 rounded-xl w-full"></div>
                </div>
                <div className="w-70 flex gap-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-gray-100 rounded-full w-8 h-8"></div>
                    <div className="bg-gray-100 w-30 h-2 rounded-2xl"></div>
                  </div>
                  <div className="bg-gray-100 h-15 rounded-xl w-full"></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="p-4 bg-gray-200 rounded-2xl flex tems-center justify-between">
            <div className="flex gap-2">
               <p className="p-1 rounded-full bg-white cursor-pointer">
                <RiAddLine size={22}/>
               </p>
            
               <input
                name=""
                placeholder="Nhập bình luận của bạn"
                className="w-full outline-0"
              />
           
            </div>
            <button className="">
              <RiSendInsFill size={22}/>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
