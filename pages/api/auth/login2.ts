import { NextApiRequest, NextApiResponse } from 'next';
import { login } from '../../../lib/serkanset';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { username, password } = req.body;
        
        const data = await login(username , password );

        return res.status(200).json(data);
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}
