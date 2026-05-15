const { execute, query, withTransaction } = require("../config/database");
const userModel = require("./userModel");
const { createHttpError } = require("../utils/httpError");

const storySelectFields = `
  s.story_id,
  s.user_id,
  s.content,
  s.background_color,
  s.music_url,
  s.expires_at,
  s.is_active,
  s.is_deleted,
  s.created_at,
  s.updated_at,
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
  sm.story_media_id,
  sm.media_url,
  sm.type AS media_type,
  sm.duration,
  sm.position_x,
  sm.position_y,
  sm.created_at AS media_created_at
`;

const toAuthor = (row) =>
  userModel.toPublicUser({
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

const hydrateStories = (rows) => {
  const storyMap = new Map();

  for (const row of rows) {
    if (!storyMap.has(row.story_id)) {
      storyMap.set(row.story_id, {
        story_id: row.story_id,
        user_id: row.user_id,
        content: row.content,
        background_color: row.background_color,
        music_url: row.music_url,
        expires_at: row.expires_at,
        is_active: Boolean(row.is_active),
        is_deleted: Boolean(row.is_deleted),
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: toAuthor(row),
        media: [],
      });
    }

    if (row.story_media_id) {
      storyMap.get(row.story_id).media.push({
        story_media_id: row.story_media_id,
        story_id: row.story_id,
        media_url: row.media_url,
        type: row.media_type,
        duration: row.duration,
        position_x: row.position_x,
        position_y: row.position_y,
        created_at: row.media_created_at,
      });
    }
  }

  return [...storyMap.values()];
};

const groupStoriesByAuthor = (stories, viewerId) => {
  const groupMap = new Map();

  for (const story of stories) {
    if (!groupMap.has(story.user_id)) {
      groupMap.set(story.user_id, {
        user_id: story.user_id,
        author: story.author,
        is_own: Number(story.user_id) === Number(viewerId),
        stories: [],
        latest_created_at: story.created_at,
      });
    }

    const group = groupMap.get(story.user_id);
    group.stories.push(story);

    if (new Date(story.created_at).getTime() > new Date(group.latest_created_at).getTime()) {
      group.latest_created_at = story.created_at;
    }
  }

  return [...groupMap.values()].sort((left, right) => {
    if (left.is_own !== right.is_own) {
      return left.is_own ? -1 : 1;
    }

    return new Date(right.latest_created_at).getTime() - new Date(left.latest_created_at).getTime();
  });
};

const findActiveById = async (storyId) => {
  const rows = await query(
    `
      SELECT ${storySelectFields}
      FROM stories s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.story_id
      WHERE s.story_id = :storyId
        AND s.is_deleted = 0
        AND s.is_active = 1
        AND s.expires_at > CURRENT_TIMESTAMP
      ORDER BY sm.story_media_id ASC
    `,
    { storyId },
  );

  return hydrateStories(rows)[0] || null;
};

const findOwnedById = async (storyId) => {
  const rows = await query(
    `
      SELECT ${storySelectFields}
      FROM stories s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.story_id
      WHERE s.story_id = :storyId
        AND s.is_deleted = 0
      ORDER BY sm.story_media_id ASC
    `,
    { storyId },
  );

  return hydrateStories(rows)[0] || null;
};

const insertMedia = async (connection, storyId, media = []) => {
  for (const file of media || []) {
    await connection.execute(
      `
        INSERT INTO story_media (story_id, media_url, type, duration, position_x, position_y)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [storyId, file.media_url, file.type || "image", file.duration ?? null, file.position_x ?? null, file.position_y ?? null],
    );
  }
};

const create = async ({ user_id, content = null, background_color = "#FFE1D6", music_url = null, media = [] }) => {
  const storyId = await withTransaction(async (connection) => {
    const [result] = await connection.execute(
      `
        INSERT INTO stories (user_id, content, background_color, music_url, expires_at)
        VALUES (?, ?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))
      `,
      [user_id, content, background_color, music_url],
    );

    await insertMedia(connection, result.insertId, media);

    return result.insertId;
  });

  return findActiveById(storyId);
};

const update = async (storyId, fields, media = [], replaceMedia = false) => {
  await withTransaction(async (connection) => {
    const allowedFields = ["content", "background_color", "music_url"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(fields, field)) {
        updates.push(`${field} = ?`);
        values.push(fields[field]);
      }
    }

    if (updates.length > 0) {
      await connection.execute(`UPDATE stories SET ${updates.join(", ")} WHERE story_id = ?`, [...values, storyId]);
    }

    if (replaceMedia) {
      await connection.execute(`DELETE FROM story_media WHERE story_id = ?`, [storyId]);
      await insertMedia(connection, storyId, media);
    }
  });

  return findActiveById(storyId);
};

const softDelete = async (storyId) => {
  await execute(
    `
      UPDATE stories
      SET is_deleted = 1, is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE story_id = :storyId
        AND is_deleted = 0
    `,
    { storyId },
  );
};

const cleanupExpiredStories = async () => {
  const result = await execute(
    `
      UPDATE stories
      SET is_deleted = 1, is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE is_deleted = 0
        AND (is_active = 1 OR is_active IS NULL)
        AND expires_at <= CURRENT_TIMESTAMP
    `,
  );

  return Number(result.affectedRows || 0);
};

const getFollowingStories = async (viewerId) => {
  const rows = await query(
    `
      SELECT ${storySelectFields}
      FROM stories s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.story_id
      WHERE s.is_deleted = 0
        AND s.is_active = 1
        AND s.expires_at > CURRENT_TIMESTAMP
        AND (
          s.user_id = :viewerId
          OR EXISTS (
            SELECT 1
            FROM follows f
            WHERE f.follower_id = :viewerId
              AND f.following_id = s.user_id
          )
        )
      ORDER BY
        CASE WHEN s.user_id = :viewerId THEN 0 ELSE 1 END,
        s.created_at DESC,
        sm.story_media_id ASC
    `,
    { viewerId },
  );

  return groupStoriesByAuthor(hydrateStories(rows), viewerId);
};

const getUserStories = async (userId, { activeOnly = true } = {}) => {
  const activeClause = activeOnly
    ? "AND s.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP"
    : "";

  const rows = await query(
    `
      SELECT ${storySelectFields}
      FROM stories s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.story_id
      WHERE s.user_id = :userId
        AND s.is_deleted = 0
        ${activeClause}
      ORDER BY s.created_at DESC, sm.story_media_id ASC
    `,
    { userId },
  );

  return hydrateStories(rows);
};

const assertCanManage = (story, user) => {
  if (!story) {
    throw createHttpError(404, "Khong tim thay story.");
  }

  if (Number(story.user_id) !== Number(user.user_id) && user.role !== "admin") {
    throw createHttpError(403, "Ban khong co quyen thao tac story nay.");
  }
};

module.exports = {
  assertCanManage,
  cleanupExpiredStories,
  create,
  findOwnedById,
  getFollowingStories,
  getUserStories,
  softDelete,
  update,
};
