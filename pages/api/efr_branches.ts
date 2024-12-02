import { NextApiRequest, NextApiResponse } from 'next';
import sql, { config as SQLConfig } from 'mssql';
import { jwtVerify } from 'jose';

const config: SQLConfig = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || '',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

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

        console.log('User ID:', userId);

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.NVarChar, userId.toString())
            .query(`
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
            `);

        await pool.close();
        return res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
