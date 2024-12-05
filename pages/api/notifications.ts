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

    if (req.method !== 'GET') {

        return res.status(405).json({ error: 'Method not allowed' });

    }


    try {

        const query = `

            SELECT TOP 10 * FROM (

    -- İlk olarak belirtilen OrderKey'lere sahip kayıtları al

    SELECT 

        row.AutoID as autoId,

        row.LogKey as logKey,

        row.BranchID as branchId,

        CONVERT(VARCHAR, row.OrderDateTime, 120) as orderDateTime,

        row.OrderKey as orderKey,

        row.UserName as userName,

        row.VoidAmount as voidAmount,

        row.DiscountAmount as discountAmount,

        row.AmountDue as amountDue,

        CONVERT(VARCHAR, row.DeliveryTime, 120) as deliveryTime,

        row.LogTitle as logTitle,

        row.LogDetail as logDetail,

        CONVERT(VARCHAR, row.AddDateTime, 120) as addDateTime,

        row.DeviceSended as deviceSended,

        br.BranchName as branchName,

        CASE 

            WHEN row.LogTitle = 'Çek Tutar' THEN 'sale'

            WHEN row.LogTitle LIKE '%İndirim%' THEN 'discount'

            WHEN row.LogTitle LIKE '%İptal%' THEN 'cancel'

            ELSE 'alert'

        END as type

    FROM dbo.infiniaActivityLogs AS row WITH (NOLOCK)

    LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = row.BranchID

    WHERE row.OrderKey IN ('73D9682F-4AD6-4E44-B4DA-65CEEC27988A','F6469277-353D-42BA-AE37-F771E12D5E05')


    UNION ALL


    -- Sonra diğer kayıtlardan top 8'i al

    SELECT TOP 8

        row.AutoID as autoId,

        row.LogKey as logKey,

        row.BranchID as branchId,

        CONVERT(VARCHAR, row.OrderDateTime, 120) as orderDateTime,

        row.OrderKey as orderKey,

        row.UserName as userName,

        row.VoidAmount as voidAmount,

        row.DiscountAmount as discountAmount,

        row.AmountDue as amountDue,

        CONVERT(VARCHAR, row.DeliveryTime, 120) as deliveryTime,

        row.LogTitle as logTitle,

        row.LogDetail as logDetail,

        CONVERT(VARCHAR, row.AddDateTime, 120) as addDateTime,

        row.DeviceSended as deviceSended,

        br.BranchName as branchName,

        CASE 

            WHEN row.LogTitle = 'Çek Tutar' THEN 'sale'

            WHEN row.LogTitle LIKE '%İndirim%' THEN 'discount'

            WHEN row.LogTitle LIKE '%İptal%' THEN 'cancel'

            ELSE 'alert'

        END as type

    FROM dbo.infiniaActivityLogs AS row WITH (NOLOCK)

    LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = row.BranchID

    WHERE row.OrderKey NOT IN ('73D9682F-4AD6-4E44-B4DA-65CEEC27988A','F6469277-353D-42BA-AE37-F771E12D5E05')

) AS combined

ORDER BY orderDateTime DESC

        `;

        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<Notification[]>({

            query,
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

