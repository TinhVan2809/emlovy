const { query, withTransaction } = require("../config/database");
const userModel = require("./userModel");

const messageTypes = new Set(["text", "image", "video", "file", "sticker", "voice", "location"]);

const buildUserSelectFields = (alias, prefix) => `
  ${alias}.user_id AS ${prefix}_user_id,
  ${alias}.name AS ${prefix}_name,
  ${alias}.username AS ${prefix}_username,
  ${alias}.birthday AS ${prefix}_birthday,
  ${alias}.gender AS ${prefix}_gender,
  ${alias}.phone AS ${prefix}_phone,
  ${alias}.avata AS ${prefix}_avata,
  ${alias}.email AS ${prefix}_email,
  ${alias}.role AS ${prefix}_role,
  ${alias}.status AS ${prefix}_status,
  ${alias}.created_at AS ${prefix}_created_at
`;

const userFromRow = (row, prefix) => {
  if (!row?.[`${prefix}_user_id`]) {
    return null;
  }

  return userModel.toPublicUser({
    user_id: row[`${prefix}_user_id`],
    name: row[`${prefix}_name`],
    username: row[`${prefix}_username`],
    birthday: row[`${prefix}_birthday`],
    gender: row[`${prefix}_gender`],
    phone: row[`${prefix}_phone`],
    avata: row[`${prefix}_avata`],
    email: row[`${prefix}_email`],
    role: row[`${prefix}_role`],
    status: row[`${prefix}_status`],
    created_at: row[`${prefix}_created_at`],
  });
};

const toMessage = (row, prefix = "") => {
  if (!row?.[`${prefix}message_id`]) {
    return null;
  }

  return {
    message_id: row[`${prefix}message_id`],
    conversation_id: row[`${prefix}conversation_id`],
    sender_id: row[`${prefix}sender_id`],
    content: row[`${prefix}content`],
    message_type: row[`${prefix}message_type`] || "text",
    is_edited: Boolean(row[`${prefix}is_edited`]),
    is_deleted: Boolean(row[`${prefix}is_deleted`]),
    reply_to_message_id: row[`${prefix}reply_to_message_id`],
    created_at: row[`${prefix}created_at`],
    updated_at: row[`${prefix}updated_at`],
    sender: userFromRow(row, prefix ? `${prefix}sender` : "sender"),
    attachments: [],
  };
};

const toConversation = (row) => ({
  conversation_id: row.conversation_id,
  type: row.type,
  name: row.name,
  avatar: row.avatar,
  avatar_url: row.avatar,
  last_message_id: row.last_message_id,
  last_message_at: row.last_message_at,
  is_active: Boolean(row.is_active),
  created_at: row.created_at,
  updated_at: row.updated_at,
  last_message: toMessage(row, "last_message_"),
  participants: [],
  participant_ids: [],
  unread_count: 0,
  title: row.name || "Emlovy chat",
});

const getConversationSelect = () => `
  c.conversation_id,
  c.type,
  c.name,
  c.avatar,
  c.last_message_id,
  c.last_message_at,
  c.is_active,
  c.created_at,
  c.updated_at,
  m.message_id AS last_message_message_id,
  m.conversation_id AS last_message_conversation_id,
  m.sender_id AS last_message_sender_id,
  m.content AS last_message_content,
  m.message_type AS last_message_message_type,
  m.is_edited AS last_message_is_edited,
  m.is_deleted AS last_message_is_deleted,
  m.reply_to_message_id AS last_message_reply_to_message_id,
  m.created_at AS last_message_created_at,
  m.updated_at AS last_message_updated_at,
  ${buildUserSelectFields("su", "last_message_sender")}
`;

const attachParticipants = async (conversations, viewerId) => {
  if (!conversations.length) {
    return conversations;
  }

  const conversationIds = conversations.map((conversation) => conversation.conversation_id);
  const placeholders = conversationIds.map(() => "?").join(", ");
  const rows = await query(
    `
      SELECT
        cp.conversation_id,
        cp.role,
        cp.joined_at,
        cp.is_muted,
        cp.is_archived,
        cp.last_read_message_id,
        ${buildUserSelectFields("u", "participant")}
      FROM conversation_participants cp
      JOIN users u ON u.user_id = cp.user_id
      WHERE cp.conversation_id IN (${placeholders})
      ORDER BY cp.joined_at ASC
    `,
    conversationIds,
  );

  const participantsByConversation = new Map();

  for (const row of rows) {
    const participant = {
      ...userFromRow(row, "participant"),
      role: row.role,
      joined_at: row.joined_at,
      is_muted: Boolean(row.is_muted),
      is_archived: Boolean(row.is_archived),
      last_read_message_id: row.last_read_message_id,
    };
    const current = participantsByConversation.get(row.conversation_id) || [];
    current.push(participant);
    participantsByConversation.set(row.conversation_id, current);
  }

  return conversations.map((conversation) => {
    const participants = participantsByConversation.get(conversation.conversation_id) || [];
    const otherParticipant =
      participants.find((participant) => Number(participant.user_id) !== Number(viewerId)) || participants[0] || null;

    return {
      ...conversation,
      participants,
      participant_ids: participants.map((participant) => participant.user_id),
      title:
        conversation.type === "private"
          ? otherParticipant?.name || conversation.name || "Emlovy chat"
          : conversation.name || participants.map((participant) => participant.name).join(", ") || "Emlovy group",
      avatar_url:
        conversation.type === "private"
          ? otherParticipant?.avatar_url || otherParticipant?.avata || null
          : conversation.avatar,
    };
  });
};

const normalizeParticipantIds = (creatorId, participantIds = []) => {
  const ids = [creatorId, ...participantIds]
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  return [...new Set(ids)];
};

const findPrivateConversationId = async (firstUserId, secondUserId) => {
  const rows = await query(
    `
      SELECT c.conversation_id
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.conversation_id
      WHERE c.type = 'private'
        AND c.is_active = 1
        AND cp.user_id IN (?, ?)
      GROUP BY c.conversation_id
      HAVING COUNT(DISTINCT cp.user_id) = 2
        AND (
          SELECT COUNT(*)
          FROM conversation_participants cp2
          WHERE cp2.conversation_id = c.conversation_id
        ) = 2
      LIMIT 1
    `,
    [firstUserId, secondUserId],
  );

  return rows[0]?.conversation_id || null;
};

const findConversationForUser = async (conversationId, viewerId) => {
  const rows = await query(
    `
      SELECT ${getConversationSelect()}
      FROM conversations c
      JOIN conversation_participants mine
        ON mine.conversation_id = c.conversation_id
        AND mine.user_id = :viewerId
      LEFT JOIN messages m ON m.message_id = c.last_message_id
      LEFT JOIN users su ON su.user_id = m.sender_id
      WHERE c.conversation_id = :conversationId
        AND c.is_active = 1
      LIMIT 1
    `,
    { conversationId, viewerId },
  );

  const conversations = await attachParticipants(rows.map(toConversation), viewerId);
  return conversations[0] || null;
};

const createConversation = async ({ creatorId, participantIds = [], type = "private", name = null }) => {
  const safeType = type === "group" ? "group" : "private";
  const normalizedParticipantIds = normalizeParticipantIds(creatorId, participantIds);

  if (safeType === "private" && normalizedParticipantIds.length === 2) {
    const existingConversationId = await findPrivateConversationId(
      normalizedParticipantIds[0],
      normalizedParticipantIds[1],
    );

    if (existingConversationId) {
      return findConversationForUser(existingConversationId, creatorId);
    }
  }

  const conversationId = await withTransaction(async (connection) => {
    const [conversationResult] = await connection.execute(
      `
        INSERT INTO conversations (type, name)
        VALUES (?, ?)
      `,
      [safeType, safeType === "group" ? name : null],
    );

    for (const userId of normalizedParticipantIds) {
      await connection.execute(
        `
          INSERT INTO conversation_participants (conversation_id, user_id, role)
          VALUES (?, ?, ?)
        `,
        [conversationResult.insertId, userId, userId === creatorId ? "admin" : "member"],
      );
    }

    return conversationResult.insertId;
  });

  return findConversationForUser(conversationId, creatorId);
};

const listConversationsForUser = async ({ userId, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const offset = (safePage - 1) * safeLimit;
  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM conversations c
      JOIN conversation_participants mine
        ON mine.conversation_id = c.conversation_id
        AND mine.user_id = :userId
      WHERE c.is_active = 1
    `,
    { userId },
  );
  const rows = await query(
    `
      SELECT ${getConversationSelect()}
      FROM conversations c
      JOIN conversation_participants mine
        ON mine.conversation_id = c.conversation_id
        AND mine.user_id = :userId
      LEFT JOIN messages m ON m.message_id = c.last_message_id
      LEFT JOIN users su ON su.user_id = m.sender_id
      WHERE c.is_active = 1
      ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC
      LIMIT :limit OFFSET :offset
    `,
    { userId, limit: safeLimit, offset },
  );
  const total = Number(countRows[0]?.total || 0);
  const items = await attachParticipants(rows.map(toConversation), userId);

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

const isParticipant = async (conversationId, userId) => {
  const rows = await query(
    `
      SELECT 1
      FROM conversation_participants
      WHERE conversation_id = :conversationId
        AND user_id = :userId
      LIMIT 1
    `,
    { conversationId, userId },
  );

  return Boolean(rows[0]);
};

const getConversationParticipantIds = async (conversationId) => {
  const rows = await query(
    `
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = :conversationId
      ORDER BY joined_at ASC
    `,
    { conversationId },
  );

  return rows.map((row) => row.user_id);
};

const findMessageById = async (messageId) => {
  const rows = await query(
    `
      SELECT
        m.message_id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.is_edited,
        m.is_deleted,
        m.reply_to_message_id,
        m.created_at,
        m.updated_at,
        ${buildUserSelectFields("u", "sender")}
      FROM messages m
      JOIN users u ON u.user_id = m.sender_id
      WHERE m.message_id = :messageId
      LIMIT 1
    `,
    { messageId },
  );

  return toMessage(rows[0]);
};

const listMessagesForConversation = async ({ conversationId, page = 1, limit = 30 }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 30));
  const offset = (safePage - 1) * safeLimit;
  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM messages
      WHERE conversation_id = :conversationId
        AND is_deleted = 0
    `,
    { conversationId },
  );
  const rows = await query(
    `
      SELECT
        m.message_id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.is_edited,
        m.is_deleted,
        m.reply_to_message_id,
        m.created_at,
        m.updated_at,
        ${buildUserSelectFields("u", "sender")}
      FROM messages m
      JOIN users u ON u.user_id = m.sender_id
      WHERE m.conversation_id = :conversationId
        AND m.is_deleted = 0
      ORDER BY m.created_at DESC, m.message_id DESC
      LIMIT :limit OFFSET :offset
    `,
    { conversationId, limit: safeLimit, offset },
  );
  const items = rows.map((row) => toMessage(row)).filter(Boolean).reverse();
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

const createMessage = async ({
  conversationId,
  senderId,
  content,
  messageType = "text",
  replyToMessageId = null,
}) => {
  const safeMessageType = messageTypes.has(messageType) ? messageType : "text";
  const messageId = await withTransaction(async (connection) => {
    const [messageResult] = await connection.execute(
      `
        INSERT INTO messages
          (conversation_id, sender_id, content, message_type, reply_to_message_id)
        VALUES
          (?, ?, ?, ?, ?)
      `,
      [conversationId, senderId, content, safeMessageType, replyToMessageId],
    );

    await connection.execute(
      `
        UPDATE conversations
        SET last_message_id = ?, last_message_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ?
      `,
      [messageResult.insertId, conversationId],
    );

    return messageResult.insertId;
  });

  return findMessageById(messageId);
};

module.exports = {
  createConversation,
  createMessage,
  findConversationForUser,
  getConversationParticipantIds,
  isParticipant,
  listConversationsForUser,
  listMessagesForConversation,
};
