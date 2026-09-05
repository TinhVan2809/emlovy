// Demo page for recommendation system
import Story from "@/components/story/Story";
import RecommendedPostFeed from "@/components/RecommendedPostFeed";
import InterestManager from "@/components/InterestManager";

export default function RecommendedPage() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-2">
            🎯 Trang chủ với gợi ý thông minh
          </h1>
          <p className="text-sm opacity-90">
            Nội dung được sắp xếp dựa trên sở thích và tương tác của bạn
          </p>
        </div>

        <InterestManager />

        <Story />

        <RecommendedPostFeed />
      </div>
    </>
  );
}
