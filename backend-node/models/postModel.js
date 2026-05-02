const { execute, query, withTransaction } = require("../config/database");
const userModel = require("./userModel");

const toPublicPost = (post) => {
  if (!post) return null;

  return {
    post_id: post.post_id,
    user_id: post.user_id,
    content: post.content,
    like_count: post.like_count,
    comment_count: post.comment_count,
    share_count: post.share_count,
    view_count: post.view_count,
    save_count: post.save_count,
    visibility: post.visibility,
    location: post.location,
    latitude: post.latitude,
    longitude: post.longitude,
    is_deleted: post.is_deleted,
    is_edited: post.is_edited,
    is_pinned: post.is_pinned,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
};

const findById = async (postId) => {
  const rows = await query(
    `
      SELECT p.*, u.user_id as author_user_id, u.name as author_name, u.username as author_username, u.avata as author_avata
      FROM posts p
      JOIN users u ON u.user_id = p.user_id
      WHERE p.post_id = :postId
      LIMIT 1
    `,
    { postId },
  );

  const postRow = rows[0];

  if (!postRow) return null;

  const media = await query(
    `SELECT post_media_id, media_url, type, sort_order, width, height, duration FROM post_media WHERE post_id = :postId ORDER BY sort_order ASC`,
    { postId },
  );

  const author = userModel.toPublicUser({
    user_id: postRow.author_user_id,
    name: postRow.author_name,
    username: postRow.author_username,
    avata: postRow.author_avata,
    birthday: postRow.birthday,
    gender: postRow.gender,
    phone: postRow.phone,
    email: postRow.email,
    role: postRow.role,
    status: postRow.status,
    created_at: postRow.created_at,
  });

  const post = toPublicPost(postRow);
  post.author = author;
  post.media = media || [];

  return post;
};

const createWithMedia = async ({ user_id, content = null, visibility = "public", location = null, latitude = null, longitude = null, media = [] }) => {
  return withTransaction(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO posts (user_id, content, visibility, location, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, content, visibility, location, latitude, longitude],
    );

    const postId = result.insertId;

    for (let i = 0; i < (media || []).length; i++) {
      const m = media[i];
      await connection.execute(
        `INSERT INTO post_media (post_id, media_url, type, sort_order, width, height, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [postId, m.media_url, m.type || "image", m.sort_order ?? i, m.width ?? null, m.height ?? null, m.duration ?? null],
      );
    }

    return findById(postId);
  });
};

const getFeed = async ({ page = 1, limit = 10 }) => {
  const offset = (Math.max(1, page) - 1) * limit;

  const rows = await query(
    `
      SELECT p.*, u.user_id as author_user_id, u.name as author_name, u.username as author_username, u.avata as author_avata
      FROM posts p
      JOIN users u ON u.user_id = p.user_id
      WHERE p.is_deleted = 0
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT :limit OFFSET :offset
    `,
    { limit, offset },
  );

  const posts = [];

  for (const row of rows) {
    const media = await query(
      `SELECT post_media_id, media_url, type, sort_order, width, height, duration FROM post_media WHERE post_id = :postId ORDER BY sort_order ASC`,
      { postId: row.post_id },
    );

    const author = userModel.toPublicUser({
      user_id: row.author_user_id,
      name: row.author_name,
      username: row.author_username,
      avata: row.author_avata,
      birthday: row.birthday,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      role: row.role,
      status: row.status,
      created_at: row.created_at,
    });

    const post = toPublicPost(row);
    post.author = author;
    post.media = media || [];

    posts.push(post);
  }

  return posts;
};

const softDelete = async (postId) => {
  await execute(`UPDATE posts SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE post_id = :postId`, { postId });

  return true;
};

module.exports = {
  findById,
  createWithMedia,
  getFeed,
  softDelete,
};
