import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}

export function useProgress(socket, recordingId) {
  const [progress, setProgress] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    audioPath: null
  });

  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data) => {
      if (data.recordingId === recordingId) {
        setProgress(data);
      }
    };

    socket.on('progress', handleProgress);

    return () => {
      socket.off('progress', handleProgress);
    };
  }, [socket, recordingId]);

  return progress;
}
