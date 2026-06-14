"use client";
import port from "@/api/api";
import Image from "next/image";
import {
  RiMoreLine,
  RiVerifiedBadgeFill,
  RiCheckboxBlankCircleFill,
  RiCameraFill,
  RiUserFollowFill,
  RiGroupLine,
  RiPokerHeartsLine,
  RiHeartLine,
  RiChat3Line,
  RiTimer2Line,
} from "@remixicon/react";

import { IPostsResponse, IUserProfileApiResponse } from "./user";
import { useState } from "react";
import ProfileCardStats from "@/components/admin/ProfileCardStats";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return "N/A";

  const intervals: { [key: string]: number } = {
    năm: 31536000,
    tháng: 2592000,
    tuần: 604800,
    ngày: 86400,
    giờ: 3600,
    phút: 60,
    giây: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const counter = Math.floor(diffInSeconds / seconds);
    if (counter >= 1) {
      return `${counter} ${unit} trước`;
    }
  }
  return "vừa xong";
};

interface ProfileProps {
  user: IUserProfileApiResponse | null;
  posts: IPostsResponse | null;
}

function Profile({ user, posts }: ProfileProps) {
  const [tab, setTab] = useState("overview");

  const avatarSrc = user?.data?.profile?.avata
    ? `${port}${user?.data?.profile?.avata}`
    : "/Profile-Default.webp";

  return (
    <>
      <div className="flex flex-col rounded-2xl shadow-sm">
        <div className="w-full">
          <div className="relative w-full h-55">
            <Image
              src={"/background-user-profile.avif"}
              fill
              priority
              alt="background"
              className="object-cover rounded-tr-2xl rounded-tl-2xl"
            />
            <div className="absolute top-0 right-0 w-full h-full p-4 flex justify-end bg-[#271445]/70">
              <div className="flex gap-1 items-center h-fit bg-black/50 p-1 rounded-2xl cursor-pointer">
                <RiCameraFill size={14} color="#fff" />
                <span className="text-white text-sm font-bold">Edit Cover</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col -mt-10 px-3 md:px-8 ">
          <div className="flex flex-col gap-1">
            <div className="flex w-full items-end justify-between">
              <div className="relative w-20 h-20">
                <Image
                  src={avatarSrc}
                  fill
                  priority
                  alt="background"
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3">
                <p>
                  {user?.data?.profile?.status === 1 ? (
                    <span className="text-green-700 bg-green-300/20 px-2 rounded-[25px] flex items-center gap-1 text-sm font-semibold">
                      <RiCheckboxBlankCircleFill size={7} />
                      Active
                    </span>
                  ) : (
                    <span className="text-red-700 bg-red-300/20 pb-3 px-2 rounded-[25px] flex items-center gap-1 text-sm font-semibold">
                      Block
                    </span>
                  )}
                </p>
                <p className="cursor-pointer border border-black/50 rounded-full p-0.5 hover:bg-gray-100">
                  <RiMoreLine />
                </p>
              </div>
            </div>
            <div className="flex flex-col ">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl">
                  {user?.data?.profile?.name}
                </span>
                {user?.data?.profile?.is_verified === 1 ? (
                  <RiVerifiedBadgeFill size={20} className="text-blue-600" />
                ) : null}
              </div>
              <span>@{user?.data?.profile?.username}</span>
              <span>{user?.data?.profile?.email || null}</span>
              <span>{user?.data?.profile?.signature}</span>
              <span>
                Joined{" "}
                {user?.data?.profile?.created_at
                  ? new Date(user.data.profile.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
        <div className="px-3 md:px-8 flex pt-5">
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("overview")}
            style={{
              borderBottom: tab === "overview" ? "2px solid blue" : "none",
            }}
          >
            Overview
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("personal-info")}
            style={{
              borderBottom:
                tab === "personal-info" ? "2px solid blue" : "none",
            }}
          >
            Personal Info
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("account-status")}
            style={{
              borderBottom:
                tab === "account-status" ? "2px solid blue" : "none",
            }}
          >
            Account Status
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("security")}
            style={{
              borderBottom: tab === "security" ? "2px solid blue" : "none",
            }}
          >
            Security
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("statistics")}
            style={{
              borderBottom: tab === "statistics" ? "2px solid blue" : "none",
            }}
          >
            Statistics
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("moderation")}
            style={{
              borderBottom: tab === "moderation" ? "2px solid blue" : "none",
            }}
          >
            Moderation
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("activity")}
            style={{
              borderBottom: tab === "activity" ? "2px solid blue" : "none",
            }}
          >
            Activity
          </button>
          <button
            className="px-3 pb-3 text-black"
            onClick={() => setTab("admin-actions")}
            style={{
              borderBottom:
                tab === "admin-actions" ? "2px solid blue" : "none",
            }}
          >
            Admin Actions
          </button>
        </div>
      </div>
      <div className="">
        {tab == "overview" && (
          <div className=" py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="">
                <ProfileCardStats
                  title="Followers"
                  stats={user?.data?.profile?.stats?.followers}
                  icon={
                    <RiUserFollowFill size={18} className="text-blue-600" />
                  }
                />
              </div>
              <div className="">
                <ProfileCardStats
                  title="Following"
                  stats={user?.data?.profile?.stats?.following}
                  icon={<RiGroupLine size={18} className="text-blue-600" />}
                />
              </div>
              <div className="">
                <ProfileCardStats
                  title="Posts"
                  stats={user?.data?.profile?.stats?.posts}
                  icon={<RiCameraFill size={18} className="text-green-600" />}
                />
              </div>
              <div className="">
                <ProfileCardStats
                  title="Likes"
                  stats={user?.data?.profile?.stats?.likes}
                  icon={
                    <RiPokerHeartsLine size={18} className="text-red-600" />
                  }
                />
              </div>
            </div>
            {/* Posts list*/}
            <div className="flex flex-col gap-8 shadow-sm p-3 mt-5 rounded-2xl">
              {posts?.data?.items.map((post) => {
                // Lấy đường dẫn media từ chuỗi hoặc từ phần tử đầu tiên của mảng
                const mediaPath = Array.isArray(post.media)
                  ? post.media[0]?.media_url
                  : post.media;

                const mediaUrl = mediaPath ? `${port}${mediaPath}` : null;
                const isVideo =
                  mediaPath && /\.(mp4|webm|ogg|mov|m4v)$/i.test(mediaPath);

                return (
                  <div key={post.post_id} className="flex items-center w-full">
                    <div className="">
                      <div className="relative w-12.5 h-12.5 overflow-hidden">
                        {mediaUrl ? (
                          isVideo ? (
                            <video
                              src={mediaUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={mediaUrl}
                              alt="post media"
                              fill
                              priority
                              className="object-cover rounded-xl"
                            />
                          )
                        ) : (
                          <Image
                            src="/image-gallery.png"
                            alt="default"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="px-3 flex flex-col gap-1 justify-end">
                        <span className="font-semibold">{post.content}</span>
                        <div className="flex gap-2 items-center">
                          <p className="flex text-sm items-center">
                            <RiHeartLine size={15} />
                            <span>{post.like_count}</span>
                          </p>
                          <p className="flex text-sm items-center">
                            <RiChat3Line size={15} />
                            <span>{post.comment_count}</span>
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <p className="flex items-center text-[12px] opacity-65">
                          <RiTimer2Line size={13} />
                          <span>{formatRelativeTime(post.created_at)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab == "personal-info" && <div className="">Personal Info</div>}
        {tab == "account-status" && <div className="">Account Status</div>}
        {tab == "security" && <div className="">Security</div>}
        {tab == "statistics" && <div className="">Statistics</div>}
        {tab == "moderation" && <div className="">Moderation</div>}
        {tab == "activity" && <div className="">Activity</div>}
        {tab == "admin-actions" && <div className="">Admin Actions</div>}
      </div>
    </>
  );
}

export default Profile;
