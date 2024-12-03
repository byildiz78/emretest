import { NextApiRequest, NextApiResponse } from 'next';
import { execute } from '@/lib/serkanset';
import { WebWidgetData } from '@/types/tables';

// Clean and validate SQL query
function cleanSqlQuery(query: string): string {
    return query.replace(/^\s+|\s+$/g, '');
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { date1, date2, reportId, branches } = req.body;

        if (!date1 || !date2 || !reportId || !branches) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const reportIdNumber = parseInt(reportId);
        if (isNaN(reportIdNumber)) {
            return res.status(400).json({ error: 'Invalid report ID format' });
        }

        // Get widget query
        const widgetQuery = `
            SELECT TOP 1 ReportID, ReportQuery, ReportQuery2
            FROM dm_webWidgets6
            WHERE ReportID = @reportId
            AND IsActive = 1
            AND (ReportQuery != '' OR ReportQuery2 != '')
            ORDER BY ReportIndex ASC
        `;

        const widgetResult = await execute({
            databaseId: "3",
            query: widgetQuery,
            parameters: {
                reportId: reportIdNumber
            }
        });

        const widget = widgetResult.data[0];
        if (!widget) {
            return res.status(400).json({ error: 'No widget query found' });
        }
        
        let reportQuery = cleanSqlQuery(widget.ReportQuery.toString());
        
        if (!reportQuery) {
            return res.status(400).json({ error: 'Empty widget query' });
        }

        try {
            const date1Obj = new Date(date1);
            const date2Obj = new Date(date2);
            date1Obj.setHours(6, 0, 0, 0);
            date2Obj.setHours(6, 0, 0, 0);

            const result = await execute({
                databaseId: "3",
                query: reportQuery,
                parameters: {
                    date1: date1Obj.toISOString(),
                    date2: date2Obj.toISOString(),
                    BranchID: branches
                }
            });

            if (!result || result.length === 0) {
                return res.status(404).json({ error: 'No data found for widget' });
            }

            return res.status(200).json(result.data[0]); // Since we're using TOP 1 in the query

        } catch (error: any) {
            console.error('Error executing widget query:', error);
            return res.status(500).json({
                error: 'Error executing widget query',
                details: error.message,
                query: reportQuery
            });
        }
    } catch (error: any) {
        console.error('Error in widget report handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
