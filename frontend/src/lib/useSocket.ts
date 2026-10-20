'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from './socket';
import { useAuthStore } from './auth.store';

export interface InboxItemPayload {
  conversationId: string;
  pageId: string;
  item: unknown;
}

export interface InboxUpdatedPayload {
  conversationId: string;
  pageId: string;
  changes: Record<string, unknown>;
}

export interface PostStatusChangedPayload {
  postId: string;
  status: 'publishing' | 'published' | 'failed';
  publishedAt?: string;
  errorMessage?: string;
}

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isAuthenticated, accessToken]);

  const joinPage = useCallback((pageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_page', pageId);
    }
  }, []);

  const leavePage = useCallback((pageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_page', pageId);
    }
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  const onNewInboxItem = useCallback(
    (callback: (data: InboxItemPayload) => void) => {
      const socket = socketRef.current;
      if (!socket) return () => {};
      socket.on('NEW_INBOX_ITEM', callback);
      return () => {
        socket.off('NEW_INBOX_ITEM', callback);
      };
    },
    []
  );

  const onInboxUpdated = useCallback(
    (callback: (data: InboxUpdatedPayload) => void) => {
      const socket = socketRef.current;
      if (!socket) return () => {};
      socket.on('INBOX_UPDATED', callback);
      return () => {
        socket.off('INBOX_UPDATED', callback);
      };
    },
    []
  );

  const onPostStatusChanged = useCallback(
    (callback: (data: PostStatusChangedPayload) => void) => {
      const socket = socketRef.current;
      if (!socket) return () => {};
      socket.on('POST_STATUS_CHANGED', callback);
      return () => {
        socket.off('POST_STATUS_CHANGED', callback);
      };
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    joinPage,
    leavePage,
    joinConversation,
    leaveConversation,
    onNewInboxItem,
    onInboxUpdated,
    onPostStatusChanged,
  };
}
