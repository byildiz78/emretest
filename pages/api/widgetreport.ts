import { NextApiRequest, NextApiResponse } from 'next';
import { executeSingleQuery } from '@/lib/db';
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
        const widget = await executeSingleQuery<{ ReportQuery: string }>(`
            SELECT TOP 1 ReportID, ReportQuery, ReportQuery2
            FROM dm_webWidgets6
            WHERE ReportID = @reportId
            AND IsActive = 1
            AND (ReportQuery != '' OR ReportQuery2 != '')
            ORDER BY ReportIndex ASC
        `, { 
            reportId: reportIdNumber
        });

        if (!widget) {
            return res.status(400).json({ error: 'No widget query found' });
        }

        const branchIds = Array.isArray(branches) 
            ? branches.map(id => parseInt(id))
            : [parseInt(branches)];
        
        const branchesString = branchIds.join(',');
        let reportQuery = cleanSqlQuery(widget.ReportQuery.toString());
        
        if (!reportQuery) {
            return res.status(400).json({ error: 'Empty widget query' });
        }

        try {
            const date1Obj = new Date(date1);
            const date2Obj = new Date(date2);
            date1Obj.setHours(6, 0, 0, 0);
            date2Obj.setHours(6, 0, 0, 0);

            reportQuery = reportQuery
                .replace(/'{{(\s*)date1(\s*)}}'/g, '@date1')
                .replace(/'{{(\s*)date2(\s*)}}'/g, '@date2')
                .replace(/{{(\s*)branches(\s*)}}/g, branchesString)
                .replace(/@BranchID/g, `BranchID IN(${branchesString})`);

            const result = await executeSingleQuery<WebWidgetData>(reportQuery, {
                date1: date1Obj,
                date2: date2Obj
            });

            if (!result) {
                return res.status(404).json({ error: 'No data found for widget' });
            }

            return res.status(200).json(result);
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
