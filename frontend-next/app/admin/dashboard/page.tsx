"use client";
import { useState } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { useUser } from "@/context/useUserContext";
import { RiCalendarLine } from "@remixicon/react";
type Period = "7days" | "30days" | "12months";
function Dashboard() {
  const [period, setPeriod] = useState<Period>("7days");
  const { user } = useUser();
  return (
    <>
      {/* Tiêu đề và các dashboard card */}
      <div className="bg-[#F9F8FA] flex flex-col gap-3 p-6 h-full">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center flex-col md:flex-row">
            <div className="flex flex-col gap-2">
              <h4 className="text-2xl font-bold">Tổng quan</h4>
              <span className="text-sm opacity-65">
                Xin chào {user?.name}! Đây là trang tổng quan hoạt động nền
                tảng.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="bg-white py-1 px-2 rounded-md cursor-pointer"
              >
                <option value="7days">7 ngày</option>
                <option value="30days">30 ngày</option>
                <option value="12months">12 tháng</option>
              </select>
              {/* Hiển thị ngày hôm nay */}
              <div className="bg-white py-1 px-2 rounded-md flex items-center gap-2 cursor-pointer">
                <span>
                  {new Date().toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <RiCalendarLine size={22} className="opacity-70" />
              </div>
            </div>
          </div>
          <div className="w-full h-full ">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DashboardCard
                endpoint="api/admin/stats/users"
                period={period}
                title="Người dùng"
                icon="ri-group-fill"
                backgroundColor="rgba(27, 24, 241, 0.26)"
                color="rgba(41, 25, 230, 0.94)"
              />
              <DashboardCard
                endpoint="api/admin/stats/posts"
                period={period}
                title="Bài viết"
                icon="ri-discuss-fill"
                backgroundColor="rgba(7, 254, 26, 0.26)"
                color="rgba(16, 130, 44, 0.94)"
              />
              <DashboardCard
                endpoint="api/admin/stats/comments"
                period={period}
                title="Bình luận"
                icon="ri-chat-3-fill"
                backgroundColor="rgba(228, 94, 35, 0.26)"
                color="rgba(236, 97, 17, 0.94)"
              />
              <DashboardCard
                endpoint="api/admin/stats/likes"
                period={period}
                title="Lượt thích"
                icon="ri-poker-hearts-fill"
                backgroundColor="rgba(241, 24, 80, 0.26)"
                color="rgba(218, 28, 124, 0.94)"
              />
              <DashboardCard
                endpoint="api/admin/stats/reels"
                period={period}
                title="Thước phim"
                icon="ri-video-on-fill"
                backgroundColor="rgba(96, 24, 184, 0.22)"
                color="rgba(152, 35, 255, 1)"
              />
              <DashboardCard
                endpoint="api/admin/stats/verified-users"
                period={period}
                title="Verified"
                icon="ri-verified-badge-fill"
                backgroundColor="rgba(0, 61, 255, 0.25)"
                color="#155dfc"
              />
            </div>
          </div>
        </div>
        {/* Tổng quan hoạt động (Người dùng, bài viết, bình luận, lượt thích, thước phim)*/}
        <div className="">
          tong quan hoat dong
        </div>
      </div>
    </>
  );
}

export default Dashboard;
