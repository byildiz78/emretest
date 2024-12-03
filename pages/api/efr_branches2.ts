import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/db';
import { jwtVerify } from 'jose';

interface Branch {
    BranchID: number;
    BranchName: string;
    IsActive: boolean;
    CountryName: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

        const cookies = req.headers.cookie?.split(';').reduce((acc: { [key: string]: string }, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (!cookies || !cookies['access_token']) {
            return res.status(401).json({ error: 'No access token found' });
        }

        const decoded = await jwtVerify(
            cookies['access_token'],
            ACCESS_TOKEN_SECRET
        );

        const userId = decoded.payload.userId;
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID in token' });
        }

        const userIdNumber = parseInt(userId.toString());
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        console.log('User ID:', userIdNumber);

        const branches = await executeQuery<Branch>(`
            SELECT DISTINCT b.* 
            FROM Efr_Branchs b 
            WHERE b.IsActive = 1 
            AND b.CountryName = 'TÜRKİYE' 
            AND EXISTS (
                SELECT 1 
                FROM Efr_Users u 
                WHERE u.UserID = @userId
                AND u.IsActive = 1 
                AND (u.Category = 5 OR CHARINDEX(',' + CAST(b.BranchID AS VARCHAR) + ',', ',' + u.UserBranchs + ',') > 0)
            )
        `, {
            userId: userIdNumber
        });

        if (!branches || branches.length === 0) {
            return res.status(404).json({ error: 'No branches found for user' });
        }

        return res.status(200).json(branches);

    } catch (error: any) {
        console.error('Error in branches handler:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
