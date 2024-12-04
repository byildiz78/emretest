import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/dataset';
import { ChatBot } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const query = `SELECT ChatBotID, AnalysisTitle, Icon FROM dm_ChatBot`;
        const result = await executeQuery<ChatBot[]>({
            query
        });

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in web report list handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
