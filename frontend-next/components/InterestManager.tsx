"use client";

import { useState } from "react";
import { useRecommendation } from "@/context/RecommendationContext";

const CATEGORIES = [
  { id: "technology", label: "Công nghệ" },
  { id: "lifestyle", label: "Phong cách sống" },
  { id: "entertainment", label: "Giải trí" },
  { id: "sports", label: "Thể thao" },
  { id: "news", label: "Tin tức" },
  { id: "food", label: "Ẩm thực" },
  { id: "travel", label: "Du lịch" },
  { id: "fashion", label: "Thời trang" },
  { id: "health", label: "Sức khỏe" },
  { id: "education", label: "Giáo dục" },
];

export default function InterestManager() {
  const { interests, updateInterest, resetInterests } = useRecommendation();
  const [isOpen, setIsOpen] = useState(false);

  const getInterestScore = (category: string) => {
    return interests.find((i) => i.category === category)?.score ?? 0;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        {isOpen ? "Ẩn" : "Quản lý"} sở thích của bạn
      </button>

      {isOpen && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Sở thích cá nhân
            </h2>
            <button
              onClick={resetInterests}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Đặt lại mặc định
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Điều chỉnh mức độ quan tâm của bạn với từng chủ đề (0-10). Điều này
            giúp chúng tôi gợi ý nội dung phù hợp hơn với bạn.
          </p>

          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const score = getInterestScore(category.id);
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium text-gray-700"
                    >
                      {category.label}
                    </label>
                    <span className="text-sm font-bold text-blue-600">
                      {score}
                    </span>
                  </div>
                  <input
                    id={category.id}
                    type="range"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) =>
                      updateInterest(category.id, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Không quan tâm</span>
                    <span>Rất quan tâm</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              💡 Cách hoạt động
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • Điểm quan tâm cao hơn → Nội dung liên quan xuất hiện nhiều
                hơn
              </li>
              <li>• Tương tác (like, comment, share) cũng ảnh hưởng xếp hạng</li>
              <li>• Có một chút ngẫu nhiên để bạn khám phá nội dung mới</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
