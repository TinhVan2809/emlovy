import port from "./api";

/**
 * Interface cho response từ API follow
 */
interface FollowResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Theo dõi người dùng
 * @param userId - ID của người dùng cần theo dõi
 * @returns Promise với kết quả follow
 */
export async function followUser(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch(`${port}/api/follows/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Gửi cookie để xác thực
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể theo dõi người dùng");
    }

    return {
      success: true,
      message: data.message || "Đã theo dõi người dùng",
      data: data.data,
    };
  } catch (error) {
    console.error("Error following user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
}

/**
 * Hủy theo dõi người dùng
 * @param userId - ID của người dùng cần hủy theo dõi
 * @returns Promise với kết quả unfollow
 */
export async function unfollowUser(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch(`${port}/api/follows/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Gửi cookie để xác thực
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể hủy theo dõi người dùng");
    }

    return {
      success: true,
      message: data.message || "Đã hủy theo dõi người dùng",
      data: data.data,
    };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
}

/**
 * Lấy danh sách người dùng đang theo dõi
 * @param userId - ID của người dùng
 * @returns Promise với danh sách following
 */
export async function getFollowing(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch(`${port}/api/follows/${userId}/following`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách following");
    }

    return {
      success: true,
      message: "Lấy danh sách following thành công",
      data: data.data,
    };
  } catch (error) {
    console.error("Error getting following list:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
}

/**
 * Lấy danh sách người theo dõi
 * @param userId - ID của người dùng
 * @returns Promise với danh sách followers
 */
export async function getFollowers(userId: string): Promise<FollowResponse> {
  try {
    const response = await fetch(`${port}/api/follows/${userId}/followers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách followers");
    }

    return {
      success: true,
      message: "Lấy danh sách followers thành công",
      data: data.data,
    };
  } catch (error) {
    console.error("Error getting followers list:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
}
