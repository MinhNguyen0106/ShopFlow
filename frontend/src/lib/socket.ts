import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('shopflow_access_token')
        : '');

    socket = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  } else if (token) {
    socket.auth = { token };
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
