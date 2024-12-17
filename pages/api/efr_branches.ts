import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { Efr_Branches } from '@/types/tables';
import { jwtVerify } from 'jose';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let tenantId = '';
        if (req.headers.referer) {
            try {
                tenantId = new URL(req.headers.referer).pathname.split('/')[1];
            } catch (error) {
                console.error('Error parsing referer:', error);
            }
        }
        const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

        const cookies = req.headers.cookie?.split(';').reduce((acc: { [key: string]: string }, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (cookies) {
            const accessToken = cookies[`${tenantId}_access_token`];
            const decoded = await jwtVerify(
                accessToken,
                ACCESS_TOKEN_SECRET
            );

            // Token payload'ından branches'i al
            const userId = decoded.payload.userId?.toString();

            if (!userId) {
                return res.status(400).json({ error: 'No userId found in token' });
            }

            const query = `
                SELECT DISTINCT b.* 
                FROM Efr_Branchs b 
                WHERE b.IsActive = 1 
                --AND b.CountryName = 'TÜRKİYE' 
                AND EXISTS (
                    SELECT 1 
                    FROM Efr_Users u 
                    WHERE u.UserID = @userId
                    AND u.IsActive = 1 
                    AND (u.Category = 5 OR CHARINDEX(',' + CAST(b.BranchID AS VARCHAR) + ',', ',' + u.UserBranchs + ',') > 0)
                )
            `;  
            const instance = Dataset.getInstance();

            const result = await instance.executeQuery<Efr_Branches[]>({
                query,
                parameters: {
                    userId
                },
                req
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
