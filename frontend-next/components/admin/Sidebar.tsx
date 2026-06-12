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
function Sidebar() {
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
        <button className="bg-indigo-600 w-full p-2 flex items-center text-left rounded-md text-white text-sm gap-2">
          <RiHome9Line size={20} />
          Tổng quan
        </button>
      </div>
      <div className="flex flex-col mt-6 gap-4">
        <span className="text-[12px] text-gray-100/90 font-semibold">
          QUẢN LÝ
        </span>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiGroupLine size={20} /> Người dùng{" "}
          </span>
          <RiArrowDownSLine />
        </button>
        <button className="flex items-center gap-2 text-sm text-white justify-between p-2">
          <span className="flex items-center gap-2">
            <RiImageEditLine size={20} /> Bài viết{" "}
          </span>
          <RiArrowDownSLine />
        </button>
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
        <span className="text-[12px] text-gray-100/90 font-semibold">CÀI ĐẶT</span>
        <button className="flex items-center gap-2 text-sm p-2">
          <RiSettings2Line size={20}/> Cài đặt hệ thống
        </button>
        <button className="flex items-center gap-2 text-sm p-2">
          <RiSettings4Line size={20}/> Vai trò phân quyền
        </button>
        <button className="flex items-center gap-2 text-sm p-2">
          <RiInformation2Line size={20}/> Nhật ký hệ thống
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
