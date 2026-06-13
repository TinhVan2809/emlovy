"use client";
import {
  RiNotification4Line,
  RiMailOpenLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import { useUser } from "@/context/useUserContext";
import Image from "next/image";
import port from "@/api/api";
import { useState } from "react";
function Header() {
  const { user, logout } = useUser();
  const [isMenu, setIsMenu] = useState(false);

  const avatarSrc = user?.avatar_url
    ? `${port}${user?.avatar_url}`
    : "/Profile-Default.webp";

  return (
    <header className="w-full flex justify-end items-center px-10 py-3">
      <div className="flex items-center gap-10 ">
        <div className="">
          <RiNotification4Line />
        </div>
        <div className="">
          <RiMailOpenLine />
        </div>
        <div className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image src={avatarSrc} alt="avatar" fill priority />
            </div>
            <div className="relative" onClick={() => setIsMenu((v) => !v)}>
              <div className="flex items-center justify-between gap-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{user?.name}</span>
                  <span className="text-sm opacity-50">Quản trị viên</span>
                </div>
                <RiArrowDownSLine />
              </div>
              {isMenu && (
                <div className="absolute top-10 right-0 z-1000 bg-white py-4 px-7 rounded-2xl shadow-2xl w-45">
                  <ul className="flex flex-col gap-5">
                    <li>Cá nhân</li>
                    <li>Lịch sử</li>
                    <li onClick={logout}>Đăng xuất</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
