import { calculateScore, rankPosts } from "./recommendation";
import { Post, UserInterest } from "@/types/post";

describe("Recommendation System", () => {
  const mockInterests: UserInterest[] = [
    { category: "technology", score: 8 },
    { category: "sports", score: 3 },
    { category: "lifestyle", score: 5 },
  ];

  const createMockPost = (overrides?: Partial<Post>): Post => ({
    post_id: 1,
    content: "Test post",
    created_at: new Date().toISOString(),
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    category: "technology",
    ...overrides,
  });

  describe("calculateScore", () => {
    it("should prioritize posts matching high interest categories", () => {
      const techPost = createMockPost({ category: "technology" });
      const sportsPost = createMockPost({ category: "sports" });

      // Mock Math.random for consistent testing
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      const techScore = calculateScore(techPost, mockInterests);
      const sportsScore = calculateScore(sportsPost, mockInterests);

      // Tech interest (8) is higher than sports (3)
      // Tech: 8*10 + 0 + 5 = 85
      // Sports: 3*10 + 0 + 5 = 35
      expect(techScore).toBeGreaterThan(sportsScore);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should reward high engagement", () => {
      const highEngagement = createMockPost({
        like_count: 100,
        comment_count: 50,
        share_count: 20,
      });
      const lowEngagement = createMockPost({
        like_count: 1,
        comment_count: 0,
        share_count: 0,
      });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const highScore = calculateScore(highEngagement, mockInterests);
      const lowScore = calculateScore(lowEngagement, mockInterests);

      // High: 8*10 + (100*1 + 50*3 + 20*5) + 0 = 80 + 350 = 430
      // Low: 8*10 + (1*1 + 0*3 + 0*5) + 0 = 80 + 1 = 81
      expect(highScore).toBeGreaterThan(lowScore);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should give higher weight to comments than likes", () => {
      const manyLikes = createMockPost({
        like_count: 10,
        comment_count: 0,
        share_count: 0,
      });
      const fewComments = createMockPost({
        like_count: 0,
        comment_count: 4,
        share_count: 0,
      });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const likesScore = calculateScore(manyLikes, mockInterests);
      const commentsScore = calculateScore(fewComments, mockInterests);

      // Likes: 80 + 10*1 = 90
      // Comments: 80 + 4*3 = 92
      expect(commentsScore).toBeGreaterThan(likesScore);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should give highest weight to shares", () => {
      const shares = createMockPost({
        like_count: 0,
        comment_count: 0,
        share_count: 3,
      });
      const likes = createMockPost({
        like_count: 15,
        comment_count: 0,
        share_count: 0,
      });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const sharesScore = calculateScore(shares, mockInterests);
      const likesScore = calculateScore(likes, mockInterests);

      // Shares: 80 + 3*5 = 95
      // Likes: 80 + 15*1 = 95
      expect(sharesScore).toBeGreaterThanOrEqual(likesScore);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should use default interest score of 0 for unknown categories", () => {
      const unknownCategory = createMockPost({ category: "unknown" });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const score = calculateScore(unknownCategory, mockInterests);

      // Should be: 0*10 + 0 + 0 = 0
      expect(score).toBe(0);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should handle posts without category", () => {
      const noCategory = createMockPost({ category: undefined });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const score = calculateScore(noCategory, mockInterests);

      expect(score).toBeGreaterThanOrEqual(0);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should add random bonus between 0-10", () => {
      const post = createMockPost();

      // Test multiple times to verify randomness
      const scores = Array.from({ length: 100 }, () =>
        calculateScore(post, mockInterests)
      );

      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      // Base score is 80 (8*10 + 0 engagement)
      // With random bonus 0-10, range should be 80-90
      expect(minScore).toBeGreaterThanOrEqual(80);
      expect(maxScore).toBeLessThanOrEqual(90);
      expect(maxScore - minScore).toBeLessThanOrEqual(10);
    });
  });

  describe("rankPosts", () => {
    it("should sort posts by score in descending order", () => {
      const posts: Post[] = [
        createMockPost({
          post_id: 1,
          category: "sports",
          like_count: 10,
        }),
        createMockPost({
          post_id: 2,
          category: "technology",
          like_count: 5,
        }),
        createMockPost({
          post_id: 3,
          category: "lifestyle",
          like_count: 8,
        }),
      ];

      jest.spyOn(Math, "random").mockReturnValue(0);

      const ranked = rankPosts(posts, mockInterests, 10);

      // Expected order by score:
      // Tech: 8*10 + 5 = 85
      // Lifestyle: 5*10 + 8 = 58
      // Sports: 3*10 + 10 = 40
      expect(ranked[0].post_id).toBe(2); // Tech
      expect(ranked[1].post_id).toBe(3); // Lifestyle
      expect(ranked[2].post_id).toBe(1); // Sports

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should limit results to topN", () => {
      const posts: Post[] = Array.from({ length: 50 }, (_, i) =>
        createMockPost({ post_id: i + 1 })
      );

      const ranked = rankPosts(posts, mockInterests, 20);

      expect(ranked).toHaveLength(20);
    });

    it("should return all posts if fewer than topN", () => {
      const posts: Post[] = [
        createMockPost({ post_id: 1 }),
        createMockPost({ post_id: 2 }),
        createMockPost({ post_id: 3 }),
      ];

      const ranked = rankPosts(posts, mockInterests, 20);

      expect(ranked).toHaveLength(3);
    });

    it("should handle empty posts array", () => {
      const ranked = rankPosts([], mockInterests, 20);

      expect(ranked).toEqual([]);
    });

    it("should handle empty interests array", () => {
      const posts: Post[] = [createMockPost({ post_id: 1 })];

      const ranked = rankPosts(posts, [], 20);

      expect(ranked).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative engagement counts", () => {
      const post = createMockPost({
        like_count: -5,
        comment_count: -2,
        share_count: -1,
      });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const score = calculateScore(post, mockInterests);

      // Should still calculate: 80 + (-5 + -6 + -5) = 64
      expect(score).toBe(64);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should handle very large engagement numbers", () => {
      const post = createMockPost({
        like_count: 1000000,
        comment_count: 500000,
        share_count: 100000,
      });

      const score = calculateScore(post, mockInterests);

      expect(score).toBeGreaterThan(1000000);
      expect(Number.isFinite(score)).toBe(true);
    });

    it("should handle interest score at boundaries", () => {
      const maxInterest: UserInterest[] = [{ category: "tech", score: 10 }];
      const minInterest: UserInterest[] = [{ category: "tech", score: 0 }];

      const post = createMockPost({ category: "tech" });

      jest.spyOn(Math, "random").mockReturnValue(0);

      const maxScore = calculateScore(post, maxInterest);
      const minScore = calculateScore(post, minInterest);

      expect(maxScore).toBe(100); // 10*10 + 0 + 0
      expect(minScore).toBe(0); // 0*10 + 0 + 0

      jest.spyOn(Math, "random").mockRestore();
    });
  });
});
