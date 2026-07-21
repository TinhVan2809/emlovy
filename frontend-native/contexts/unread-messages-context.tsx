import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToChatEvents } from '@/services/chat-socket';
import { useAuth } from '@/contexts/auth-context';
import { chatApi } from '@/services/api';

type UnreadMessagesContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextType | null>(null);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy số tin nhắn chưa đọc từ API
  const isRefreshingRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (authLoading) return;

    if (!token) {
      setUnreadCount(0);
      return;
    }

    if (isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;
      const response = await chatApi.getConversations(token, { limit: 100, page: 1 });
      const total = response.data.items.reduce(
        (sum, conversation) => sum + (conversation.unread_count || 0),
        0
      );
      setUnreadCount(total);
    } catch (error) {
      console.error('[UnreadMessages] Failed to fetch unread count:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [token, authLoading]);

  // Tăng số lượng tin nhắn chưa đọc
  const incrementUnreadCount = useCallback(() => {
    console.log('[UnreadMessages] Incrementing unread count');
    setUnreadCount(prev => {
      const next = prev + 1;
      console.log('[UnreadMessages] Count increased:', prev, '->', next);
      return next;
    });
  }, []);

  // Reset số lượng tin nhắn chưa đọc
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Load unread count khi auth ready và có token
  useEffect(() => {
    // Chỉ fetch khi auth đã load xong và có token
    if (!authLoading && token) {
      refreshUnreadCount();
    } else if (!authLoading && !token) {
      console.log('[UnreadMessages] Auth ready but no token, resetting count');
      setUnreadCount(0);
    }
  }, [token, authLoading, refreshUnreadCount]);

  // Lắng nghe socket events để cập nhật realtime
  useEffect(() => {
    const userId = user?.user_id;
    if (!token || !userId) {
      console.log('[UnreadMessages] Socket listener not active - missing token or user');
      return undefined;
    }

    console.log('[UnreadMessages] Subscribing to chat events for user:', userId);

    return subscribeToChatEvents(token, {
      onReceiveMessage: ({ message }) => {
        const isFromOther = Number(message.sender_id) !== Number(userId);
        console.log('[UnreadMessages] Received message event:', {
          senderId: message.sender_id,
          currentUserId: userId,
          isFromOther,
        });

        if (isFromOther) {
          incrementUnreadCount();
        } else {
          console.log('[UnreadMessages] Message from self, ignoring');
        }
      },
    });
  }, [token, user?.user_id, incrementUnreadCount]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        incrementUnreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);

  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }

  return context;
}
