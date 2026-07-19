import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('[UnreadMessages] Context state:', { 
    unreadCount, 
    hasToken: !!token, 
    hasUser: !!user,
    authLoading,
    isRefreshing
  });

  // Lấy số tin nhắn chưa đọc từ API
  const refreshUnreadCount = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[UnreadMessages] Auth still loading, skipping refresh');
      return;
    }

    if (!token) {
      console.log('[UnreadMessages] No token, setting count to 0');
      setUnreadCount(0);
      return;
    }

    if (isRefreshing) {
      console.log('[UnreadMessages] Already refreshing, skipping');
      return;
    }

    try {
      setIsRefreshing(true);
      console.log('[UnreadMessages] Fetching unread count from API...');
      const response = await chatApi.getConversations(token, { limit: 100, page: 1 });
      const total = response.data.items.reduce(
        (sum, conversation) => sum + (conversation.unread_count || 0),
        0
      );
      console.log('[UnreadMessages] Unread count from API:', total);
      setUnreadCount(total);
    } catch (error) {
      console.error('[UnreadMessages] Failed to fetch unread count:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [token, authLoading, isRefreshing]);

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
      console.log('[UnreadMessages] Auth ready, fetching unread count');
      refreshUnreadCount();
    } else if (!authLoading && !token) {
      console.log('[UnreadMessages] Auth ready but no token, resetting count');
      setUnreadCount(0);
    }
  }, [token, authLoading]);

  // Lắng nghe socket events để cập nhật realtime
  useEffect(() => {
    if (!token || !user) {
      console.log('[UnreadMessages] Socket listener not active - missing token or user');
      return undefined;
    }

    console.log('[UnreadMessages] Subscribing to chat events for user:', user.user_id);

    return subscribeToChatEvents(token, {
      onReceiveMessage: ({ message }) => {
        console.log('[UnreadMessages] Received message event:', {
          senderId: message.sender_id,
          currentUserId: user.user_id,
          isFromOther: Number(message.sender_id) !== Number(user.user_id)
        });
        
        // Chỉ tăng unread count nếu tin nhắn không phải từ người dùng hiện tại
        if (Number(message.sender_id) !== Number(user.user_id)) {
          console.log('[UnreadMessages] Message from other user, incrementing count');
          incrementUnreadCount();
        } else {
          console.log('[UnreadMessages] Message from self, ignoring');
        }
      },
    });
  }, [token, user, incrementUnreadCount]);

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
