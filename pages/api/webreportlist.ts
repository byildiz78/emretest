import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { RawReportData, WebReport, WebReportGroup } from '@/types/tables';

interface QueryResult {
    GroupAutoID: number;
    GroupName?: string;
    GroupDisplayOrderID?: number;
    GroupSecurityLevel?: number;
    GroupIcon?: string;
    AutoID: number;
    ReportID: number;
    GroupID: number;
    ReportName?: string;
    ReportType?: number;
    DisplayOrderID?: number;
    SecurityLevel?: number;
    ReportIcon?: string;
}

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
                g.AutoID as GroupAutoID,
                g.GroupName,
                g.DisplayOrderID as GroupDisplayOrderID,
                g.SecurityLevel as GroupSecurityLevel,
                g.Icon as GroupIcon,
                i.AutoID,
                i.ReportID,
                i.GroupID,
                i.ReportName,
                i.ReportType,
                i.DisplayOrderID,
                i.SecurityLevel,
                i.ReportIcon
            FROM dm_infiniaWebReportGroups2 g WITH (NOLOCK)
            INNER JOIN dm_infiniaWebReports AS i WITH (NOLOCK) ON i.GroupID = g.AutoID 
            WHERE i.ShowDesktop = 1 
            ORDER BY g.DisplayOrderID, i.DisplayOrderID
        `;
        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<QueryResult[]>({
            query,
            req
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No reports found' });
        }

        // Group the results by GroupAutoID
        const groupedReports = result.reduce((acc, item) => {
            if (!acc[item.GroupAutoID]) {
                const group: WebReportGroup = {
                    GroupAutoID: item.GroupAutoID,
                    GroupName: item.GroupName,
                    GroupDisplayOrderID: item.GroupDisplayOrderID,
                    GroupSecurityLevel: item.GroupSecurityLevel,
                    GroupIcon: item.GroupIcon
                };

                acc[item.GroupAutoID] = {
                    Group: group,
                    Reports: []
                };
            }

            const report: WebReport = {
                AutoID: item.AutoID,
                ReportID: item.ReportID,
                GroupID: item.GroupID,
                ReportName: item.ReportName,
                ReportType: item.ReportType,
                DisplayOrderID: item.DisplayOrderID,
                SecurityLevel: item.SecurityLevel,
                ReportIcon: item.ReportIcon
            };

            acc[item.GroupAutoID].Reports.push(report);
            return acc;
        }, {} as Record<number, RawReportData>);

        return res.status(200).json(Object.values(groupedReports));
    } catch (error: any) {
        console.error('Error in web report list handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
