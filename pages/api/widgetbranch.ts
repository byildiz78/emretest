import { NextApiRequest, NextApiResponse } from 'next';
import sql, { config as SQLConfig } from 'mssql';
import { formatDateTimeYMDHIS } from '@/lib/utils';

interface BranchModel {
    BranchID: number;
    reportValue1: string;    // SubeAdi
    reportValue2: number;    // TC (Cari dönem ciro)
    reportValue3: number;    // GHTC (Geçen hafta aynı saat ciro)
    reportValue4: number;    // GHTCTUM (Geçen hafta tüm gün ciro)
    reportValue5: number;    // KisiSayisi
    reportValue6: number;    // GHKisiSayisi
    reportValue7: number;    // GHKisiSayisiTUM
    reportValue8: number;    // Oran
    reportValue9: number;    // GecenHaftaOran
}

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date1, date2, branches } = req.body;

    try {
        const pool = await sql.connect(config);

        // Get report query
        const reportResult = await pool.request()
            .query("SELECT ReportID, ReportQuery, ReportQuery2 FROM dm_webWidgets6 WHERE ReportID = '522' AND IsActive=1 AND (ReportQuery != '' OR ReportQuery2 != '') ORDER BY ReportIndex ASC");

        if (!reportResult.recordset || reportResult.recordset.length === 0) {
            await pool.close();
            return res.status(400).json({
                error: 'No data returned from query',
                details: {
                    reportId: '522'
                }
            });
        }

        // Branch verilerini hazırla
        const branchesString = Array.isArray(branches) ? branches.join(",") : branches;
        console.log('Processing branches:', {
            count: Array.isArray(branches) ? branches.length : 1,
            sample: branchesString.substring(0, 100) + '...'
        });

        // Tarih formatlaması
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);
        date1Obj.setHours(6, 0, 0, 0);
        date2Obj.setHours(6, 0, 0, 0);
        const d1 = formatDateTimeYMDHIS(date1Obj);
        const d2 = formatDateTimeYMDHIS(date2Obj);

        // Ana sorguyu hazırla
        let reportQuery = reportResult.recordset[0].ReportQuery.toString()
            .replaceAll(";", "")
            .replaceAll("@date1", `'${d1}'`)
            .replaceAll("@date2", `'${d2}'`)
            .replaceAll("@BranchID", `BranchID IN(${branchesString})`);

        // BranchID syntax düzeltmesi
        reportQuery = reportQuery.replace("BranchID = BranchID IN(", "BranchID IN(");

        // Ana sorguyu çalıştır
        const queryResult = await pool.request().query(reportQuery);

        if (!queryResult.recordset || queryResult.recordset.length === 0) {
            await pool.close();
            return res.status(400).json({
                error: 'No branch data found',
                details: {
                    requestedBranches: branchesString
                }
            });
        }

        // Sonuçları formatla
        const formattedResults = queryResult.recordset.map((branch: BranchModel) => ({
            BranchID: Number(branch.BranchID) || 0,
            reportValue1: String(branch.reportValue1 || ''),    // SubeAdi
            reportValue2: Number(branch.reportValue2) || 0,    // TC (Cari dönem ciro)
            reportValue3: Number(branch.reportValue3) || 0,    // GHTC (Geçen hafta aynı saat ciro)
            reportValue4: Number(branch.reportValue4) || 0,    // GHTCTUM (Geçen hafta tüm gün ciro)
            reportValue5: Number(branch.reportValue5) || 0,    // KisiSayisi
            reportValue6: Number(branch.reportValue6) || 0,    // GHKisiSayisi
            reportValue7: Number(branch.reportValue7) || 0,    // GHKisiSayisiTUM
            reportValue8: Number(branch.reportValue8) || 0,    // Oran
            reportValue9: Number(branch.reportValue9) || 0     // GecenHaftaOran
        }));

        await pool.close();
        return res.status(200).json(formattedResults);

    } catch (error) {
        console.error('Error in widgetbranch API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }
        });
    }
}
