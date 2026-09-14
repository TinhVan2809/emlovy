"use client";

import { useState, useCallback } from "react";
import { followUser, unfollowUser } from "@/api/followApi";

/**
 * Custom hook để quản lý trạng thái follow/unfollow
 */
export function useFollow(initialFollowStatus: boolean = false) {
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Thực hiện follow/unfollow người dùng
   */
  const toggleFollow = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        let result;
        if (isFollowing) {
          result = await unfollowUser(userId);
        } else {
          result = await followUser(userId);
        }

        if (result.success) {
          setIsFollowing(!isFollowing);
          return true;
        } else {
          setError(result.message);
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Có lỗi xảy ra";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isFollowing]
  );

  /**
   * Theo dõi người dùng
   */
  const follow = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await followUser(userId);

      if (result.success) {
        setIsFollowing(true);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Hủy theo dõi người dùng
   */
  const unfollow = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await unfollowUser(userId);

      if (result.success) {
        setIsFollowing(false);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isFollowing,
    isLoading,
    error,
    toggleFollow,
    follow,
    unfollow,
    setIsFollowing, // Cho phép cập nhật trạng thái từ bên ngoài nếu cần
  };
}
