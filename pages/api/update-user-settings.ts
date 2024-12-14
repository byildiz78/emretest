import { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from 'jose';
import { Dataset } from '@/pages/api/dataset';

interface UpdateSettingsRequest {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Extract tenant ID from referer
        const tenantId = extractTenantId(req.headers.referer);
        
        // Verify and extract user ID from token
        const userId = await verifyUserToken(req, tenantId);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check and create columns if they don't exist
        await ensureColumnsExist(req);

        // Validate request body
        const validationError = validateRequestBody(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Update user settings
        await updateUserSettings(req.body, userId, req);
        
        return res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error in settings update handler:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function ensureColumnsExist(req: NextApiRequest): Promise<void> {
    const instance = Dataset.getInstance();

    // First, check if columns exist
    const checkColumnsQuery = `
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'efr_Users'
        AND COLUMN_NAME IN ('MinDiscountAmount', 'MinCancelAmount', 'MinSaleAmount')
    `;

    const result = await instance.executeQuery<any>({
        query: checkColumnsQuery,
        parameters: {},
        req
    });

    const existingColumnsCount = result[0]?.count || 0;

    // If we don't have all three columns
    if (existingColumnsCount < 3) {
        // Add missing columns
        const alterTableQuery = `
            BEGIN TRANSACTION;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'efr_Users' AND COLUMN_NAME = 'MinDiscountAmount')
            BEGIN
                ALTER TABLE efr_Users ADD MinDiscountAmount DECIMAL(18,2) DEFAULT 0;
            END

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'efr_Users' AND COLUMN_NAME = 'MinCancelAmount')
            BEGIN
                ALTER TABLE efr_Users ADD MinCancelAmount DECIMAL(18,2) DEFAULT 0;
            END

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'efr_Users' AND COLUMN_NAME = 'MinSaleAmount')
            BEGIN
                ALTER TABLE efr_Users ADD MinSaleAmount DECIMAL(18,2) DEFAULT 0;
            END

            COMMIT TRANSACTION;
        `;

        await instance.executeQuery({
            query: alterTableQuery,
            parameters: {},
            req
        });
    }
}

function extractTenantId(referer: string | undefined): string {
    if (!referer) return '';
    
    try {
        return new URL(referer).pathname.split('/')[1] || '';
    } catch (error) {
        console.error('Error parsing referer:', error);
        return '';
    }
}

async function verifyUserToken(req: NextApiRequest, tenantId: string): Promise<string | null> {
    try {
        const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
        if (!ACCESS_TOKEN_SECRET) {
            throw new Error('ACCESS_TOKEN_SECRET is not defined');
        }

        const cookies = parseCookies(req.headers.cookie);
        const accessToken = cookies[`${tenantId}_access_token`];
        
        if (!accessToken) {
            throw new Error('Access token not found');
        }

        const decoded = await jwtVerify(accessToken, ACCESS_TOKEN_SECRET);
        return decoded.payload.userId?.toString() || null;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
    if (!cookieHeader) return {};
    
    return cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
}

function validateRequestBody(body: any): string | null {
    const requiredFields = ['minDiscountAmount', 'minCancelAmount', 'minSaleAmount'];
    
    for (const field of requiredFields) {
        if (typeof body[field] !== 'number') {
            return `Invalid or missing ${field}`;
        }
        if (body[field] < 0) {
            return `${field} cannot be negative`;
        }
    }
    
    return null;
}

async function updateUserSettings(
    settings: UpdateSettingsRequest,
    userId: string,
    req: NextApiRequest
): Promise<void> {
    const instance = Dataset.getInstance();
    
    const query = `
        UPDATE efr_Users 
        SET MinDiscountAmount = @MinDiscountAmount,
            MinCancelAmount = @MinCancelAmount,
            MinSaleAmount = @MinSaleAmount
        WHERE UserID = @UserID
    `;

    await instance.executeQuery({
        query,
        parameters: {
            MinDiscountAmount: settings.minDiscountAmount,
            MinCancelAmount: settings.minCancelAmount,
            MinSaleAmount: settings.minSaleAmount,
            UserID: userId
        },
        req
    });
}