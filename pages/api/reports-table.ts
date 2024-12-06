import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { formatDateTimeYMDHI } from '@/lib/utils';
import { WebReport } from '@/types/tables';

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

        const reportQuery = `SELECT ReportQuery FROM dm_infiniaWebReports WHERE ReportID = @reportId`;
        const instance = Dataset.getInstance();
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);
        date1Obj.setHours(6, 0, 0, 0);
        date2Obj.setHours(6, 0, 0, 0);
        const reportQueryResult = await instance.executeQuery<WebReport[]>({
            query: reportQuery,
            parameters: {
                reportId
            },
            req
        });
       
        const query = reportQueryResult[0].ReportQuery?.toString();


        if (!query) {
            return res.status(400).json({ error: 'No widget query found' });
        }


        const queryResult = await instance.executeQuery<WebReport[]>({
            query,
            parameters: {
                date1: formatDateTimeYMDHI(date1Obj),
                date2: formatDateTimeYMDHI(date2Obj),
                BranchID: branches
            },
            req
        });

        return res.status(200).json(queryResult);
    } catch (error: any) {
        console.error('Error in widget report handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
