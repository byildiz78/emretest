import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/pages/api/superset';
import { formatDateTimeYMDHIS } from '@/lib/utils';
import { WebWidgetData } from '@/types/tables';

interface QueryResult {
    ReportID: string;
    ReportQuery: string;
    ReportQuery2: string;
}

interface QueryResultWithData {
    reportId: string;
    data: WebWidgetData;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date1, date2, reportId, branches } = req.body;

    try {
        const sql = "SELECT ReportID,ReportQuery,ReportQuery2 FROM dm_webWidgets6 WHERE ReportID IN ({{ reportId }}) AND IsActive=1 AND (ReportQuery != '' OR ReportQuery2 != '') ORDER BY ReportIndex ASC";

        const response = await db.query<QueryResult[]>(sql, { templateParams: JSON.stringify({ reportId: reportId.join(",") }) });

        if (!response.data) {
            return res.status(400).json({ error: 'No data returned from query' });
        }

        const queryPromises = response.data.map(async (item: QueryResult) => {
            const branchesString = Array.isArray(branches) ? branches.join(",") : branches;
            const reportQuery1 = item.ReportQuery.toString()
                .replaceAll(";", "")
                .replaceAll("@date1", "'{{date1}}'")
                .replaceAll("@date2", "'{{date2}}'")
                .replaceAll("@BranchID", "BranchID IN({{branches}})");

            const date1Obj = new Date(date1);
            const date2Obj = new Date(date2);

            date1Obj.setHours(6, 0, 0, 0);
            date2Obj.setHours(6, 0, 0, 0);

            const d1 = formatDateTimeYMDHIS(date1Obj);
            const d2 = formatDateTimeYMDHIS(date2Obj);

            if (reportQuery1 !== '' && reportQuery1 !== null) {
                const queryResult = await db.query<WebWidgetData[]>(reportQuery1, {
                    templateParams: JSON.stringify({
                        date1: d1,
                        date2: d2,
                        branches: branchesString
                    })
                });

                if (!queryResult.data || queryResult.data.length === 0) {
                    return null;
                }

                return {
                    reportId: item.ReportID,
                    data: queryResult.data[0]
                };
            }
            return null;
        });

        const results = (await Promise.all(queryPromises)).filter((item): item is QueryResultWithData => 
            item !== null && item !== undefined
        );

        if (results.length === 0) {
            return res.status(400).json({ error: 'No valid results found' });
        }

        return res.status(200).json(results.map((item: QueryResultWithData) => ({
            ReportID: item.reportId,
            reportValue1: item.data.reportValue1,
            reportValue2: item.data.reportValue2,
            reportValue3: item.data.reportValue3,
            reportValue4: item.data.reportValue4,
            reportValue5: item.data.reportValue5,
            reportValue6: item.data.reportValue6
        })));
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
