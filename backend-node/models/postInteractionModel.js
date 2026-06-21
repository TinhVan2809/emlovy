const { query, withTransaction } = require("../config/database");
const userModel = require("./userModel");
const { createHttpError } = require("../utils/httpError");

const buildCommentSelectFields = (viewerId = null, viewerPlaceholder = ":viewerId") => `
  c.id,
  c.post_id,
  c.user_id,
  c.parent_id,
  c.content,
  c.like_count,
  c.is_edited,
  c.is_deleted,
  c.created_at,
  c.updated_at,
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
  (
    SELECT COUNT(*)
    FROM comments r
    WHERE r.parent_id = c.id
      AND r.is_deleted = 0
  ) AS reply_count,
  ${
    viewerId
      ? `EXISTS(
          SELECT 1
          FROM likes l
          WHERE l.user_id = ${viewerPlaceholder}
            AND l.comment_id = c.id
            AND l.post_id IS NULL
        )`
      : "0"
  } AS liked_by_me
`;

const toPublicComment = (row) => {
  if (!row) {
    return null;
  }

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
  });

  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    parent_id: row.parent_id,
    content: row.content,
    like_count: Number(row.like_count || 0),
    reply_count: Number(row.reply_count || 0),
    liked_by_me: Boolean(row.liked_by_me),
    is_edited: Boolean(row.is_edited),
    is_deleted: Boolean(row.is_deleted),
    created_at: row.created_at,
    updated_at: row.updated_at,
    author,
    replies: [],
  };
};

const findPostForUpdate = async (connection, postId) => {
  const [rows] = await connection.execute(
    `
      SELECT post_id, like_count, comment_count, visibility
      FROM posts
      WHERE post_id = ? AND is_deleted = 0
      LIMIT 1
      FOR UPDATE
    `,
    [postId],
  );

  return rows[0] || null;
};

const findCommentForUpdate = async (connection, commentId) => {
  const [rows] = await connection.execute(
    `
      SELECT id, post_id, parent_id, like_count
      FROM comments
      WHERE id = ? AND is_deleted = 0
      LIMIT 1
      FOR UPDATE
    `,
    [commentId],
  );

  return rows[0] || null;
};

const getPostSummary = async (postId, fields = "like_count, comment_count") => {
  const rows = await query(
    `
      SELECT post_id, ${fields}
      FROM posts
      WHERE post_id = :postId
      LIMIT 1
    `,
    { postId },
  );

  return rows[0] || null;
};

const findCommentById = async (commentId, viewerId = null) => {
  const rows = await query(
    `
      SELECT ${buildCommentSelectFields(viewerId)}
      FROM comments c
      JOIN users u ON u.user_id = c.user_id
      WHERE c.id = :commentId AND c.is_deleted = 0
      LIMIT 1
    `,
    { commentId, viewerId },
  );

  return toPublicComment(rows[0]);
};

const ensurePostExists = async (postId) => {
  const rows = await query(
    `
      SELECT post_id
      FROM posts
      WHERE post_id = :postId AND is_deleted = 0
      LIMIT 1
    `,
    { postId },
  );

  if (!rows[0]) {
    throw createHttpError(404, "Khong tim thay bai viet.");
  }
};

const likePost = async ({ postId, userId }) => {
  const next = await withTransaction(async (connection) => {
    const post = await findPostForUpdate(connection, postId);

    if (!post) {
      throw createHttpError(404, "Khong tim thay bai viet.");
    }

    const [existingRows] = await connection.execute(
      `
        SELECT like_id
        FROM likes
        WHERE user_id = ? AND post_id = ? AND comment_id IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [userId, postId],
    );

    let likeCount = Number(post.like_count || 0);

    if (existingRows.length === 0) {
      await connection.execute(
        `INSERT INTO likes (user_id, post_id, comment_id) VALUES (?, ?, NULL)`,
        [userId, postId],
      );
      likeCount += 1;
      await connection.execute(`UPDATE posts SET like_count = ? WHERE post_id = ?`, [likeCount, postId]);
    }

    return {
      post_id: postId,
      liked_by_me: true,
      like_count: likeCount,
    };
  });

  return next;
};

const unlikePost = async ({ postId, userId }) => {
  const next = await withTransaction(async (connection) => {
    const post = await findPostForUpdate(connection, postId);

    if (!post) {
      throw createHttpError(404, "Khong tim thay bai viet.");
    }

    const [result] = await connection.execute(
      `DELETE FROM likes WHERE user_id = ? AND post_id = ? AND comment_id IS NULL`,
      [userId, postId],
    );

    const likeCount = Math.max(0, Number(post.like_count || 0) - Number(result.affectedRows || 0));

    if (result.affectedRows > 0) {
      await connection.execute(`UPDATE posts SET like_count = ? WHERE post_id = ?`, [likeCount, postId]);
    }

    return {
      post_id: postId,
      liked_by_me: false,
      like_count: likeCount,
    };
  });

  return next;
};

const createComment = async ({ postId, userId, content }) => {
  const commentId = await withTransaction(async (connection) => {
    const post = await findPostForUpdate(connection, postId);

    if (!post) {
      throw createHttpError(404, "Khong tim thay bai viet.");
    }

    const [result] = await connection.execute(
      `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, NULL, ?)`,
      [postId, userId, content],
    );

    await connection.execute(`UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?`, [postId]);

    return result.insertId;
  });

  const [comment, post] = await Promise.all([
    findCommentById(commentId, userId),
    getPostSummary(postId, "comment_count, visibility"),
  ]);

  return {
    comment,
    post: {
      post_id: postId,
      comment_count: Number(post?.comment_count || 0),
      visibility: post?.visibility || null,
    },
  };
};

const createReply = async ({ postId, parentCommentId, userId, content }) => {
  const replyId = await withTransaction(async (connection) => {
    const post = await findPostForUpdate(connection, postId);

    if (!post) {
      throw createHttpError(404, "Khong tim thay bai viet.");
    }

    const parent = await findCommentForUpdate(connection, parentCommentId);

    if (!parent || Number(parent.post_id) !== Number(postId)) {
      throw createHttpError(404, "Khong tim thay binh luan.");
    }

    const rootParentId = parent.parent_id || parent.id;
    const [result] = await connection.execute(
      `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)`,
      [postId, userId, rootParentId, content],
    );

    await connection.execute(`UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?`, [postId]);

    return result.insertId;
  });

  const [comment, post] = await Promise.all([
    findCommentById(replyId, userId),
    getPostSummary(postId, "comment_count, visibility"),
  ]);

  return {
    comment,
    post: {
      post_id: postId,
      comment_count: Number(post?.comment_count || 0),
      visibility: post?.visibility || null,
    },
  };
};

const likeComment = async ({ commentId, userId }) => {
  const next = await withTransaction(async (connection) => {
    const comment = await findCommentForUpdate(connection, commentId);

    if (!comment) {
      throw createHttpError(404, "Khong tim thay binh luan.");
    }

    const [existingRows] = await connection.execute(
      `
        SELECT like_id
        FROM likes
        WHERE user_id = ? AND comment_id = ? AND post_id IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [userId, commentId],
    );

    let likeCount = Number(comment.like_count || 0);

    if (existingRows.length === 0) {
      await connection.execute(
        `INSERT INTO likes (user_id, post_id, comment_id) VALUES (?, NULL, ?)`,
        [userId, commentId],
      );
      likeCount += 1;
      await connection.execute(`UPDATE comments SET like_count = ? WHERE id = ?`, [likeCount, commentId]);
    }

    return {
      id: commentId,
      post_id: comment.post_id,
      liked_by_me: true,
      like_count: likeCount,
    };
  });

  return next;
};

const unlikeComment = async ({ commentId, userId }) => {
  const next = await withTransaction(async (connection) => {
    const comment = await findCommentForUpdate(connection, commentId);

    if (!comment) {
      throw createHttpError(404, "Khong tim thay binh luan.");
    }

    const [result] = await connection.execute(
      `DELETE FROM likes WHERE user_id = ? AND comment_id = ? AND post_id IS NULL`,
      [userId, commentId],
    );

    const likeCount = Math.max(0, Number(comment.like_count || 0) - Number(result.affectedRows || 0));

    if (result.affectedRows > 0) {
      await connection.execute(`UPDATE comments SET like_count = ? WHERE id = ?`, [likeCount, commentId]);
    }

    return {
      id: commentId,
      post_id: comment.post_id,
      liked_by_me: false,
      like_count: likeCount,
    };
  });

  return next;
};

const attachReplies = async (comments, viewerId = null) => {
  if (!comments.length) {
    return comments;
  }

  const parentIds = comments.map((comment) => comment.id);
  const placeholders = parentIds.map(() => "?").join(", ");
  const params = viewerId ? [viewerId, ...parentIds] : parentIds;
  const rows = await query(
    `
      SELECT ${buildCommentSelectFields(viewerId, "?")}
      FROM comments c
      JOIN users u ON u.user_id = c.user_id
      WHERE c.parent_id IN (${placeholders})
        AND c.is_deleted = 0
      ORDER BY c.created_at ASC
    `,
    params,
  );

  const repliesByParentId = new Map();

  for (const row of rows) {
    const reply = toPublicComment(row);
    const current = repliesByParentId.get(reply.parent_id) || [];
    current.push(reply);
    repliesByParentId.set(reply.parent_id, current);
  }

  return comments.map((comment) => ({
    ...comment,
    replies: repliesByParentId.get(comment.id) || [],
  }));
};

const getComments = async ({ postId, viewerId = null, page = 1, limit = 20, sort = "top" }) => {
  await ensurePostExists(postId);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const offset = (safePage - 1) * safeLimit;
  const orderClause = sort === "new" ? "c.created_at DESC" : "c.like_count DESC, c.created_at DESC";

  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM comments c
      WHERE c.post_id = :postId
        AND c.parent_id IS NULL
        AND c.is_deleted = 0
    `,
    { postId },
  );

  const rows = await query(
    `
      SELECT ${buildCommentSelectFields(viewerId)}
      FROM comments c
      JOIN users u ON u.user_id = c.user_id
      WHERE c.post_id = :postId
        AND c.parent_id IS NULL
        AND c.is_deleted = 0
      ORDER BY ${orderClause}
      LIMIT :limit OFFSET :offset
    `,
    {
      postId,
      viewerId,
      limit: safeLimit,
      offset,
    },
  );

  const items = await attachReplies(rows.map(toPublicComment), viewerId);
  const total = Number(countRows[0]?.total || 0);

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

module.exports = {
  createComment,
  createReply,
  getComments,
  likeComment,
  likePost,
  unlikeComment,
  unlikePost,
};
