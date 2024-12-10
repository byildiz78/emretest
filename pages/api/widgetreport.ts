import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { WebWidget, WebWidgetData } from '@/types/tables';
import { toZonedTime } from 'date-fns-tz';
const timeZone = 'Europe/Istanbul';
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
            FROM dm_webWidgets7
            WHERE ReportID = @reportId
            AND IsActive = 1
            AND (ReportQuery != '' OR ReportQuery2 != '')
            ORDER BY ReportIndex ASC
        `;
        const instance = Dataset.getInstance();

        const response = await instance.executeQuery<WebWidget[]>({
            query: widgetQuery,
            parameters: {
                reportId: reportIdNumber
            },
            req
        });
        const widget = response[0];
        if (!widget) {
            return res.status(400).json({ error: 'No widget query found' });
        }

        try {
            const date1Obj = toZonedTime(new Date(date1), timeZone);
            const date2Obj = toZonedTime(new Date(date2), timeZone);

            const result = await instance.executeQuery<WebWidgetData[]>({
                query: widget.ReportQuery?.toString() + "",
                parameters: {
                    date1: date1Obj.toISOString(),
                    date2: date2Obj.toISOString(),
                    BranchID: branches
                },
                req
            });
            if (!result ) {
                return res.status(404).json({ error: 'No data found for widget' });
            }

            return res.status(200).json(result);

        } catch (error: any) {
            console.error('Error executing widget query:', error);
            return res.status(500).json({
                error: 'Error executing widget query',
                details: error.message
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
