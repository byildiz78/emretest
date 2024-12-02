import { NextApiRequest, NextApiResponse } from 'next';
import sql, { config as SQLConfig } from 'mssql';

// SQL Server configuration
const config: SQLConfig = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || '',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

interface WebWidgetData {
    reportValue1: string;
    reportValue2: string;
    reportValue3: string;
    reportValue4: string;
    reportValue5: string;
    reportValue6: string;
}

interface QueryResult {
    ReportID: number;
    ReportQuery: string;
    ReportQuery2: string;
}

interface QueryResultWithData {
    reportId: number;
    data: WebWidgetData;
}

// Clean and validate SQL query
function cleanSqlQuery(query: string): string {
    if (!query) return '';
    
    // Remove comments and normalize whitespace
    let cleaned = query
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
        .replace(/--.*$/gm, '')            // Remove single-line comments
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim();
    
    // Remove trailing semicolon
    if (cleaned.endsWith(';')) {
        cleaned = cleaned.slice(0, -1);
    }
    
    return cleaned;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let pool: sql.ConnectionPool | null = null;

    try {
        const { date1, date2, reportId, branches } = req.body;

        console.log('Request params:', { date1, date2, reportId, branches });

        // Connect to database
        pool = await sql.connect(config);

        // Get widget queries
        const baseQuery = `
            SELECT ReportID, ReportQuery, ReportQuery2
            FROM dm_webWidgets6
            WHERE ReportID IN (${reportId.map(id => parseInt(id)).join(',')})
            AND IsActive = 1
            AND (ReportQuery != '' OR ReportQuery2 != '')
            ORDER BY ReportIndex ASC`;

        console.log('Base Query:', baseQuery);
        const widgetResults = await pool.request().query(baseQuery);

        if (!widgetResults.recordset || widgetResults.recordset.length === 0) {
            console.log('No widget queries found');
            return res.status(400).json({ error: 'No data returned from query' });
        }

        console.log('Found widget queries:', widgetResults.recordset.length);

        // Process each widget query
        const queryPromises = widgetResults.recordset.map(async (item: QueryResult) => {
            console.log('\n--- Processing ReportID:', item.ReportID, '---');
            
            // Convert branch IDs to integers
            const branchIds = Array.isArray(branches) 
                ? branches.map(id => parseInt(id))
                : [parseInt(branches)];
            
            const branchesString = branchIds.join(',');
            
            let reportQuery1 = cleanSqlQuery(item.ReportQuery.toString());
            
            if (!reportQuery1) {
                console.log('Empty query for ReportID:', item.ReportID);
                return null;
            }

            console.log('Clean Query:', reportQuery1);
            console.log('Branch IDs:', branchIds);

            try {
                const request = pool!.request();
                
                // Set parameters
                const date1Obj = new Date(date1);
                const date2Obj = new Date(date2);
                date1Obj.setHours(6, 0, 0, 0);
                date2Obj.setHours(6, 0, 0, 0);
                
                request.input('date1', sql.DateTime, date1Obj);
                request.input('date2', sql.DateTime, date2Obj);
                request.input('BranchID', sql.VarChar, branchesString);

                console.log('Parameters:', {
                    date1: date1Obj,
                    date2: date2Obj,
                    BranchID: branchesString
                });

                const queryResult = await request.query(reportQuery1);

                if (!queryResult.recordset || queryResult.recordset.length === 0) {
                    console.log('No results for ReportID:', item.ReportID);
                    return null;
                }

                console.log('Success for ReportID:', item.ReportID, 'Data:', queryResult.recordset[0]);
                return {
                    reportId: item.ReportID,
                    data: queryResult.recordset[0] as WebWidgetData
                };
            } catch (queryError) {
                console.error('Query Error for ReportID:', item.ReportID);
                console.error('Query:', reportQuery1);
                console.error('Error:', queryError);
                return null;
            }
        });

        const results = (await Promise.all(queryPromises)).filter((item): item is QueryResultWithData =>
            item !== null
        );

        console.log('Total successful queries:', results.length);

        if (results.length === 0) {
            return res.status(400).json({ error: 'No valid results found' });
        }

        // Format response
        const formattedResults = results.map(item => ({
            ReportID: item.reportId,
            reportValue1: item.data.reportValue1,
            reportValue2: item.data.reportValue2,
            reportValue3: item.data.reportValue3,
            reportValue4: item.data.reportValue4,
            reportValue5: item.data.reportValue5,
            reportValue6: item.data.reportValue6
        }));

        return res.status(200).json(formattedResults);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}
