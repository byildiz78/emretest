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
    const { branches } = req.body;

console.log(branches)
    try {

        const query = `
       WITH RankedData AS (
    -- Cancel ve Discount kayıtları
    SELECT DISTINCT
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM OrderTransactions t WITH (NOLOCK)
                WHERE t.OrderKey = h.OrderKey 
                AND t.LineDeleted = 1
            ) THEN (
                SELECT SUM(t.ExtendedPrice)
                FROM OrderTransactions t WITH (NOLOCK)
                WHERE t.OrderKey = h.OrderKey 
                AND t.LineDeleted = 1
            )
            WHEN h.LineDeleted = 1 THEN h.AmountDue
            ELSE 0
        END as Tutar,
        'cancel' as type,
        1 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'İptal' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.@BranchID
    AND (
        h.LineDeleted = 1 
        OR EXISTS (
            SELECT 1 
            FROM OrderTransactions t WITH (NOLOCK)
            WHERE t.OrderKey = h.OrderKey 
            AND t.LineDeleted = 1
        )
    )

    UNION ALL

    SELECT DISTINCT
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        h.DiscountTotalAmount as Tutar,
        'discount' as type,
        1 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'İndirim' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.@BranchID
    AND h.LineDeleted = 0
    AND h.DiscountTotalAmount > 0

    UNION ALL

    SELECT DISTINCT
        h.AutoID,
        h.OrderKey,
        h.BranchID,
        h.OrderDateTime,
        h.AmountDue as Tutar,
        'sale' as type,
        2 as TurSirasi,
        ROW_NUMBER() OVER (PARTITION BY 'Satış' ORDER BY h.OrderDateTime DESC) as RowNum
    FROM OrderHeaders h WITH (NOLOCK)
    WHERE h.@BranchID
    AND h.LineDeleted = 0
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
    -- İlk 10 cancel/discount
    SELECT TOP 10 *
    FROM RankedData
    WHERE TurSirasi = 1 AND RowNum <= 10
    ORDER BY OrderDateTime DESC

    UNION ALL

    -- İlk 10 sale
    SELECT TOP 10 *
    FROM RankedData
    WHERE TurSirasi = 2 AND RowNum <= 10
    ORDER BY OrderDateTime DESC
) rd
LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = rd.BranchID
ORDER BY rd.TurSirasi, rd.OrderDateTime DESC;
        `;

        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<Notification[]>({

            query,
            parameters:{
                BranchID: branches
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

