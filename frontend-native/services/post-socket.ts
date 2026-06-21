import { io, Socket } from 'socket.io-client';

import { API_ORIGIN } from '@/services/api';
import type { Post, PostComment } from '@/types/auth';

type PostEventHandlers = {
  onCreated?: (post: Post) => void;
  onUpdated?: (post: Post) => void;
  onHidden?: (payload: { post_id: number }) => void;
  onCommented?: (payload: { post_id: number; comment_count: number; comment?: PostComment }) => void;
  onDeleted?: (payload: { post_id: number }) => void;
};

let socket: Socket | null = null;

const getPostSocket = () => {
  if (!socket) {
    socket = io(API_ORIGIN, {
      autoConnect: true,
      transports: ['websocket'],
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const subscribeToPostEvents = (handlers: PostEventHandlers) => {
  const activeSocket = getPostSocket();

  if (handlers.onCreated) {
    activeSocket.on('post:created', handlers.onCreated);
  }

  if (handlers.onUpdated) {
    activeSocket.on('post:updated', handlers.onUpdated);
  }

  if (handlers.onDeleted) {
    activeSocket.on('post:deleted', handlers.onDeleted);
  }

  if (handlers.onCommented) {
    activeSocket.on('post:commented', handlers.onCommented);
  }

  if (handlers.onHidden) {
    activeSocket.on('post:hidden', handlers.onHidden);
  }

  return () => {
    if (handlers.onCreated) {
      activeSocket.off('post:created', handlers.onCreated);
    }

    if (handlers.onUpdated) {
      activeSocket.off('post:updated', handlers.onUpdated);
    }

    if (handlers.onDeleted) {
      activeSocket.off('post:deleted', handlers.onDeleted);
    }

    if (handlers.onCommented) {
      activeSocket.off('post:commented', handlers.onCommented);
    }

    if (handlers.onHidden) {
      activeSocket.off('post:hidden', handlers.onHidden);
    }
  };
};
