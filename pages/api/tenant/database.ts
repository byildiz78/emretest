import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseResponse } from '@/types/tables';

async function fetchDatabase() {
    const apiUrl = `${process.env.DATASET_API_BASE_URL}/database`;
    const response = await fetch(apiUrl, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DATASET_API_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { tenantId } = req.query;

    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required' });
    }

    try {
        const databases = await fetchDatabase();
        const database = databases.find(db => db.tenantId === tenantId);

        if (!database) {
            return res.status(404).json({ message: 'Database not found for tenant' });
        }

        return res.status(200).json(database);
    } catch (error) {
        console.error('Error fetching database:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
