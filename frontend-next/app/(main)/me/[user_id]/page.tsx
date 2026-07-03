"use client";
import port from "@/api/api";
import { useUser } from "@/context/useUserContext";
import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { RiSettings2Line, RiQrCodeLine, RiArrowRightUpLine } from "@remixicon/react";
import Link from "next/link";
import {
  RiLayoutGrid2Fill,
  RiLayoutGrid2Line,
  RiBookmarkLine,
  RiBookmarkFill,
  RiShieldUserLine,
  RiShieldUserFill,
} from "@remixicon/react";
import MyPosts, { Post } from "@/components/me/MyPosts";
import Saved from "@/components/me/Saved";
interface Props {
  params: Promise<{ user_id: string }>;
}

interface Profile {
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
  posts: number;
  signature: string;
}

function Profile({ params }: Props) {
  const { user, logout } = useUser();
  const { user_id } = use(params);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [isSetting, setIsSetting] = useState(false);

  const [tab, setTab] = useState("list");

  // Get My Post
  const handleFetchMyPosts = useCallback(async (page = 1, limit = 10) => {
    const response = await fetch(
      `${port}/api/posts/me?page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (data.success) {
      setMyPosts(data?.data?.items || []);
    }
  }, []);

  // Get Full My Profile
  const handleFetchMyProfile = useCallback(async () => {
    const response = await fetch(`${port}/api/profile/me?user_id=${user_id}`, {
      method: "GET",
      credentials: "include",
      cache: "force-cache",
    });

    const data = await response.json();

    if (data.success) {
      setMyProfile(data.data.profile);
    }
  }, [user_id]);

  useEffect(() => {
    handleFetchMyProfile(); //eslint-disable-line
    handleFetchMyPosts();
  }, [user?.user_id, handleFetchMyProfile, handleFetchMyPosts]);

  // Avatar handler
  const avatarSrc = user?.avatar_url
    ? `${port}${user.avatar_url}`
    : "/Profile-Default.webp";

  // Setting Event
  const onSetting = () => {
    setIsSetting((v) => !v);
  };

  return (
    <>
      <div className=" flex flex-col md:grid md:grid-cols-3 items-center gap-5 md:gap-10 py-5 md:py-10">
        <div className="flex flex-col justify-center items-center md:col-span-1">
          <div className="mb-1.5">
            <div className="relative w-20 h-20 md:w-30 md:h-30">
              <Image
                src={avatarSrc}
                alt="avatar"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col text-center">
            <span>{user?.name}</span>
            <span className="text-sm opacity-50">{user?.nickname}</span>
          </div>
        </div>


          <div className="flex w-full flex-col gap-5 col-span-2">
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="font-bold text-xl">{myProfile?.stats?.posts}</span>
                <span className="text-sm opacity-70">Bài viết</span>
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="font-bold text-xl">{myProfile?.stats?.followers}</span>
                <span className="text-sm opacity-70">Người theo dõi</span>
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="font-bold text-xl">{myProfile?.stats?.following}</span>
                <span className="text-sm opacity-70">Đang theo dõi</span>
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="font-bold text-xl">{myProfile?.stats?.likes}</span>
                <span className="text-sm opacity-70">Likes</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="cursor-pointer border border-gray-400 rounded-md p-1">
                <RiQrCodeLine size={20} className="opacity-70"/>
              </div>
              <div className="cursor-pointer border border-gray-400 rounded-md p-1" onClick={onSetting}>
                <RiSettings2Line size={20} className="opacity-70"/>
              </div>
              <div className="cursor-pointer border border-gray-400 rounded-md p-1">
                <RiArrowRightUpLine size={20} className="opacity-70"/>
              </div>
            </div>
            <div className="">
              <p>{myProfile?.signature}</p>
            </div>
          </div>

      </div>

      <div className="mt-5 md:mt-15">
        <div className="flex w-full justify-around items-center">
          <Link href={"#"} onClick={() => setTab("list")}>
            {tab === "list" ? (
              <RiLayoutGrid2Fill size={26} className="sm:text-sm" />
            ) : (
              <RiLayoutGrid2Line size={26} className="sm:text-sm" />
            )}
          </Link>
          <Link href={"#"} onClick={() => setTab("saved")}>
            {tab === "saved" ? (
              <RiBookmarkFill size={26} className="sm:text-sm" />
            ) : (
              <RiBookmarkLine size={26} className="sm:text-sm" />
            )}
          </Link>
          <Link href={"#"} onClick={() => setTab("you")}>
            {tab === "you" ? (
              <RiShieldUserFill size={26} className="sm:text-sm" />
            ) : (
              <RiShieldUserLine size={26} className="sm:text-sm" />
            )}
          </Link>
        </div>
      </div>

      <div className="py-10">
        {tab === "list" && <MyPosts myPosts={myPosts} />}

        {tab === "saved" && <Saved />}

        {tab === "you" && <div className="">co mac ban</div>}
      </div>

      {isSetting && (
        <div className="fixed z-1000 top-0 left-0 w-full h-screen bg-black/10 flex justify-center items-center">
          <div className="bg-white flex flex-col w-full max-w-xs rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
              Cài đặt trang cá nhân
            </button>
            <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
              Cài đặt hệ thống
            </button>
            <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
              Cài đặt quyền riêng tư
            </button>
            <button className="p-4 border-b border-black/10 hover:bg-gray-50 transition">
              Mã QR
            </button>
            <button
              className="p-4 border-b border-black/10 hover:bg-gray-50 transition"
              onClick={logout}
            >
              Đăng xuất
            </button>
            <button
              className="p-4 border-b border-black/10 hover:bg-gray-50 transition"
              onClick={() => setIsSetting(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
