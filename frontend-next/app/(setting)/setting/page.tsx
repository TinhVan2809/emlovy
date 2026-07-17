"use client";
import { RiArrowLeftLine, RiSearchLine } from "@remixicon/react";
import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/context/useUserContext";
import { useRouter } from "next/navigation";
import { FaRegUserCircle } from "react-icons/fa";
import port from "@/api/api";

export default function Setting() {
  const { user } = useUser();
  const [settingTab, setSettingTab] = useState("private");
  const router = useRouter();

  const avatarSrc = `${user?.avatar_url}` ? `${port}/${user?.avatar_url}` : "/default-avata.jpeg" 

  return (
    <div className="flex flex-col md:gap-10 gap-5 md:p-10">
      {/* Header */}
      <div className="flex md:gap-10 gap-4">
        <p className="flex items-center">
          <RiArrowLeftLine
            onClick={() => router.back()}
            className="cursor-pointer"
          />
          <span>Cài đặt</span>
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-200/40 w-fit">
          <RiSearchLine className="cursor-pointer" />
          <input
            type="text"
            placeholder="Tìm kiếm cài đặt"
            className="outline-0 w-35 md:w-60"
          />
        </div>
      </div>

      {/* Main */}
      <div className="">
        <div className="grid grid-cols-11 w-full">
          {/* Left */}
          <div className="col-span-3 p-3">
            <div className="">
              <p className="text-xl font-semibold mb-5">Cài đặt và quyền riêng tư</p>
              <div className="flex flex-col gap-3">
                <p className="font-semibold">Tài khoản của bạn</p>
                <div className="flex gap-4 cursor-pointer hover:bg-gray-200/50 p-3 rounded-md" onClick={() => router.push("/setting/profile_setting")}>
                  <FaRegUserCircle size={22}/>
                  <p className="text-sm text-black/50 flex flex-col">
                    <span>Tài khoản của bạn</span>
                    <span>Thông tin cá nhân, mật khẩu và quyền riêng tư</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right // Thay đổi theo trạng thái */}
          <div className="col-span-8">
            {settingTab == "private" && (
              <div className="">
                <div className="relative md:w-15 md:h-15">
                    <Image src={avatarSrc} alt="avatar" fill className="rounded-full"/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
