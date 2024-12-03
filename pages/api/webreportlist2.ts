import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/db';
import { WebReportGroup } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const reports = await executeQuery<WebReportGroup>(`
            SELECT
                g.AutoID as GroupAutoID,
                g.GroupName as GroupName,
                i.AutoID as ReportAutoID,
                i.ReportID as ReportID,
                i.ReportName as ReportName,
                g.SecurityLevel as GroupSecurityLevel,
                g.SecurityLevel as ReportSecurityLevel,
                g.DisplayOrderID as GroupDisplayOrderID,
                i.DisplayOrderID as ReportDisplayOrderID,
                g.Svg as GroupIcon
            FROM infiniaWebReportGroups2 g WITH (NOLOCK)
            INNER JOIN infiniaWebReports AS i WITH (NOLOCK) ON i.GroupID = g.AutoID 
            WHERE i.ShowDesktop = 1 
            ORDER BY g.DisplayOrderID, i.DisplayOrderID
        `);

        if (!reports || reports.length === 0) {
            return res.status(404).json({ error: 'No reports found' });
        }

        return res.status(200).json(reports);
    } catch (error: any) {
        console.error('Error in web report list handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}