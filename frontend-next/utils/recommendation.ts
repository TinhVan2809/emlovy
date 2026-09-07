import { Post, UserInterest, ScoredPost } from "@/types/post";

type RecommendationOptions = {
  now?: number;
  freshnessWindowMs?: number;
  recencyWeight?: number;
  explorationWeight?: number;
};

const DEFAULT_FRESHNESS_WINDOW_MS = 1000 * 60 * 60 * 24;
const DEFAULT_RECENCY_WEIGHT = 120;

const getRecencyBonus = (
  post: Post,
  {
    now = Date.now(),
    freshnessWindowMs = DEFAULT_FRESHNESS_WINDOW_MS,
    recencyWeight = DEFAULT_RECENCY_WEIGHT,
  }: RecommendationOptions = {}
) => {
  const createdAt = new Date(post.created_at).getTime();

  if (!Number.isFinite(createdAt) || freshnessWindowMs <= 0) {
    return 0;
  }

  const ageMs = Math.max(0, now - createdAt);
  const freshness = Math.max(0, 1 - ageMs / freshnessWindowMs);

  return freshness * recencyWeight;
};

/**
 * Calculate recommendation score for a post based on:
 * - User interests (personalization)
 * - Post engagement (likes, comments, shares)
 * - Recency, so freshly published posts are visible on reload
 * - A small deterministic exploration factor
 */
export function calculateScore(
  post: Post,
  interests: UserInterest[],
  { explorationWeight = 10, ...options }: RecommendationOptions = {}
): number {
  // Personalization: Find matching interest score
  const interest =
    interests.find((i) => i.category === post.category)?.score ?? 0;

  // Engagement: Weight different interaction types
  const engagement =
    post.like_count * 1 + post.comment_count * 3 + post.share_count * 5;

  // Keep ranking stable while the same cached posts are mounted again.
  const explorationBonus =
    (((post.post_id * 9301 + 49297) % 233280) / 233280) *
    explorationWeight;

  // Final score formula
  return interest * 10 + engagement + getRecencyBonus(post, options) + explorationBonus;
}

/**
 * Rank posts by recommendation score
 * Returns top N posts sorted by score (highest first)
 */
export function rankPosts(
  posts: Post[],
  interests: UserInterest[],
  topN: number = 20,
  options: RecommendationOptions = {}
): Post[] {
  return (
    posts
      .map((post) => ({
        post,
        score: calculateScore(post, interests, options),
      }))
      .sort((a, b) => {
        if (a.post.is_pinned !== b.post.is_pinned) {
          return a.post.is_pinned ? -1 : 1;
        }

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return (
          new Date(b.post.created_at).getTime() -
          new Date(a.post.created_at).getTime()
        );
      })
      .slice(0, topN)
      .map((item) => item.post)
  );
}

/**
 * Get scored posts (useful for debugging/analytics)
 */
export function getScoredPosts(
  posts: Post[],
  interests: UserInterest[],
  options: RecommendationOptions = {}
): ScoredPost[] {
  return posts
    .map((post) => ({
      post,
      score: calculateScore(post, interests, options),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Default user interests (fallback when no user data available)
 */
export const DEFAULT_INTERESTS: UserInterest[] = [
  { category: "technology", score: 5 },
  { category: "lifestyle", score: 3 },
  { category: "entertainment", score: 4 },
  { category: "sports", score: 2 },
  { category: "news", score: 3 },
];
