import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '../dataset';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const instance = Dataset.getInstance();


        const createColumnsQuery = `
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_NAME = 'Efr_Users' 
                            AND COLUMN_NAME = 'ExpoToken')
                BEGIN
                    ALTER TABLE Efr_Users
                    ADD ExpoToken nvarchar(255)
                END;

                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_NAME = 'Efr_Users' 
                            AND COLUMN_NAME = 'ExpoTokenUpdatedAt')
                BEGIN
                    ALTER TABLE Efr_Users
                    ADD ExpoTokenUpdatedAt datetime2
                END;`;

        await instance.executeQuery({
            query: createColumnsQuery,
            parameters:{
                userId,
                token
            },
            req
        });
        const updateQuery = `
                UPDATE Efr_Users
                SET ExpoToken = @token,
                    ExpoTokenUpdatedAt = GETDATE()
                WHERE UserID = @userId;`;


        await instance.executeQuery({
            query: updateQuery,
            parameters:{
                userId,
                token
            },
            req
        });


        return res.status(200).json({
            success: true,
            data: { userId, pushToken: token }
        });

    } catch (error) {
        console.error('Error saving token:', error);
        res.status(500).json({ message: 'Error saving token' });
    }
}
