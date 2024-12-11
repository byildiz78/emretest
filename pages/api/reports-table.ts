import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { WebReport } from '@/types/tables';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';
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

        const reportQuery = `SELECT ReportQuery FROM dm_infiniaWebReports WHERE ReportID = @reportId`;
        const instance = Dataset.getInstance();

        const date1Parsed = parseISO(date1);
        const date2Parsed = parseISO(date2);

        const date1Formatted = formatInTimeZone(date1Parsed, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const date2Formatted = formatInTimeZone(date2Parsed, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

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
                date1: date1Formatted,
                date2: date2Formatted,
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
