"use client";
import Image from "next/image";
import port from "@/api/api";
import Link from "next/link";
import {
  RiMoreLine,
  RiHeart3Line,
  RiChat3Line,
  RiSendPlaneLine,
  RiBookmarkLine,
} from "@remixicon/react";
import { useState } from "react";

interface PostMedia {
  post_media_id: number;
  media_url: string;
  type: string;
}

interface PostAuthor {
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
}

interface PostCardProps {
  i: Post;
}

function PostCard({ i }: PostCardProps) {
  const [postOptionsMenu, setPostOptionsMenu] = useState<boolean>(false);

  // state lưu giá trị của post_id
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // hàm mở PostOptionsMenu
  const onPostOptionsMenu = (post_id: number | null) => {
    setSelectedPostId(post_id);
    setPostOptionsMenu((v) => !v);
  };

  const avatarSrc = i.author?.avatar_url
    ? `${port}${i.author.avatar_url}`
    : "/Profile-Default.webp";

  return (
    <>
      <div className="px-5 md:px-0" key={i.post_id}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer">
              <Image
                src={avatarSrc}
                alt="avatar"
                width={40}
                height={40}
                className="rounded-[100%]"
              />
              <div className="">
                <p className="font-semibold">{i.author?.name || "Anonymous"}</p>
                <p className="text-sm opacity-50">
                  {new Date(i.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="cursor-pointer duration-150 hover:bg-stone-500/20 p-2 rounded-[100%]"
              onClick={() => onPostOptionsMenu(i.post_id)}
            >
              <RiMoreLine />
            </div>
          </div>
          <p>{i.content}</p>
        </div>
        <div className="my-0 md:my-1">
          {i.media && i.media.length > 0 && (
            <div className="bg-black flex justify-center items-center rounded-md">
              {i.media.map((m: PostMedia) => {
                const mediaSrc = m.media_url
                  ? `${port}${m.media_url}`
                  : "/placeholder.jpg";
                return (
                  <Image
                    key={m.post_media_id}
                    src={mediaSrc}
                    alt="post_url"
                    width={450}
                    height={150}
                    className="w-auto h-fit max-h-150 object-cover"
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center py-2">
          <div className="flex gap-3">
            <Link href={"#"} className="flex items-center gap-1">
              <RiHeart3Line />
              <span>{i.like_count > 0 ? i.like_count : null}</span>
            </Link>
            <Link href={"#"} className="flex items-center gap-1">
              <RiChat3Line />
              <span>{i.comment_count > 0 ? i.comment_count : null}</span>
            </Link>
            <Link href={"#"} className="flex items-center gap-1">
              <RiSendPlaneLine />
              <span>{i.share_count > 0 ? i.share_count : null}</span>
            </Link>
          </div>
          <div className="">
            <RiBookmarkLine />
          </div>
        </div>
      </div>

      {/* Mở postOptionsMenu */}
      {postOptionsMenu && (
        <div className="w-full h-screen bg-black/10 fixed z-100000 top-0 left-0 flex justify-center items-center" onClick={() => onPostOptionsMenu(null)}>
          <div className="bg-white flex flex-col gap-4 p-2 rounded-md">
            <Link href={"#"}>Báo vi phạm</Link>
            <Link href={"#"}>Lưu</Link>
            <Link href={"#"}>Chia sẽ</Link>
          </div>
        </div>
      )}
    </>
  );
}

export default PostCard;
