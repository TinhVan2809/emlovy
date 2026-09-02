"use client";
import Image from "next/image";
import {
  RiHome9Line,
  RiGroupLine,
  RiImageEditLine,
  RiChat3Line,
  RiTeamLine,
  RiNotification2Line,
  RiLineChartLine,
  RiArrowDownSLine,
  RiSettings2Line,
  RiSettings4Line,
  RiInformation2Line,
} from "@remixicon/react";
import { useState } from "react";
import Link from "next/link";
import NavLink from "../NavLink";
function Sidebar() {
  // state users
  const [isUser, setIsUser] = useState(false);

  // state posts
  const [isPost, setIsPosts] = useState(false);

  return (
    <div className="bg-[rgba(5,4,51,1)] py-5 px-2 h-full overflow-y-auto hide-scrollbar md:min-w-55 md:fixed md:top-0 md:left-0 md:z-1000">
      <div className="">
        <div className="flex items-center gap-2">
          <div className="relative z-100 w-10 h-10 bg-white rounded-full">
            <Image src="/logo.png" fill priority alt="logo" />
          </div>
          <span className="text-white">Emlovy Admin</span>
        </div>
      </div>
      <div className="mt-7">
        <Link href={"/admin/dashboard"}>
          <button className="bg-indigo-600 w-full p-2 flex items-center text-left rounded-md text-white text-sm gap-2">
            <RiHome9Line size={20} />
            Tổng quan
          </button>
        </Link>
      </div>
      <div className="flex flex-col mt-6 gap-4">
        <span className="text-[12px] text-gray-100/90 font-semibold">
          QUẢN LÝ
        </span>
        <div className="w-full flex flex-col gap-3">
          <div className="w-full" onClick={() => setIsUser((v) => !v)}>
            <button className="flex items-center gap-2 text-sm text-white justify-between p-2 w-full">
              <span className="flex items-center gap-2">
                <RiGroupLine size={20} /> Người dùng{" "}
              </span>
              <RiArrowDownSLine />
            </button>
          </div>
          {isUser && (
            <div className="px-8 pb-3">
              <ul className="text-white flex flex-col gap-5 text-sm list-disc">
                <NavLink
                  href={"/admin/user-management/list-users"}
                  color="text-indigo-400"
                >
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Danh sách người dùng
                  </li>
                </NavLink>
                <NavLink href={"#"} color="text-indigo-400">
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Vai trò và phân quyền
                  </li>
                </NavLink>
                <NavLink href={"#"} color="text-indigo-400">
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Nhóm người dùng
                  </li>
                </NavLink>
                <NavLink href={"/admin/user-management/report-user"} color="text-indigo-400">
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Báo cáo người dùng
                  </li>
                </NavLink>
              </ul>
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <button
            className="flex items-center gap-2 text-sm text-white justify-between p-2"
            onClick={() => setIsPosts((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <RiImageEditLine size={20} /> Bài viết{" "}
            </span>
            <RiArrowDownSLine />
          </button>
          {isPost && (
            <div className="px-8 pb-3">
              <ul className="text-white flex flex-col gap-5 text-sm list-disc">
                <NavLink href="/admin/posts/top-posts" color="text-indigo-400">
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Top bài viết
                  </li>
                </NavLink>
                <NavLink href={"/admin/post-management/report-post"} color="text-indigo-400">
                  <li className="cursor-pointer duration-100 hover:text-indigo-400">
                    Bài viết bị báo cáo
                  </li>
                </NavLink>
              </ul>
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiChat3Line size={20} /> Bình luận{" "}
          </span>
          <RiArrowDownSLine />
        </button>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiTeamLine size={20} /> Nhóm{" "}
          </span>
          <RiArrowDownSLine />
        </button>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiNotification2Line size={20} /> Thông báo
          </span>{" "}
          <RiArrowDownSLine />
        </button>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiLineChartLine size={20} /> Báo cáo{" "}
          </span>
          <RiArrowDownSLine />
        </button>
      </div>
      <div className="flex flex-col mt-6 gap-4">
        <span className="text-[12px] text-gray-100/90 font-semibold">
          CÀI ĐẶT
        </span>
        <button className="flex items-center gap-2 text-sm p-2 text-white">
          <RiSettings2Line size={20} /> Cài đặt hệ thống
        </button>
        <button className="flex items-center gap-2 text-sm p-2 text-white">
          <RiSettings4Line size={20} /> Vai trò phân quyền
        </button>
        <button className="flex items-center gap-2 text-sm p-2 text-white">
          <RiInformation2Line size={20} /> Nhật ký hệ thống
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
