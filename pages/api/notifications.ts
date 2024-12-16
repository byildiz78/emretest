import { NextApiRequest, NextApiResponse } from 'next';

import { Dataset } from '@/pages/api/dataset';

interface Notification {
    autoId: number;
    logKey: string;
    branchId: number;
    orderDateTime: string;
    orderKey: string;
    userName: string;
    voidAmount: number;
    discountAmount: number;
    amountDue: number;
    deliveryTime: string;
    logTitle: string;
    logDetail: string;
    addDateTime: string;
    deviceSended: boolean;
    branchName: string;
    type: 'sale' | 'discount' | 'cancel' | 'alert';
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { branches, minCancelAmount, minDiscountAmount, minSaleAmount } = req.body;

    console.log(branches)
    try {
        const query = `
WITH RankedData AS (
    -- Cancel işlemleri
    SELECT 
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        COALESCE(
            (SELECT SUM(t.ExtendedPrice)
             FROM OrderTransactions t WITH (NOLOCK)
             WHERE t.OrderKey = h.OrderKey 
             AND t.LineDeleted = 1),
            CASE WHEN h.LineDeleted = 1 THEN h.AmountDue ELSE 0 END
        ) as Tutar,
        'cancel' as type,
        1 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'cancel' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.BranchID IN (${branches})
    AND (h.LineDeleted = 1 OR EXISTS (
        SELECT 1 
        FROM OrderTransactions t WITH (NOLOCK)
        WHERE t.OrderKey = h.OrderKey 
        AND t.LineDeleted = 1
    ))
    AND (@MinCancelAmount IS NULL OR @MinCancelAmount <= 0 OR 
        COALESCE(
            (SELECT SUM(t.ExtendedPrice)
             FROM OrderTransactions t WITH (NOLOCK)
             WHERE t.OrderKey = h.OrderKey 
             AND t.LineDeleted = 1),
            CASE WHEN h.LineDeleted = 1 THEN h.AmountDue ELSE 0 END
        ) >= @MinCancelAmount)

    UNION ALL

    -- Discount işlemleri
    SELECT 
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        h.DiscountTotalAmount as Tutar,
        'discount' as type,
        2 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'discount' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.BranchID IN (${branches})
    AND h.DiscountTotalAmount > 0
    AND (@MinDiscountAmount IS NULL OR @MinDiscountAmount <= 0 OR h.DiscountTotalAmount >= @MinDiscountAmount)

    UNION ALL

    -- Sale işlemleri
    SELECT 
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        h.AmountDue as Tutar,
        'sale' as type,
        3 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'sale' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.BranchID IN (${branches})
    AND (@MinSaleAmount IS NULL OR @MinSaleAmount <= 0 OR h.AmountDue >= @MinSaleAmount)
)
SELECT 
    rd.AutoID as autoId,
    rd.OrderKey as orderKey,
    rd.BranchID as branchId,
    CONVERT(VARCHAR, rd.OrderDateTime, 120) as orderDateTime,
    rd.Tutar as amountDue,
    rd.type,
    br.BranchName as branchName
FROM (
    SELECT *
    FROM RankedData
    WHERE RowNum <= 7
) rd
LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = rd.BranchID
ORDER BY rd.TurSirasi, rd.OrderDateTime DESC;`;

        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<Notification[]>({
            query,
            parameters: {
                BranchID: branches,
                MinCancelAmount: minCancelAmount,
                MinDiscountAmount: minDiscountAmount,
                MinSaleAmount: minSaleAmount
            },
            req
        });

        return res.status(200).json(result);

    } catch (error: any) {
        console.error('Error in notifications handler:', error);

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
