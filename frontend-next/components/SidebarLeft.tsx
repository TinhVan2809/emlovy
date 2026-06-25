'use client';
import {
  RiHomeLine,
  RiCameraLensFill,
  RiAddLargeLine,
  RiSearchLine,
  RiNotification2Line,
} from "@remixicon/react";
import { CgDetailsMore } from "react-icons/cg";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/useUserContext";
import port from "@/api/api";
import { useRouter } from "next/navigation";

function SidebarLeft() {
  const {user} = useUser();
  const router = useRouter();

  const avatarSrc = user?.avatar_url
    ? `${port}${user.avatar_url}`
    : "/Profile-Default.webp";

  return (
    <div className="flex w-full bg-white py-2 fixed z-1000 bottom-0 lg:w-auto lg:bg-auto lg:flex-col lg:justify-between lg:h-screen  lg:top-0 lg:py-6 lg:px-5">
      <div className="hidden lg:px-3 lg:block">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push("/")}>
          <Image src={"/logo.png"} width={42} height={42} alt="logo.png" loading="eager"/>
          <span className="font-[Playwrite_DK_Uloopet]">Emlovy</span>
        </div>
      </div>
      <div className="flex justify-around w-full lg:flex-col lg:gap-4">
        <Link
          href={"/"}
          className="flex items-center lg:gap-4 lg:px-3 lg:py-1.5 lg:rounded-[20px] lg:min-w-60 lg:duration-200 lg:hover:bg-stone-300/40"
        >
          <RiHomeLine /> <span className="hidden lg:block">Trang chủ</span>
        </Link>
        <Link
          href={"/reels"}
          className="flex items-center lg:gap-4 lg:px-3 lg:py-1.5 lg:rounded-[20px] lg:min-w-60 lg:duration-200 lg:hover:bg-stone-300/40"
        >
          <RiCameraLensFill /> <span className="hidden lg:block">Reels</span>
        </Link>
        <Link
          href={"/create"}
          className="flex items-center lg:gap-4 lg:px-3 lg:py-1.5 lg:rounded-[20px] lg:min-w-60 lg:duration-200 lg:hover:bg-stone-300/40"
        >
          <RiAddLargeLine /> <span className="hidden lg:block">Tạo</span>
        </Link>
        <Link
          href={"/search"}
          className="flex items-center lg:gap-4 lg:px-3 lg:py-1.5 lg:rounded-[20px] lg:min-w-60 lg:duration-200 lg:hover:bg-stone-300/40"
        >
          <RiSearchLine /> <span className="hidden lg:block">Tìm kiếm</span>
        </Link>
        <Link
          href={"/notifications"}
          className="flex items-center lg:gap-4 lg:px-3 lg:py-1.5 lg:rounded-[20px] lg:min-w-60 lg:duration-200 lg:hover:bg-stone-300/40"
        >
          <RiNotification2Line />{" "}
          <span className="hidden lg:block">Thông báo</span>
        </Link>
        <Link
         href={`/me/${user?.user_id}`}
          className="block lg:hidden"
        >
          <div className="w-8 h-8 relative">
            <Image src={avatarSrc} fill alt="avatar" className="rounded-full"/>
          </div>
        </Link>
      </div>
      <div className="px-3 hidden lg:flex lg:flex-col">
        <Link href={"#"}><CgDetailsMore size={30}/></Link>
        <Link href={`/me/${user?.user_id}`} className="flex items-center gap-3 mt-2 cursor-pointer duration-200 hover:bg-black/3 rounded-lg py-1">
          <div className="relative w-10 h-10 shrink-0">
            <Image src={avatarSrc} alt="avatar" fill className="rounded-full" loading="eager"/>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold truncate max-w-35">{user?.name || "Guest"}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SidebarLeft;
