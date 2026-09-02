const { query, withTransaction } = require("../config/database");
const postModel = require("./postModel");

const REEL_POST_TYPE = "reel";

const toPublicReel = (post) => {
  if (!post) {
    return null;
  }

  const video = (post.media || []).find((item) => item.type === "video") || null;

  return {
    ...post,
    post_type: REEL_POST_TYPE,
    video,
    video_url: video?.media_url || null,
  };
};

const create = async ({ user_id, caption = null, media }) => {
  const post = await postModel.createWithMedia({
    user_id,
    post_type: REEL_POST_TYPE,
    content: caption,
    visibility: "public",
    media,
  });

  return toPublicReel(post);
};

const findById = async (postId, viewerId = null) => {
  const post = await postModel.findById(postId, viewerId);

  if (!post || post.post_type !== REEL_POST_TYPE) {
    return null;
  }

  return toPublicReel(post);
};

const getFeed = async ({ page = 1, limit = 6, viewerId = null, userId = null } = {}) => {
  const data = await postModel.getFeed({
    page,
    limit,
    viewerId,
    userId,
    postType: REEL_POST_TYPE,
    requireVideo: true,
  });

  return {
    ...data,
    items: data.items.map(toPublicReel),
  };
};

const getRandomReels = async ({ page = 1, limit = 10, viewerId = null, randomSeed = Date.now() } = {}) => {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const offset = (safePage - 1) * safeLimit;
  
  const countQuery = `
    SELECT COUNT(DISTINCT p.post_id) as total
    FROM posts p
    INNER JOIN post_media pm ON p.post_id = pm.post_id
    WHERE p.post_type = :postType
      AND p.is_deleted = 0
      AND pm.type = 'video'
  `;
  
  const countResult = await query(countQuery, { postType: REEL_POST_TYPE });
  const total = countResult[0]?.total || 0;
  
  const dataQuery = `
    SELECT 
      p.post_id,
      p.user_id,
      p.content,
      p.post_type,
      p.visibility,
      p.created_at,
      p.updated_at,
      p.is_deleted,
      u.user_id as author_user_id,
      u.name as author_name,
      u.username as author_username,
      u.avata as author_avatar_url,
      COALESCE(MAX(like_counts.like_count), 0) as like_count,
      COALESCE(MAX(comment_counts.comment_count), 0) as comment_count,
      ${viewerId ? `MAX(CASE WHEN l.user_id = :viewerId THEN 1 ELSE 0 END) as liked_by_me,` : '0 as liked_by_me,'}
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'post_media_id', pm.post_media_id,
          'media_url', pm.media_url,
          'type', pm.type,
          'sort_order', pm.sort_order,
          'width', pm.width,
          'height', pm.height,
          'duration', pm.duration
        )
      ) as media
    FROM posts p
    INNER JOIN users u ON p.user_id = u.user_id
    INNER JOIN post_media pm ON p.post_id = pm.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as like_count
      FROM likes
      WHERE comment_id IS NULL
      GROUP BY post_id
    ) like_counts ON p.post_id = like_counts.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      WHERE is_deleted = 0
      GROUP BY post_id
    ) comment_counts ON p.post_id = comment_counts.post_id
    ${viewerId ? 'LEFT JOIN likes l ON p.post_id = l.post_id AND l.user_id = :viewerId AND l.comment_id IS NULL' : ''}
    WHERE p.post_type = :postType
      AND p.is_deleted = 0
      AND pm.type = 'video'
    GROUP BY p.post_id, p.user_id, p.content, p.post_type, p.visibility, 
             p.created_at, p.updated_at, p.is_deleted,
             u.user_id, u.name, u.username, u.avata
    ORDER BY RAND(:randomSeed), p.post_id
    LIMIT :limit OFFSET :offset
  `;
  
  const rows = await query(dataQuery, {
    postType: REEL_POST_TYPE,
    viewerId: viewerId || null,
    randomSeed,
    limit: safeLimit,
    offset,
  });
  
  const items = rows.map((row) => {
    const media = typeof row.media === 'string' ? JSON.parse(row.media) : row.media;
    return toPublicReel({
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      post_type: row.post_type,
      visibility: row.visibility,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_deleted: row.is_deleted,
      like_count: row.like_count,
      comment_count: row.comment_count,
      media,
      author: {
        user_id: row.author_user_id,
        name: row.author_name,
        username: row.author_username,
        avatar_url: row.author_avatar_url,
      },
      liked_by_me: Boolean(row.liked_by_me),
    });
  });
  
  const hasMore = offset + items.length < total;
  
  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore,
    },
  };
};

const hardDelete = async (postId) => {
  const mediaRows = await withTransaction(async (connection) => {
    const [postRows] = await connection.execute(
      `
        SELECT post_id
        FROM posts
        WHERE post_id = ?
          AND post_type = ?
        LIMIT 1
        FOR UPDATE
      `,
      [postId, REEL_POST_TYPE],
    );

    if (!postRows[0]) {
      return [];
    }

    const [media] = await connection.execute(
      `
        SELECT media_url
        FROM post_media
        WHERE post_id = ?
      `,
      [postId],
    );

    await connection.execute(
      `
        DELETE l
        FROM likes l
        LEFT JOIN comments c ON c.id = l.comment_id
        WHERE l.post_id = ?
          OR c.post_id = ?
      `,
      [postId, postId],
    );
    await connection.execute("DELETE FROM comments WHERE post_id = ?", [postId]);
    await connection.execute("DELETE FROM post_media WHERE post_id = ?", [postId]);
    await connection.execute("DELETE FROM posts WHERE post_id = ? AND post_type = ?", [postId, REEL_POST_TYPE]);

    return media;
  });

  return mediaRows;
};

const getLatestComments = async (postId, { viewerId = null, limit = 20 } = {}) => {
  const rows = await query(
    `
      SELECT post_id
      FROM posts
      WHERE post_id = :postId
        AND post_type = :postType
        AND is_deleted = 0
      LIMIT 1
    `,
    { postId, postType: REEL_POST_TYPE },
  );

  if (!rows[0]) {
    return null;
  }

  const postInteractionModel = require("./postInteractionModel");

  return postInteractionModel.getComments({
    postId,
    viewerId,
    page: 1,
    limit,
    sort: "new",
  });
};

module.exports = {
  create,
  findById,
  getFeed,
  getLatestComments,
  getRandomReels,
  hardDelete,
  toPublicReel,
};
