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
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy số tin nhắn chưa đọc từ API
  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await chatApi.getConversations(token, { limit: 100, page: 1 });
      const total = response.data.items.reduce(
        (sum, conversation) => sum + (conversation.unread_count || 0),
        0
      );
      setUnreadCount(total);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [token]);

  // Tăng số lượng tin nhắn chưa đọc
  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  // Reset số lượng tin nhắn chưa đọc
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Load unread count khi mount hoặc token thay đổi
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Lắng nghe socket events để cập nhật realtime
  useEffect(() => {
    if (!token || !user) {
      return undefined;
    }

    return subscribeToChatEvents(token, {
      onReceiveMessage: ({ message }) => {
        // Chỉ tăng unread count nếu tin nhắn không phải từ người dùng hiện tại
        if (Number(message.sender_id) !== Number(user.user_id)) {
          incrementUnreadCount();
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
