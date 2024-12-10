import { NextApiRequest, NextApiResponse } from 'next';
import { ChatBot } from '@/types/tables';
import { Dataset } from '@/pages/api/dataset';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const instance = Dataset.getInstance();

        const query = `SELECT ChatBotID, AnalysisTitle, Icon FROM dm_ChatBot WHERE ChatBotID NOT IN('999')`;
        const result = await instance.executeQuery<ChatBot[]>({
            query,
            req
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
