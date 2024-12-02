
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './superset';
import { WebWidget } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = "SELECT AutoID,ReportName,ReportID,ReportIndex,ReportIcon,V1Type,V2Type,V3Type,V4Type,V5Type,V6Type,IsActive,ReportColor FROM dm_webWidgets6 WHERE IsActive=1 AND ReportID NOT IN(522) ORDER BY ReportIndex ASC";
        const response = await db.query<WebWidget[]>(sql)

        if (response.data == null) {
            return res.status(400).json(response.error);
        }

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}