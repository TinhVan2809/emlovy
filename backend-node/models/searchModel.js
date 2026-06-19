const { execute, query } = require("../config/database");
const { hydratePosts } = require("../models/postModel");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");

// Tìm kiếm users
const searchUsers = async (searchTerm, viewerId) => {
  const sql = `
    SELECT ${userModel.buildProfileSelectFields({ publicPostsOnly: true, viewerId })}
    FROM users u
    WHERE (u.user_id LIKE :searchTerm OR u.username LIKE :searchTerm OR u.name LIKE :searchTerm OR u.email LIKE :searchTerm)
      AND u.status = 1
    ORDER BY u.created_at DESC
    LIMIT 20
  `;
  const params = { searchTerm: `%${searchTerm}%`, viewerId };
  const rows = await execute(sql, params);
  return rows;
};

// Tìm kiếm posts
const searchPosts = async (searchTerm, viewerId) => {
  const sql = `
    SELECT ${postModel.buildPostSelectFields(viewerId)}
    FROM posts p
    JOIN users u ON u.user_id = p.user_id
    WHERE MATCH(p.content) AGAINST(:searchTerm IN BOOLEAN MODE)
      AND p.is_deleted = 0
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  const params = { searchTerm: `${searchTerm}*`, viewerId };
  const rows = await execute(sql, params);
  return hydratePosts(rows);
};

// Tìm kiếm người đang theo dõi/theo dõi
const searchFollows = async (userId, searchTerm, viewerId) => {
  const sql = `
    SELECT ${buildProfileSelectFields({ publicPostsOnly: true, viewerId })}
    FROM (SELECT follower_id, following_id FROM follows) f
    JOIN users u ON f.following_id = u.user_id
    WHERE f.follower_id = :userId
      AND (u.username LIKE :searchTerm OR u.name LIKE :searchTerm OR u.email LIKE :searchTerm)
      AND u.status = 1
    ORDER BY u.created_at DESC
    LIMIT 20
  `;
  const params = { userId, searchTerm: `%${searchTerm}%`, viewerId };
  const rows = await execute(sql, params);
  return rows;
}

module.exports = {
  searchUsers,
  searchPosts,
  searchFollows
};