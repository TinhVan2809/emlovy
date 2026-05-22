const { execute } = require("../config/database");

const follow = async ({ followerId, followingId }) =>
  execute(
    `
      INSERT IGNORE INTO follows (follower_id, following_id)
      VALUES (:followerId, :followingId)
    `,
    { followerId, followingId },
  );

const unfollow = async ({ followerId, followingId }) =>
  execute(
    `
      DELETE FROM follows
      WHERE follower_id = :followerId
        AND following_id = :followingId
    `,
    { followerId, followingId },
  );

module.exports = {
  follow,
  unfollow,
};
