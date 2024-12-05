import { executeQuery } from '@/lib/dataset';
import { ProjectSettings } from '@/types/tables';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ProjectSettings | ProjectSettings[] | { error: string }>
) {

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const query = "SELECT * FROM ProjectSettings";


        const result = await executeQuery<ProjectSettings[]>({
            query,
            parameters: {}
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in users handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error'
        });
    }
}