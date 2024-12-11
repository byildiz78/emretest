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

        const query = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'dm_ExpoTokens')
        BEGIN
            CREATE TABLE dm_ExpoTokens (
                AutoID int IDENTITY(1,1) PRIMARY KEY,
                ExpoToken nvarchar(255),
                UpdatedAt datetime2,
                UserID nvarchar(50)
            )
        END;

        MERGE dm_ExpoTokens AS target
        USING (VALUES (@userId, @token, GETDATE())) AS source (UserID, ExpoToken, UpdatedAt)
        ON target.UserID = source.UserID
        WHEN MATCHED THEN
            UPDATE SET 
                ExpoToken = source.ExpoToken,
                UpdatedAt = source.UpdatedAt
        WHEN NOT MATCHED THEN
            INSERT (UserID, ExpoToken, UpdatedAt)
            VALUES (source.UserID, source.ExpoToken, source.UpdatedAt);
        `;


        const instance = Dataset.getInstance();

        const result = await instance.executeQuery({
            query,
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
