const { execute, query } = require("../config/database");

const buildProfileSelectFields = ({ publicPostsOnly = false, viewerId = null } = {}) => `
  u.user_id,
  u.name,
  u.username,
  u.birthday,
  u.gender,
  u.phone,
  u.avata,
  u.email,
  u.signature,
  u.role,
  u.status,
  u.created_at,
  u.is_verified,
  (
    SELECT COUNT(*)
    FROM posts p
    WHERE p.user_id = u.user_id
      AND p.is_deleted = 0
      AND p.post_type = 'post'
      ${publicPostsOnly ? "AND p.visibility = 'public'" : ""}
  ) AS post_count,
  (
    SELECT COALESCE(SUM(p.like_count), 0)
    FROM posts p
    WHERE p.user_id = u.user_id
      AND p.is_deleted = 0
  ) + (
    SELECT COALESCE(SUM(c.like_count), 0)
    FROM comments c
    WHERE c.user_id = u.user_id
      AND c.is_deleted = 0
  ) AS total_likes,
  (
    SELECT COUNT(*)
    FROM follows f
    WHERE f.following_id = u.user_id
  ) AS followers_count,
  (
    SELECT COUNT(*)
    FROM follows f
    WHERE f.follower_id = u.user_id
  ) AS following_count,
  ${
    viewerId
      ? `EXISTS(
          SELECT 1
          FROM follows f
          WHERE f.follower_id = :viewerId
            AND f.following_id = u.user_id
        )`
      : "0"
  } AS is_following
`;

const toProfile = (row) => {
  if (!row) {
    return null;
  }

  return {
    user_id: row.user_id,
    name: row.name,
    username: row.username,
    birthday: row.birthday,
    gender: row.gender,
    phone: row.phone,
    avata: row.avata,
    avatar_url: row.avata,
    email: row.email,
    signature: row.signature,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    is_verified: row.is_verified,
    is_following: Boolean(row.is_following),
    stats: {
      posts: Number(row.post_count || 0),
      followers: Number(row.followers_count || 0),
      following: Number(row.following_count || 0),
      likes: Number(row.total_likes || 0),
    },
  };
};

const findByUserId = async (userId, options = {}) => {
  const rows = await query(
    `
      SELECT ${buildProfileSelectFields(options)}
      FROM users u
      WHERE u.user_id = :userId
      LIMIT 1
    `,
    { userId, viewerId: options.viewerId || null },
  );

  return toProfile(rows[0]);
};

const findDuplicateIdentity = async ({ userId, username, email }) => {
  const rows = await query(
    `
      SELECT user_id, username, email
      FROM users
      WHERE user_id <> :userId
        AND (
          (:username IS NOT NULL AND username = :username)
          OR (:email IS NOT NULL AND email = :email)
        )
      LIMIT 1
    `,
    {
      userId,
      username: username || null,
      email: email || null,
    },
  );

  return rows[0] || null;
};

const updateByUserId = async (userId, fields) => {
  const allowedFields = ["name", "username", "birthday", "gender", "phone", "email"];
  const updates = [];
  const params = { userId };

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      updates.push(`${field} = :${field}`);
      params[field] = fields[field];
    }
  }

  if (updates.length > 0) {
    await execute(
      `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE user_id = :userId
      `,
      params,
    );
  }

  return findByUserId(userId);
};

const updateAvatar = async (userId, avatarPath) => {
  await execute(
    `
      UPDATE users
      SET avata = :avatarPath
      WHERE user_id = :userId
    `,
    {
      userId,
      avatarPath,
    },
  );

  return findByUserId(userId);
};

module.exports = {
  findByUserId,
  findDuplicateIdentity,
  toProfile,
  updateAvatar,
  updateByUserId,
};
