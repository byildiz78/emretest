import { NextApiRequest, NextApiResponse } from 'next';
import { io } from 'socket.io-client';

const SOCKETIO_HOST = process.env.SOCKETIO_SERVER_HOST || 'http://localhost';
const SOCKETIO_PORT = process.env.SOCKETIO_SERVER_PORT || '2323';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }


    try {
        
        const { tenantId, userId, tabId, reportId, jobId } = req.query;

        if (!tenantId || !userId || !jobId || !tabId || !reportId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        let socket = io(`${SOCKETIO_HOST}:${SOCKETIO_PORT}`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 5000,
            query: { tenantId }
        });
        // Connect to socket.io server


        // Wait for socket connection
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Socket connection timeout'));
            }, 5000);

            socket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });

            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        // Emit job completion event
        socket.emit('bigquery-job-complete', {
            tenantId: tenantId.toString(),
            userId: userId.toString(),
            jobId: jobId.toString(),
            tabId: tabId.toString(),
            reportId: reportId.toString(),
            status: 'completed'
        });

        // Wait a bit to ensure event is sent
        await new Promise(resolve => setTimeout(resolve, 100));



        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    } 
}