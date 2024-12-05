import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/dataset';
import { Efr_Branches } from '@/types/tables';
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

        if (cookies) {
            const accessToken = cookies['access_token'];
            const decoded = await jwtVerify(
                accessToken,
                ACCESS_TOKEN_SECRET
            );

            // Token payload'ından branches'i al
            const userBranches = decoded.payload.userBranches;

            if (!userBranches) {
                return res.status(400).json({ error: 'No branches found in token' });
            }

            const query = `
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
            `;  
            const result = await executeQuery<Efr_Branches[]>({
                query,
                parameters: {
                    userId: 1297
                }
            });
            if (!result || result.length === 0) {
                return res.status(404).json({ error: 'No branches found for user' });
            }
            return res.status(200).json(result);

        }

        return res.status(400).json("");

    } catch (error: any) {
        console.error('Error in branches handler:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
