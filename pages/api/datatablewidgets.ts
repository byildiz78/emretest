import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { WebWidget } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
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
                    ReportColor,
                    ReportType 
                FROM dm_webWidgets7 
                WHERE IsActive = 1 
                AND ReportID NOT IN (522)
                AND BranchDetail = '1' 
                AND ReportType = 'datatable'
                ORDER BY ReportIndex ASC
            `;
            const instance = Dataset.getInstance();

            const result = await instance.executeQuery<WebWidget[]>({
                query,
                req
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching datatable widgets:', error);
            res.status(500).json({ error: 'Failed to fetch datatable widgets' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
