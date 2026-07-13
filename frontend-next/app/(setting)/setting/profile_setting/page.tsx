'use client';
import { FaRegUser } from "react-icons/fa";
import { RiShieldLine, RiBubbleChartLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
export default function AppSetting() {
  const router = useRouter();
  return (
    <section className="relative h-screen flex justify-center md:px-40 md:py-10">
      <p className="absolute top-10 right-10 text-4xl cursor-pointer px-3 rounded-full hover:bg-[#f2f2f2]" onClick={() => router.back()}>&times;</p>
      <div className="grid grid-cols-8">
        <div className="col-span-3 flex flex-col gap-5 px-10">
          <div className="flex flex-col gap-3">
            <p className="flex flex-col gap-2">
              <span className="font-bold text-2xl">Trung tâm tài khoản</span>
              <span className="text-sm">
                Quản lý tài khoản cá nhân, mật khẩu và các công nghệ của emlovy.
              </span>
            </p>
            <div className="flex items-center gap-2 bg-[#434648] text-white font-bold px-3 py-2.5 rounded-xl cursor-pointer">
              <FaRegUser />
              <span>Thông tin cá nhân của tôi</span>
            </div>
          </div>
          <div className="flex flex-col gap-7">
            <p className="font-bold">Cài đặt tài khoản</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-[#f2f2f2]">
                <RiShieldLine />
                <span>Mật khẩu và bảo mật</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-[#f2f2f2]">
                <RiBubbleChartLine />
                <span>Trải nghiệm kết nối</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-5">
          <div className="">
            <p>
              <span>Trang thông tin cá nhân</span>
              <span>
                Xem lại trang cá nhân và thông tin cá nhân bạn đã thêm vào Trung
                tâm tài khoản này. Thêm tài khoản để thêm trang cá nhân khác.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
