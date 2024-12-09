import { Dataset } from '@/pages/api/dataset';
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
        const query = "SELECT * FROM ProjectSettings WHERE Kod IN('daystart')";

        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<ProjectSettings[]>({
            query,
            req
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