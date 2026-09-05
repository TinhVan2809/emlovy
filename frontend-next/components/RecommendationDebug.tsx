"use client";

import { useState } from "react";
import { Post, ScoredPost } from "@/types/post";
import { getScoredPosts } from "@/utils/recommendation";
import { useRecommendation } from "@/context/RecommendationContext";

type Props = {
  posts: Post[];
};

export default function RecommendationDebug({ posts }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { interests } = useRecommendation();

  const scoredPosts: ScoredPost[] = getScoredPosts(posts, interests);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors text-sm"
      >
        🔍 Debug Scores
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="bg-purple-500 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold">Recommendation Scores</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-3">
        <div className="bg-purple-50 rounded p-3 text-xs">
          <p className="font-semibold text-purple-800 mb-2">
            Score Formula:
          </p>
          <code className="text-purple-700">
            interest × 10 + (likes × 1 + comments × 3 + shares × 5) + random(0-10)
          </code>
        </div>

        {scoredPosts.slice(0, 10).map((item, index) => (
          <div
            key={item.post.post_id}
            className="border border-gray-200 rounded p-3 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    Post #{item.post.post_id}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {item.post.content}
                </p>
              </div>
              <div className="text-right ml-2">
                <div className="text-xl font-bold text-purple-600">
                  {item.score.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 rounded p-2">
                <div className="text-gray-600">Category</div>
                <div className="font-semibold text-blue-700">
                  {item.post.category || "none"}
                </div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-gray-600">Interest</div>
                <div className="font-semibold text-green-700">
                  {interests.find((i) => i.category === item.post.category)
                    ?.score ?? 0}
                </div>
              </div>
              <div className="bg-yellow-50 rounded p-2">
                <div className="text-gray-600">Likes</div>
                <div className="font-semibold text-yellow-700">
                  {item.post.like_count}
                </div>
              </div>
              <div className="bg-orange-50 rounded p-2">
                <div className="text-gray-600">Comments</div>
                <div className="font-semibold text-orange-700">
                  {item.post.comment_count}
                </div>
              </div>
              <div className="bg-red-50 rounded p-2">
                <div className="text-gray-600">Shares</div>
                <div className="font-semibold text-red-700">
                  {item.post.share_count}
                </div>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <div className="text-gray-600">Engagement</div>
                <div className="font-semibold text-purple-700">
                  {item.post.like_count * 1 +
                    item.post.comment_count * 3 +
                    item.post.share_count * 5}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
