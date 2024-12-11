import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '../dataset';
import { ExpoTokens } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { UserID, title, message, sound, priority } = req.body;
        
        const query = `
            SELECT ExpoToken
            FROM dm_ExpoTokens
            WHERE dm_ExpoTokens.@UserID
        `;

        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<ExpoTokens[]>({
            query,
            parameters :{
                UserID
            },
            req
        });


        const notificationPromises = result.map(async (record) => {
            if (!record.ExpoToken) return null;

            return fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: record.ExpoToken,
                    title,
                    body: message,
                    sound: sound || 'default',
                    priority: priority || 'high',
                }),
            });
        });

        const responses = await Promise.all(notificationPromises);
        const results = await Promise.all(responses.map(r => r ? r.json() : null));

        return res.status(200).json({ 
            success: true, 
            data: results.filter(r => r !== null)
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error sending notification'
        });
    }
}