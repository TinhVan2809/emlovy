import { io, Socket } from 'socket.io-client';

import { API_ORIGIN } from '@/services/api';
import { notificationSound } from '@/services/notification-sound';
import type { ChatConversation, ChatMessage, SendMessageInput } from '@/types/auth';

type ReceiveMessagePayload = {
  conversation: ChatConversation | null;
  message: ChatMessage;
  participant_ids: number[];
};

type ConversationUpdatedPayload = {
  conversation: ChatConversation | null;
  message: ChatMessage;
  participant_ids: number[];
};

type ChatEventHandlers = {
  onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
  onConversationUpdated?: (payload: ConversationUpdatedPayload) => void;
  onError?: (payload: { message: string; status?: number; success?: boolean }) => void;
  currentUserId?: number | null; // ← Thêm để check người gửi
};

let socket: Socket | null = null;
let socketToken: string | null = null;

const getChatSocket = (token: string) => {
  if (!socket || socketToken !== token) {
    socket?.disconnect();
    socketToken = token;
    socket = io(API_ORIGIN, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket'],
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const subscribeToChatEvents = (token: string, handlers: ChatEventHandlers) => {
  const activeSocket = getChatSocket(token);

  // Wrap onReceiveMessage để phát sound khi nhận tin nhắn mới
  const onReceiveMessageWithSound = (payload: ReceiveMessagePayload) => {
    // Chỉ phát sound nếu người nhận KHÔNG phải người gửi
    const isReceivedMessage = 
      handlers.currentUserId && 
      payload.message.sender_id !== handlers.currentUserId;

    if (isReceivedMessage) {
      notificationSound.play().catch(() => {
        // Silent fail - không block message handling
      });
    }

    // Gọi handler gốc
    handlers.onReceiveMessage?.(payload);
  };

  if (handlers.onReceiveMessage) {
    activeSocket.on('receive_message', onReceiveMessageWithSound);
  }

  if (handlers.onConversationUpdated) {
    activeSocket.on('conversation_updated', handlers.onConversationUpdated);
  }

  if (handlers.onError) {
    activeSocket.on('chat:error', handlers.onError);
  }

  return () => {
    if (handlers.onReceiveMessage) {
      activeSocket.off('receive_message', onReceiveMessageWithSound);
    }

    if (handlers.onConversationUpdated) {
      activeSocket.off('conversation_updated', handlers.onConversationUpdated);
    }

    if (handlers.onError) {
      activeSocket.off('chat:error', handlers.onError);
    }
  };
};

export const joinChatConversation = (token: string, conversationId: number) => {
  const activeSocket = getChatSocket(token);

  activeSocket.emit('chat:join', { conversation_id: conversationId });
};

export const leaveChatConversation = (token: string, conversationId: number) => {
  const activeSocket = getChatSocket(token);

  activeSocket.emit('chat:leave', { conversation_id: conversationId });
};

export const sendRealtimeMessage = (
  token: string,
  conversationId: number,
  input: SendMessageInput,
  ack?: (payload: { success: boolean; data?: { conversation: ChatConversation; message: ChatMessage }; message?: string }) => void,
) => {
  const activeSocket = getChatSocket(token);

  activeSocket.timeout(7000).emit(
    'send_message',
    {
      conversation_id: conversationId,
      content: input.content,
      message_type: input.message_type || input.messageType || 'text',
    },
    (error: Error | null, payload: { success: boolean; data?: { conversation: ChatConversation; message: ChatMessage }; message?: string }) => {
      if (error) {
        ack?.({ success: false, message: 'Khong the ket noi realtime.' });
        return;
      }

      ack?.(payload);
    },
  );
};
