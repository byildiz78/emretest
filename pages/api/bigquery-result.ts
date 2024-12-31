import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/pages/api/dataset';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const { jobId } = req.query;
  
            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required' });
            }

            const instance = Dataset.getInstance();
            let tenantId = '';
            if (req.headers.referer) {
                try {
                    tenantId = new URL(req.headers.referer).pathname.split('/')[1];
                } catch (error) {
                    console.error('Error parsing referer:', error);
                }
            }

            const result = await instance.getJobResult<any>({
                jobId: jobId.toString(),
                tenantId: tenantId?.toString(),
                req
            });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching job results:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (errorMessage.includes('No database found for tenant')) {
                return res.status(404).json({ error: errorMessage });
            }
            res.status(500).json({ 
                error: 'Failed to fetch job results',
                details: errorMessage
            });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
