import { NextApiRequest, NextApiResponse } from 'next';
import sql, { config as SQLConfig } from 'mssql';

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
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query("SELECT AutoID,ReportName,ReportID,ReportIndex,ReportIcon,V1Type,V2Type,V3Type,V4Type,V5Type,V6Type,IsActive,ReportColor FROM dm_webWidgets6 WHERE IsActive=1 AND ReportID NOT IN(522) ORDER BY ReportIndex ASC");
        
        await pool.close();

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
