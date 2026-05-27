const { execute, query } = require("../config/database");
const { buildProfileSelectFields } = require("./userModel");

const searchUsers = async (searchTerm, viewerId) => {
  const sql = `
    SELECT ${buildProfileSelectFields({ publicPostsOnly: true, viewerId })}
    FROM users u
    WHERE (u.username LIKE :searchTerm OR u.name LIKE :searchTerm OR u.email LIKE :searchTerm)
      AND u.status = 1
    ORDER BY u.created_at DESC
    LIMIT 20
  `;
  const params = { searchTerm: `%${searchTerm}%`, viewerId };
  const rows = await execute(sql, params);
  return rows;
};

module.exports = {
  searchUsers,
};