import { Post, UserInterest, ScoredPost } from "@/types/post";

/**
 * Calculate recommendation score for a post based on:
 * - User interests (personalization)
 * - Post engagement (likes, comments, shares)
 * - Random bonus (exploration factor)
 */
export function calculateScore(
  post: Post,
  interests: UserInterest[]
): number {
  // Personalization: Find matching interest score
  const interest =
    interests.find((i) => i.category === post.category)?.score ?? 0;

  // Engagement: Weight different interaction types
  const engagement =
    post.like_count * 1 + post.comment_count * 3 + post.share_count * 5;

  // Randomness: Add exploration factor (10% variance)
  const randomBonus = Math.random() * 10;

  // Final score formula
  return interest * 10 + engagement + randomBonus;
}

/**
 * Rank posts by recommendation score
 * Returns top N posts sorted by score (highest first)
 */
export function rankPosts(
  posts: Post[],
  interests: UserInterest[],
  topN: number = 20
): Post[] {
  return (
    posts
      .map((post) => ({
        post,
        score: calculateScore(post, interests),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((item) => item.post)
  );
}

/**
 * Get scored posts (useful for debugging/analytics)
 */
export function getScoredPosts(
  posts: Post[],
  interests: UserInterest[]
): ScoredPost[] {
  return posts
    .map((post) => ({
      post,
      score: calculateScore(post, interests),
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
