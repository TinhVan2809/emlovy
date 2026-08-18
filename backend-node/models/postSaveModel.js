const { execute, query, withTransaction } = require("../config/database");
const postModel = require("./postModel");

/**
 * Lấy danh sách bài viết đã lưu của một user với pagination
 * @param {number} userId - ID của user
 * @param {number} page - Số trang (mặc định 1)
 * @param {number} limit - Số bài viết trên một trang (mặc định 10)
 * @param {number} viewerId - ID của user đang xem (để check liked_by_me)
 * @returns {Promise<Array>} - Danh sách bài viết đã lưu với thông tin đầy đủ
 */
const getSavedPosts = async ({ userId, page = 1, limit = 10, viewerId = null }) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("User ID không hợp lệ");
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  // Query lấy post_id từ post_save với pagination
  const savedPostIds = await query(
    `
    SELECT ps.post_id, ps.save_at
    FROM post_save ps
    WHERE ps.user_id = :userId
    ORDER BY ps.save_at DESC
    LIMIT :offset, :limit
    `,
    { userId, offset, limit: limitNum }
  );

  if (savedPostIds.length === 0) {
    return [];
  }

  // Query lấy chi tiết các bài viết
  const postIds = savedPostIds.map(row => row.post_id);
  const placeholders = postIds.map(() => "?").join(", ");

  const rows = await query(
    `
    SELECT ${postModel.buildPostSelectFields(viewerId)}
    FROM posts p
    JOIN users u ON u.user_id = p.user_id
    WHERE p.post_id IN (${placeholders})
      AND p.is_deleted = 0
    ORDER BY FIELD(p.post_id, ${placeholders})
    `,
    [...postIds, ...postIds]
  );

  // Hydrate posts với media và thông tin tác giả
  const posts = await postModel.hydratePosts(rows);
  
  // Thêm thông tin save_at từ post_save table
  const saveAtMap = new Map(savedPostIds.map(row => [row.post_id, row.save_at]));
  posts.forEach(post => {
    post.saved_at = saveAtMap.get(post.post_id);
  });

  return posts;
};

/**
 * Lấy tổng số bài viết đã lưu của một user
 * @param {number} userId - ID của user
 * @returns {Promise<number>} - Tổng số bài viết đã lưu
 */
const countSavedPosts = async (userId) => {
  const result = await query(
    `SELECT COUNT(*) as count FROM post_save WHERE user_id = :userId`,
    { userId }
  );
  return result[0]?.count || 0;
};

/**
 * Kiểm tra user đã lưu bài viết chưa
 * @param {number} userId - ID của user
 * @param {number} postId - ID của bài viết
 * @returns {Promise<boolean>}
 */
const isPostSaved = async (userId, postId) => {
  const result = await query(
    `SELECT 1 FROM post_save WHERE user_id = :userId AND post_id = :postId LIMIT 1`,
    { userId, postId }
  );
  return result.length > 0;
};

/**
 * Lưu một bài viết
 * @param {number} userId - ID của user
 * @param {number} postId - ID của bài viết
 * @returns {Promise<object>} - Thông tin bài viết vừa lưu
 */
const savePost = async (userId, postId) => {
  try {
    const result = await execute(
      `
      INSERT INTO post_save (user_id, post_id, save_at)
      VALUES (:userId, :postId, NOW())
      ON DUPLICATE KEY UPDATE save_at = NOW()
      `,
      { userId, postId }
    );

    // Cập nhật save_count trong bảng posts
    await execute(
      `UPDATE posts SET save_count = save_count + 1 WHERE post_id = :postId AND save_count + 1 > save_count`,
      { postId }
    );

    return { post_id: postId, user_id: userId, saved_at: new Date().toISOString() };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      // Bài viết đã được lưu trước đó
      return { post_id: postId, user_id: userId, already_saved: true };
    }
    throw error;
  }
};

/**
 * Xóa lưu một bài viết
 * @param {number} userId - ID của user
 * @param {number} postId - ID của bài viết
 * @returns {Promise<boolean>} - True nếu xóa thành công
 */
const unsavePost = async (userId, postId) => {
  const result = await execute(
    `DELETE FROM post_save WHERE user_id = :userId AND post_id = :postId`,
    { userId, postId }
  );

  // Cập nhật save_count trong bảng posts
  if (result.affectedRows > 0) {
    await execute(
      `UPDATE posts SET save_count = GREATEST(0, save_count - 1) WHERE post_id = :postId`,
      { postId }
    );
  }

  return result.affectedRows > 0;
};

module.exports = {
  getSavedPosts,
  countSavedPosts,
  isPostSaved,
  savePost,
  unsavePost,
};
