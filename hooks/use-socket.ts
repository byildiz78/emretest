'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

const SOCKETIO_HOST =   'http://localhost';
const SOCKETIO_PORT = process.env.NEXT_PUBLIC_SOCKETIO_SERVER_PORT || '2323';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const params = useParams();
    const tenantId = params.tenantId as string;
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socketRef.current && tenantId) {
            socketRef.current = io(`${SOCKETIO_HOST}:${SOCKETIO_PORT}`, {
                query: { tenantId },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 10000
            });

            socketRef.current.on('connect', () => {
                // Send login event with tenantId as userId
                socketRef.current?.emit('user-login', tenantId);
                setIsConnected(true);
            });

            socketRef.current.on('login-success', (data) => {
            });

            socketRef.current.on('disconnect', (reason) => {
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                setIsConnected(false);
            });

            // Add a catch-all event listener for debugging
            socketRef.current.onAny((eventName, ...args) => {
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [tenantId]);

    return { socket: socketRef.current, isConnected };
};