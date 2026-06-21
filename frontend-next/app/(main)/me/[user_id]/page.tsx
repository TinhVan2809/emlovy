"use client";
import port from "@/api/api";
import { useUser } from "@/context/useUserContext";
import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { RiSettingsLine } from "@remixicon/react";
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
  };
  posts: number;
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
      cache: 'force-cache',
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
            <span className="text-sm opacity-50">@{user?.username}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 col-span-2">
          <div className="flex items-center gap-5">
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">{myProfile?.stats?.posts}</span>{" "}
              Bài viết
            </span>
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">
                {myProfile?.stats?.followers}
              </span>{" "}
              Người theo dõi
            </span>
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">
                {myProfile?.stats?.following}
              </span>{" "}
              Đang theo dõi
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSetting}>
              <RiSettingsLine />
            </button>
            <button className="bg-gray-100 min-w-30 md:min-w-45 py-1.5 rounded-md text-sm md:text-16px">
              Xem kho lưu trữ
            </button>
            <button className="bg-gray-100 min-w-30 md:min-w-45 py-1.5 rounded-md text-sm md:text-16px">
              Chia sẻ trang cá nhân
            </button>
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
          <div className="bg-white flex flex-col gap-5 p-3 rounded-2xl">
            <button>Cài đặt trang cá nhân</button>
            <button>Cài đặt hệ thống</button>
            <button>Cài đặt quyền riêng tư</button>
            <button>Mã QR</button>
            <button onClick={logout}>Đăng xuất</button>
            <button onClick={() => setIsSetting(false)}>Hủy</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
