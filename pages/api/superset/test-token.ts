import type { NextApiRequest, NextApiResponse } from 'next';
import { Superset } from './superset';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { dashboard_id, database_name, force_refresh } = req.body;

        const instance = Superset.getInstance();
        if (!dashboard_id) {
            return res.status(400).json({ error: 'Dashboard ID is required' });
        }

        if (!database_name) {
            return res.status(400).json({ error: 'Database name is required' });
        }

        // Clear token cache if force refresh
        if (force_refresh) {
        }

        // Guest token'ı al
        const guestToken = await instance.getGuestToken(dashboard_id, database_name, force_refresh);

        return res.json({ 
            guest_token: guestToken,
            dashboard_id,
            database_name,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting test guest token:', error);
        return res.status(500).json({ 
            message: 'Error getting guest token',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
