import port from "@/api/api";
import Image from "next/image";
import {
  RiArrowRightUpLine,
  RiQrCodeLine,
  RiUserAddLine,
} from "@remixicon/react";

interface Props {
  params: Promise<{ user_id: string }>;
}

interface ProfileData {
  name?: string;
  nickname?: string;
  username?: string;
  avatar_url?: string;
  avata?: string;
  signature?: string;
  email?: string;
  stats?: {
    posts?: number;
    followers?: number;
    following?: number;
    likes?: number;
  };
}

async function Profile({ params }: Props) {
  const { user_id } = await params;

  const response = await fetch(`${port}/api/profile/${user_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();
  const profile = data?.data?.profile as ProfileData | null;

  if (!response.ok || !profile) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Không tìm thấy hồ sơ người dùng.
      </div>
    );
  }

  const avatarSrc = profile.avatar_url || profile.avata
    ? `${port}/${profile.avatar_url || profile.avata}`
    : "/Profile-Default.webp";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-3 items-center gap-5 md:gap-10 py-5 md:py-10">
        <div className="flex flex-col justify-center items-center md:col-span-1">
          <div className="mb-1.5">
            <div className="relative w-25 h-25 md:w-30 md:h-30">
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
            <span>{profile.name || "Người dùng"}</span>
            <span className="text-sm opacity-50">
              {profile.nickname || profile.username || ""}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 md:col-span-2">
          <div className="flex justify-center md:justify-start items-center gap-5">
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="font-bold text-md md:text-xl">
                {profile.stats?.posts ?? 0}
              </span>
              <span className="text-[10px] md:text-[12px] text-gray-400 uppercase font-semibold">
                Posts
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="font-bold text-md md:text-xl">
                {profile.stats?.followers ?? 0}
              </span>
              <span className="text-[10px] md:text-[12px] text-gray-400 uppercase font-semibold">
                Followers
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="font-bold text-md md:text-xl">
                {profile.stats?.following ?? 0}
              </span>
              <span className="text-[10px] md:text-[12px] text-gray-400 uppercase font-semibold">
                Following
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="font-bold text-md md:text-xl">
                {profile.stats?.likes ?? 0}
              </span>
              <span className="text-[10px] md:text-[12px] text-gray-400 uppercase font-semibold">
                Likes
              </span>
            </div>
          </div>

          <div className="flex gap-3 items-center justify-center md:justify-start">
            <div className="cursor-pointer border border-gray-400 rounded-md p-1">
              <RiQrCodeLine size={20} className="opacity-70" />
            </div>
            <div className="cursor-pointer border border-gray-400 rounded-md p-1">
              <RiUserAddLine size={20} className="opacity-70" />
            </div>
            <div className="cursor-pointer border border-gray-400 rounded-md p-1">
              <RiArrowRightUpLine size={20} className="opacity-70" />
            </div>
          </div>

          <div className="flex justify-center md:justify-start">
            <p>{profile.signature || "Chưa có tiểu sử"}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
        {profile.email ? <p>Email: {profile.email}</p> : null}
      </div>
    </div>
  );
}

export default Profile;