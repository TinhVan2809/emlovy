"use client";
import { useState } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
type Period = "7days" | "30days" | "1year";
function Dashboard() {
  const [period, setPeriod] = useState<Period>("7days");
  return (
    <>
   
      <div className="w-full h-full bg-[#F9F8FA]">
        <div className="grid grid-cols-3 gap-4">
          <DashboardCard
            endpoint="api/admin/stats/users"
            period={period}
            title="Người dùng"
            icon="ri-group-fill"
          />
          <DashboardCard
            endpoint="api/admin/stats/posts"
            period={period}
            title="Bài viết"
            icon="ri-discuss-fill"
          />
          <DashboardCard
            endpoint="api/admin/stats/comments"
            period={period}
            title="Bình luận"
            icon="ri-chat-3-fil"
          />
          <DashboardCard
            endpoint="api/admin/stats/likes"
            period={period}
            title="Lượt thích"
            icon="ri-poker-hearts-fill"
          />
          <DashboardCard
            endpoint="api/admin/stats/reels"
            period={period}
            title="Thước phim"
            icon="ri-poker-hearts-fill"
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
