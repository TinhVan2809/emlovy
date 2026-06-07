import {
  RiHomeLine,
  RiCameraLensFill,
  RiAddLargeLine,
  RiSearchLine,
  RiNotification2Line,
  RiLoginBoxFill,
} from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
function SidebarLeft() {
  return (
    <div className="flex w-full bg-white py-2 fixed z-1000 bottom-0 md:w-auto md:bg-auto md:flex-col md:justify-between md:h-screen  md:top-0 md:py-6 md:px-5">
      <div className="hidden md:px-3 md:block">
        <div className="flex items-center gap-1">
          <Image src={"/logo.png"} width={42} height={42} alt="logo.png" />{" "}
          <span className="font-[Playwrite_DK_Uloopet]">Emlovy</span>
        </div>
      </div>
      <div className="flex justify-around w-full md:flex-col md:gap-4">
        <Link
          href={"/"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiHomeLine /> <span className="hidden md:block">Home</span>
        </Link>
        <Link
          href={"reels"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiCameraLensFill /> <span className="hidden md:block">Reels</span>
        </Link>
        <Link
          href={"/create"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiAddLargeLine /> <span className="hidden md:block">Add</span>
        </Link>
        <Link
          href={"/search"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiSearchLine /> <span className="hidden md:block">Search</span>
        </Link>
        <Link
          href={"/notifications"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiNotification2Line />{" "}
          <span className="hidden md:block">Notifications</span>
        </Link>
        <Link
          href={"/login"}
          className="flex items-center md:gap-4 md:px-3 md:py-1.5 md:rounded-[20px] md:min-w-60 md:duration-200 md:hover:bg-stone-300/40"
        >
          <RiLoginBoxFill />
          <span>Login</span>
        </Link>
      </div>
      <div className="px-3 hidden md:flex md:flex-col">
        <div className="">More</div>
        <div className="">Profile</div>
      </div>
    </div>
  );
}

export default SidebarLeft;
