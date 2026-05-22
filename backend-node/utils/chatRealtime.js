const conversationRoom = (conversationId) => `conversation:${conversationId}`;
const userRoom = (userId) => `user:${userId}`;

const emitChatMessage = (io, { conversation, message, participantIds = [] }) => {
  if (!io || !message) {
    return;
  }

  let target = io.to(conversationRoom(message.conversation_id));

  for (const participantId of participantIds) {
    target = target.to(userRoom(participantId));
  }

  const payload = {
    conversation,
    message,
    participant_ids: participantIds,
  };

  target.emit("receive_message", payload);
  target.emit("conversation_updated", {
    conversation,
    message,
    participant_ids: participantIds,
  });
};

module.exports = {
  conversationRoom,
  emitChatMessage,
  userRoom,
};
