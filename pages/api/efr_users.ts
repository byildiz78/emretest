import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/db';
import { Efr_Users } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const users = await executeQuery<Efr_Users>(`
            SELECT 
                UserID, 
                UserName, 
                UserBranchs 
            FROM Efr_users 
            WHERE IsActive = 1
        `);

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        return res.status(200).json(users);
    } catch (error: any) {
        console.error('Error in users handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
