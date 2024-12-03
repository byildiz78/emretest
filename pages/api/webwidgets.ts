import { NextApiRequest, NextApiResponse } from 'next';
import { execute } from '@/lib/serkanset';
import { WebWidget } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const query = `
            SELECT 
                AutoID,
                ReportName,
                ReportID,
                ReportIndex,
                ReportIcon,
                V1Type,
                V2Type,
                V3Type,
                V4Type,
                V5Type,
                V6Type,
                IsActive,
                ReportColor 
            FROM dm_webWidgets6 
            WHERE IsActive = 1 
            AND ReportID NOT IN (522) 
            ORDER BY ReportIndex ASC
        `;

        const result = await execute({
            databaseId: "3",
            query: query,
            parameters: {}
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No widgets found' });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
