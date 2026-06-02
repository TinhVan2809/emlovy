import { io, Socket } from 'socket.io-client';

import { API_ORIGIN } from '@/services/api';
import type { Reel } from '@/types/auth';

type ReelEventHandlers = {
  onCreated?: (reel: Reel) => void;
  onLiked?: (payload: { post_id: number; liked_by_me: boolean; like_count: number }) => void;
  onCommented?: (payload: { post_id: number; comment_count: number; comment?: any }) => void;
  onDeleted?: (payload: { post_id: number }) => void;
};

let socket: Socket | null = null;

const getReelSocket = () => {
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

export const subscribeToReelEvents = (handlers: ReelEventHandlers) => {
  const activeSocket = getReelSocket();

  if (handlers.onCreated) {
    activeSocket.on('reel:created', handlers.onCreated);
  }

  if (handlers.onLiked) {
    activeSocket.on('reel:liked', handlers.onLiked);
  }

  if (handlers.onCommented) {
    activeSocket.on('reel:commented', handlers.onCommented);
  }

  if (handlers.onDeleted) {
    activeSocket.on('reel:deleted', handlers.onDeleted);
  }

  return () => {
    if (handlers.onCreated) {
      activeSocket.off('reel:created', handlers.onCreated);
    }

    if (handlers.onLiked) {
      activeSocket.off('reel:liked', handlers.onLiked);
    }

    if (handlers.onCommented) {
      activeSocket.off('reel:commented', handlers.onCommented);
    }

    if (handlers.onDeleted) {
      activeSocket.off('reel:deleted', handlers.onDeleted);
    }
  };
};
