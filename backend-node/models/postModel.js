const { execute, query, withTransaction } = require("../config/database");
const userModel = require("./userModel");

const toPublicPost = (post) => {
  if (!post) return null;

  return {
    post_id: post.post_id,
    user_id: post.user_id,
    post_type: post.post_type || "post",
    content: post.content,
    like_count: Number(post.like_count || 0),
    comment_count: Number(post.comment_count || 0),
    share_count: Number(post.share_count || 0),
    view_count: Number(post.view_count || 0),
    save_count: Number(post.save_count || 0),
    visibility: post.visibility,
    location: post.location,
    latitude: post.latitude,
    longitude: post.longitude,
    is_deleted: Boolean(post.is_deleted),
    is_edited: Boolean(post.is_edited),
    is_pinned: Boolean(post.is_pinned),
    liked_by_me: Boolean(post.liked_by_me),
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
};

const buildPostSelectFields = (viewerId = null) => `
  p.*,
  u.user_id AS author_user_id,
  u.name AS author_name,
  u.username AS author_username,
  u.birthday AS author_birthday,
  u.gender AS author_gender,
  u.phone AS author_phone,
  u.avata AS author_avata,
  u.email AS author_email,
  u.role AS author_role,
  u.status AS author_status,
  u.created_at AS author_created_at,
  u.is_verified AS author_verified,
  ${
    viewerId
      ? `EXISTS(
          SELECT 1
          FROM likes l
          WHERE l.user_id = :viewerId
            AND l.post_id = p.post_id
            AND l.comment_id IS NULL
        )`
      : "0"
  } AS liked_by_me
`;

const toPostWithAuthor = (row) => {
  const author = userModel.toPublicUser({
    user_id: row.author_user_id,
    name: row.author_name,
    username: row.author_username,
    birthday: row.author_birthday,
    gender: row.author_gender,
    phone: row.author_phone,
    avata: row.author_avata,
    email: row.author_email,
    role: row.author_role,
    status: row.author_status,
    created_at: row.author_created_at,
    is_verified: row.author_verified
  });

  const post = toPublicPost(row);
  post.author = author;
  post.media = [];
  return post;
};

const attachMedia = async (posts) => {
  if (!posts.length) {
    return posts;
  }

  const postIds = posts.map((post) => post.post_id);
  const placeholders = postIds.map(() => "?").join(", ");
  const mediaRows = await query(
    `
      SELECT post_media_id, post_id, media_url, type, sort_order, width, height, duration
      FROM post_media
      WHERE post_id IN (${placeholders})
      ORDER BY post_id ASC, sort_order ASC
    `,
    postIds,
  );

  const mediaByPostId = new Map();

  for (const media of mediaRows) {
    const current = mediaByPostId.get(media.post_id) || [];
    current.push(media);
    mediaByPostId.set(media.post_id, current);
  }

  return posts.map((post) => ({
    ...post,
    media: mediaByPostId.get(post.post_id) || [],
  }));
};

const hydratePosts = async (rows) => attachMedia(rows.map(toPostWithAuthor));

const findById = async (postId, viewerId = null) => {
  const rows = await query(
    `
      SELECT ${buildPostSelectFields(viewerId)}
      FROM posts p
      JOIN users u ON u.user_id = p.user_id
      WHERE p.post_id = :postId AND p.is_deleted = 0
      LIMIT 1
    `,
    { postId, viewerId },
  );

  const posts = await hydratePosts(rows);
  return posts[0] || null;
};

const insertMedia = async (connection, postId, media = []) => {
  for (let i = 0; i < (media || []).length; i++) {
    const m = media[i];
    await connection.execute(
      `INSERT INTO post_media (post_id, media_url, type, sort_order, width, height, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [postId, m.media_url, m.type || "image", m.sort_order ?? i, m.width ?? null, m.height ?? null, m.duration ?? null],
    );
  }
};

const createWithMedia = async ({
  user_id,
  post_type = "post",
  content = null,
  visibility = "public",
  location = null,
  latitude = null,
  longitude = null,
  media = [],
}) => {
  const postId = await withTransaction(async (connection) => {

    const [result] = await connection.execute(
      `
        INSERT INTO posts (user_id, post_type, content, visibility, location, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [user_id, post_type, content, visibility, location, latitude, longitude],
    );

    await insertMedia(connection, result.insertId, media);

    return result.insertId;
  });

  return findById(postId);
};

const getFeed = async ({
  page = 1,
  limit = 10,
  userId = null,
  includePrivate = false,
  viewerId = null,
  postType = "post",
  requireVideo = false,
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;
  const where = ["p.is_deleted = 0", "p.post_type = :postType"];
  const params = {
    limit: safeLimit,
    offset,
    postType,
  };

  if (userId) {
    where.push("p.user_id = :userId");
    params.userId = userId;
  }

  if (!includePrivate) {
    where.push("p.visibility = 'public'");
  }

  if (requireVideo) {
    where.push(`
      EXISTS (
        SELECT 1
        FROM post_media pmv
        WHERE pmv.post_id = p.post_id
          AND pmv.type = 'video'
      )
    `);
  }

  const whereClause = where.join(" AND ");

  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM posts p
      WHERE ${whereClause}
    `,
    params,
  );

  const rows = await query(
    `
      SELECT ${buildPostSelectFields(viewerId)}
      FROM posts p
      JOIN users u ON u.user_id = p.user_id
      WHERE ${whereClause}
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT :limit OFFSET :offset
    `,
    { ...params, viewerId },
  );

  const total = Number(countRows[0]?.total || 0);
  const items = await hydratePosts(rows);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasMore: offset + items.length < total,
    },
  };
};

const getFollowingFeed = async ({
  page = 1,
  limit = 10,
  viewerId,
  postType = "post",
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;

  // 1. Retrieve all users that the current user follows
  const followedUsers = await query(
    `
      SELECT following_id
      FROM follows
      WHERE follower_id = :viewerId
    `,
    { viewerId }
  );

  const followedUserIds = followedUsers.map((row) => row.following_id);

  // If the user is not following anyone, return empty list with correct pagination format
  if (followedUserIds.length === 0) {
    return {
      items: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  // 2. Build parameter map and placeholder markers dynamically to prevent SQL injection and avoid mixing placeholder styles
  const params = {
    postType,
    viewerId,
    limit: safeLimit,
    offset,
  };

  const followedPlaceholderNames = [];
  followedUserIds.forEach((id, index) => {
    const key = `followedId${index}`;
    params[key] = id;
    followedPlaceholderNames.push(`:${key}`);
  });

  const placeholders = followedPlaceholderNames.join(", ");

  // 3. Retrieve total count of posts from followed users
  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM posts p
      WHERE p.is_deleted = 0
        AND p.post_type = :postType
        AND p.visibility != 'private'
        AND p.user_id IN (${placeholders})
    `,
    params,
  );

  const total = Number(countRows[0]?.total || 0);

  // 4. Retrieve paginated list of posts with author hydration and liked status
  const rows = await query(
    `
      SELECT ${buildPostSelectFields(viewerId)}
      FROM posts p
      JOIN users u ON u.user_id = p.user_id
      WHERE p.is_deleted = 0
        AND p.post_type = :postType
        AND p.visibility != 'private'
        AND p.user_id IN (${placeholders})
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT :limit OFFSET :offset
    `,
    params,
  );

  const items = await hydratePosts(rows);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasMore: offset + items.length < total,
    },
  };
};

const updateWithMedia = async (postId, fields, media = [], replaceMedia = false) => {
  await withTransaction(async (connection) => {
    const allowedFields = ["content", "visibility", "location", "latitude", "longitude"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(fields, field)) {
        updates.push(`${field} = ?`);
        values.push(fields[field]);
      }
    }

    if (updates.length > 0 || replaceMedia) {
      if (!updates.includes("is_edited = 1")) {
        updates.push("is_edited = 1");
      }
      await connection.execute(`UPDATE posts SET ${updates.join(", ")} WHERE post_id = ?`, [...values, postId]);
    }

    if (replaceMedia) {
      await connection.execute(`DELETE FROM post_media WHERE post_id = ?`, [postId]);
      await insertMedia(connection, postId, media);
    }
  });

  return findById(postId);
};

const softDelete = async (postId) => {
  try {
    await execute(
      `UPDATE posts SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE post_id = :postId AND is_deleted = 0`,
      { postId },
    );
  } catch (error) {
    if (error.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }

    await execute(`UPDATE posts SET is_deleted = 1 WHERE post_id = :postId AND is_deleted = 0`, { postId });
  }

  return true;
};

module.exports = {
  findById,
  createWithMedia,
  getFeed,
  getFollowingFeed,
  updateWithMedia,
  softDelete,
  hydratePosts,
  buildPostSelectFields,
};
