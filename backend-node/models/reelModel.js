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
  hardDelete,
  toPublicReel,
};
