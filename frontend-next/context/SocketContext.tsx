'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import port from '@/api/api';
import { AUTH_TOKEN_CHANGED_EVENT, readAuthToken } from '@/utils/authToken';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const syncAuthToken = () => setAuthToken(readAuthToken());

    syncAuthToken();
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthToken);
    window.addEventListener('storage', syncAuthToken);

    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthToken);
      window.removeEventListener('storage', syncAuthToken);
    };
  }, []);

  useEffect(() => {
    if (authToken === null) {
      return;
    }

    const socketInstance = io(port, {
      withCredentials: true,
      transports: ['websocket'],
      auth: authToken ? { token: authToken } : undefined,
    });

    socketInstance.on('connect', () => {
      setSocket(socketInstance);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [authToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
