import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinTicketRoom: (ticketId: string) => void;
  sendMessage: (ticketId: string, text: string) => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useUser();
  const SOCKET_URL = 'https://api.shillette.com';

  useEffect(() => {
    // Only connect if user is logged in
    if (user.logged_in && !socket) {
      connectSocket();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user.logged_in]);

  const connectSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);
  };

  const joinTicketRoom = (ticketId: string) => {
    if (socket && connected) {
      socket.emit('join_ticket_room', { ticket_id: ticketId });
    } else {
      console.warn('Socket not connected when trying to join room');
    }
  };

  const sendMessage = (ticketId: string, text: string) => {
    if (socket && connected && text.trim()) {
      socket.emit('send_message', { ticket_id: ticketId, text });
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinTicketRoom, sendMessage, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}