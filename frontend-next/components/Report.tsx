"use client";

import { useUser } from "@/context/useUserContext";
import { useState } from "react";

interface ReportProp {
  post_id: number | null;
  onCloseReport: () => void;
}

const REPORT_REASONS = [
  "Nội dung sai sự thật",
  "Nội dung mang yếu tố người lớn",
  "Ngôn ngữ gây thù địch",
  "Nội dung mang tinh thù địch, bạo lực",
  "Bán hoặc quảng cáo mặt hàng bị cấm hoặc hạn chế",
  "Tôi không muốn xem nội dung này",
];

export default function Report({ post_id, onCloseReport }: ReportProp) {
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (reason: string) => {
    if (!user?.user_id || post_id == null || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_type: "post",
          reported_post_id: post_id,
          user_id: user.user_id,
          reason,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      const data = await response.json();
      if (data.success) {
        console.log("Report submitted successfully:", data);
        onCloseReport();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-dvh fixed inset-0 z-10000 bg-black/10 flex justify-center items-center p-0 sm:p-4">
      <div className="bg-white rounded-2xl">
        <p className="flex items-center justify-center relative p-5 border-b">
          <span className="font-semibold">Bạn muốn báo cáo bài viết này?</span>
          <span
            onClick={onCloseReport}
            className="cursor-pointer text-3xl flex absolute right-0 px-4"
          >
            &times;
          </span>
        </p>

        <ul>
          {REPORT_REASONS.map((reason) => (
            <li key={reason}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(reason)}
                className="w-full text-left cursor-pointer disabled:opacity-50"
              >
                {reason}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}