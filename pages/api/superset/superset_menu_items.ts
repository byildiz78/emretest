import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { SupersetDashboard } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const instance = Dataset.getInstance();

        const query = `SELECT * FROM dm_supersetDashboard`;
        const result = await instance.executeQuery<(Omit<SupersetDashboard, 'ExtraParams'> & { ExtraParams: string })[]>({
            query,
            req
        });

        const parsedResult = result.map(item => ({
            ...item,
            ExtraParams: item.ExtraParams ? JSON.parse(item.ExtraParams) as Record<string, string> : {}
        }));

        return res.status(200).json(parsedResult);
    } catch (error: any) {
        console.error('Error in web report list handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
