import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';

interface Notification {
   autoId: number;
   orderKey: string;
   branchId: number;
   orderDateTime: string;
   amountDue: number;
   type: 'sale' | 'discount' | 'cancel' | 'alert';
   branchName: string;
}

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
   }

   const { branches, minCancelAmount = 0, minDiscountAmount = 0, minSaleAmount = 0 } = req.body;
   try {
       const cancelQuery = `
       WITH CombinedCancels AS (
           -- Header Cancels
           SELECT 
               h.AutoID, h.OrderKey, h.BranchID,
               h.OrderDateTime as DateTimeField,
               h.AmountDue as Amount
           FROM OrderHeaders h WITH (NOLOCK)
           WHERE h.@BranchID 
           AND h.LineDeleted = 1
           AND h.OrderDateTime >= DATEADD(HOUR, -24, GETDATE())
           AND (@MinCancelAmount IS NULL OR @MinCancelAmount <= 0 OR h.AmountDue >= @MinCancelAmount)
           
           UNION ALL
           
           -- Transaction Cancels
           SELECT 
               h.AutoID, h.OrderKey, h.BranchID,
               t.OrderDateTime,
               SUM(t.ExtendedPrice)
           FROM OrderHeaders h WITH (NOLOCK)
           INNER JOIN OrderTransactions t WITH (NOLOCK) ON t.OrderKey = h.OrderKey
           WHERE h.@BranchID AND t.LineDeleted = 1 
           AND h.LineDeleted = 0
           AND t.OrderDateTime >= DATEADD(HOUR, -24, GETDATE())
           GROUP BY h.AutoID, h.OrderKey, h.BranchID, t.OrderDateTime
           HAVING (@MinCancelAmount IS NULL OR @MinCancelAmount <= 0 OR SUM(t.ExtendedPrice) >= @MinCancelAmount)
       )
       SELECT TOP 7
           c.AutoID as autoId,
           c.OrderKey as orderKey,
           c.BranchID as branchId,
           CONVERT(VARCHAR, c.DateTimeField, 120) as orderDateTime,
           c.Amount as amountDue,
           'cancel' as type,
           br.BranchName as branchName
       FROM CombinedCancels c
       LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = c.BranchID
       ORDER BY c.DateTimeField DESC`;

       const discountQuery = `
       SELECT TOP 7
           h.AutoID as autoId,
           h.OrderKey as orderKey,
           h.BranchID as branchId,
           CONVERT(VARCHAR, h.OrderDateTime, 120) as orderDateTime,
           h.DiscountTotalAmount as amountDue,
           'discount' as type,
           br.BranchName as branchName
       FROM OrderHeaders h WITH (NOLOCK)
       LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = h.BranchID
       WHERE h.@BranchID
       AND h.DiscountTotalAmount > 0
       AND h.OrderDateTime >= DATEADD(HOUR, -24, GETDATE())
       AND (@MinDiscountAmount IS NULL OR @MinDiscountAmount <= 0 OR h.DiscountTotalAmount >= @MinDiscountAmount)
       ORDER BY h.OrderDateTime DESC`;

       const saleQuery = `
       SELECT TOP 7
           h.AutoID as autoId,
           h.OrderKey as orderKey,
           h.BranchID as branchId,
           CONVERT(VARCHAR, h.OrderDateTime, 120) as orderDateTime,
           h.AmountDue as amountDue,
           'sale' as type,
           br.BranchName as branchName
       FROM OrderHeaders h WITH (NOLOCK)
       LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = h.BranchID
       WHERE h.@BranchID
       AND h.OrderDateTime >= DATEADD(HOUR, -24, GETDATE())
       AND (@MinSaleAmount IS NULL OR @MinSaleAmount <= 0 OR h.AmountDue >= @MinSaleAmount)
       ORDER BY h.OrderDateTime DESC`;

       const instance = Dataset.getInstance();

       const [cancelResults, discountResults, saleResults] = await Promise.all([
           instance.executeQuery<Notification[]>({
               query: cancelQuery,
               parameters: {
                   BranchID: branches,
                   MinCancelAmount: minCancelAmount
               },
               req
           }),
           instance.executeQuery<Notification[]>({
               query: discountQuery,
               parameters: {
                   BranchID: branches,
                   MinDiscountAmount: minDiscountAmount
               },
               req
           }),
           instance.executeQuery<Notification[]>({
               query: saleQuery,
               parameters: {
                   BranchID: branches,
                   MinSaleAmount: minSaleAmount
               },
               req
           })
       ]);

       const formatResults = (results: any[]) => results.map(result => ({
           autoId: result.autoId,
           orderKey: result.orderKey,
           branchId: result.branchId,
           orderDateTime: result.orderDateTime,
           amountDue: parseFloat(result.amountDue) || 0,
           type: result.type,
           branchName: result.branchName
       }));

       const combinedResults = [
           ...formatResults(cancelResults),
           ...formatResults(discountResults),
           ...formatResults(saleResults)
       ].sort((a, b) => {
           if (a.type === b.type) {
               return new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime();
           }
           const typeOrder = { cancel: 1, discount: 2, sale: 3 };
           return typeOrder[a.type] - typeOrder[b.type];
       });

       return res.status(200).json(combinedResults);

   } catch (error: any) {
       console.error('Error in notifications handler:', error);
       return res.status(500).json({
           error: 'Internal server error',
           details: error.message
       });
   }
}