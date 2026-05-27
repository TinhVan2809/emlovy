const { execute } = require("../config/database");
const { buildProfileSelectFields } = require("./userModel");

// follow
const follow = async ({ followerId, followingId }) =>
  execute(
    `
      INSERT IGNORE INTO follows (follower_id, following_id)
      VALUES (:followerId, :followingId)
    `,
    { followerId, followingId },
  );

// unfollow
const unfollow = async ({ followerId, followingId }) =>
  execute(
    `
      DELETE FROM follows
      WHERE follower_id = :followerId
        AND following_id = :followingId
    `,
    { followerId, followingId },
  );

// Lấy danh sách người đang theo dõi
const getFollowing = async (userId, viewerId) => {
  const [rows] = await execute(
    `
      SELECT ${buildProfileSelectFields({ viewerId })}
      FROM (SELECT follower_id, following_id FROM follows) f
      JOIN users u ON f.following_id = u.user_id
      WHERE f.follower_id = :userId
    `,
    { userId, viewerId }
  );
  return rows;
};

// Lấy danh sách người đã theo dõi
const getFollowers = async (userId, viewerId) => {
  const [rows] = await execute(
    `
      SELECT ${buildProfileSelectFields({ viewerId })}
      FROM (SELECT follower_id, following_id FROM follows) f
      JOIN users u ON f.follower_id = u.user_id
      WHERE f.following_id = :userId
    `,
    { userId, viewerId }
  );
  return rows;
};

module.exports = {
  follow,
  unfollow,
  getFollowing,
  getFollowers,
};
