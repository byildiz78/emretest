import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import { executeQuery } from '@/lib/dataset';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
const NEXT_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900');
const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '129600');
const ACCESS_TOKEN_ALGORITHM = process.env.ACCESS_TOKEN_ALGORITHM || 'HS512';
const REFRESH_TOKEN_ALGORITHM = process.env.REFRESH_TOKEN_ALGORITHM || 'HS512';

// Extract hostname from NEXT_PUBLIC_DOMAIN for cookie domain
const getDomainForCookie = () => {
    try {
        const url = new URL(NEXT_PUBLIC_DOMAIN);
        return url.hostname;
    } catch {
        return 'localhost';
    }
};

export function encrypt(val: string): string | null {
    if (!val) {
        return null;
    }
    const buffer = Buffer.from(val, 'utf16le');
    const hash = crypto.createHash('sha256').update(buffer).digest();
    
    return Array.from(hash)
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('-');
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const tenantId = new URL(req.headers.referer || '').pathname.split('/')[1];
        const { username, password } = req.body;
        const encryptedpass = encrypt(password);
        
        const query = "SELECT TOP 1 UserID, UserName FROM Efr_Users WHERE UserName = @username AND EncryptedPass = @password AND IsActive=1";

        const response = await executeQuery<{ UserID: number; UserName: string }[]>({
            query,
            parameters : {
                username: username,
                password: encryptedpass?.toString()
            }
        });
        const user = response[0]
        if (user) {
            let tokenPayload = {
                username: user.UserName,
                userId: user.UserID,
                aud: tenantId
            };

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const cookieDomain = NODE_ENV === 'production' ? getDomainForCookie() : undefined;

            const accessToken = await new SignJWT(tokenPayload)
                .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
                .setExpirationTime(currentTimestamp + ACCESS_TOKEN_LIFETIME)
                .setIssuer(NEXT_PUBLIC_DOMAIN)
                .setAudience(tenantId)
                .setIssuedAt(currentTimestamp)
                .sign(ACCESS_TOKEN_SECRET);
            const accessTokenCookie = serialize('access_token', accessToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: ACCESS_TOKEN_LIFETIME,
                ...(cookieDomain ? { domain: cookieDomain } : {})
            });

            const refreshToken = await new SignJWT(tokenPayload)
                .setProtectedHeader({ alg: REFRESH_TOKEN_ALGORITHM })
                .setExpirationTime(currentTimestamp + REFRESH_TOKEN_LIFETIME)
                .setIssuer(NEXT_PUBLIC_DOMAIN)
                .setAudience(tenantId)
                .setIssuedAt(currentTimestamp)
                .sign(REFRESH_TOKEN_SECRET);
            const refreshTokenCookie = serialize('refresh_token', refreshToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: REFRESH_TOKEN_LIFETIME,
                ...(cookieDomain ? { domain: cookieDomain } : {})
            });

            res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
            return res.status(200).json({ message: 'Login successful' });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}