import { io, Socket } from 'socket.io-client';

import { API_ORIGIN } from '@/services/api';
import type { StoryItem } from '@/types/auth';

type StoryEventHandlers = {
  onCreated?: (story: StoryItem) => void;
  onUpdated?: (story: StoryItem) => void;
  onDeleted?: (payload: { story_id: number; user_id: number }) => void;
  onExpired?: (payload: { count: number }) => void;
};

let socket: Socket | null = null;

const getStorySocket = () => {
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

export const subscribeToStoryEvents = (handlers: StoryEventHandlers) => {
  const activeSocket = getStorySocket();

  if (handlers.onCreated) {
    activeSocket.on('story:created', handlers.onCreated);
  }

  if (handlers.onUpdated) {
    activeSocket.on('story:updated', handlers.onUpdated);
  }

  if (handlers.onDeleted) {
    activeSocket.on('story:deleted', handlers.onDeleted);
  }

  if (handlers.onExpired) {
    activeSocket.on('story:expired', handlers.onExpired);
  }

  return () => {
    if (handlers.onCreated) {
      activeSocket.off('story:created', handlers.onCreated);
    }

    if (handlers.onUpdated) {
      activeSocket.off('story:updated', handlers.onUpdated);
    }

    if (handlers.onDeleted) {
      activeSocket.off('story:deleted', handlers.onDeleted);
    }

    if (handlers.onExpired) {
      activeSocket.off('story:expired', handlers.onExpired);
    }
  };
};
