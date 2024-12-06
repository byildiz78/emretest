import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';
import { formatDateTimeYMDHI } from '@/lib/utils';

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

        const query = 
                `SELECT
                    br.Branchname AS [ŞUBE],
                    t.MenuItemText [ÜRÜN],
                        pp.ExternalCode [HARİCİ KOD],
                    t.MenumItemCategoryText [KATEGORİ],
                    t.MenuItemGroupText [GRUP],
                    SUM ( t.Quantity ) [MİKTAR],
                    ISNULL( NULLIF ( t.MenuItemUnitPrice, 0 ), ( t.ExtendedPrice / t.Quantity ) ) AS [BİRİM FİYAT],
                    ROUND( SUM ( t.ExtendedPrice * (h.AmountDue / ISNULL(NULLIF(h.SubTotal,0),1) ) ) ,2) AS [TUTAR]
                FROM
                    OrderTransactions AS t WITH (NOLOCK)
                    INNER JOIN OrderHeaders AS h WITH (NOLOCK) ON h.OrderKey = t.OrderKey
                    LEFT JOIN efr_Branchs br WITH (NOLOCK) ON t.BranchID = br.BranchID
                        LEFT JOIN posproducts pp ON pp.ProductKey=t.MenuItemKey
                WHERE
                    1=1
                    AND t.LineDeleted = 0
                    AND t.OrderDateTime BETWEEN @date1 AND @date2
                    AND t.@BranchID
                    AND t.Quantity > 0
                    AND h.LineDeleted= 0
                GROUP BY
                    t.MenuItemText,
                    t.MenumItemCategoryText,
                    t.MenuItemGroupText,
                    t.MenuItemUnitPrice,
                    isnull( NULLIF ( t.MenuItemUnitPrice, 0 ), ( t.ExtendedPrice/ t.Quantity ) ),
                    br.Branchname,
                        pp.ExternalCode
                ORDER BY
                    t.MenumItemCategoryText,
                    t.MenuItemText,
                    t.MenuItemUnitPrice DESC`;
        const instance = Dataset.getInstance();
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);
        date1Obj.setHours(6, 0, 0, 0);
        date2Obj.setHours(6, 0, 0, 0);
        const queryResult = await instance.executeQuery<any[]>({
            query,
            parameters: {
                reportId: reportIdNumber,
                date1: formatDateTimeYMDHI(date1Obj),
                date2: formatDateTimeYMDHI(date2Obj),
                BranchID: branches
            },
            req
        });
       
        if (!queryResult) {
            return res.status(400).json({ error: 'No widget query found' });
        }


        return res.status(200).json(queryResult);

    } catch (error: any) {
        console.error('Error in widget report handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
