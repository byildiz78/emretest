import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import sql, { config as SQLConfig } from 'mssql';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const config: SQLConfig = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || '',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

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
    const startTime = performance.now();
    console.log('Login handler started');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const tenantId = new URL(req.headers.referer || '').pathname.split('/')[1];
        const { username, password } = req.body;
        
        // const encryptStartTime = performance.now();
        // const encryptedpass = encrypt(password);
        // console.log(`Password encryption took: ${performance.now() - encryptStartTime}ms`);

        // const pool = await sql.connect(config);
        // const dbQueryStartTime = performance.now();
        
        // const result = await pool.request()
        //     .input('username', sql.VarChar, username)
        //     .input('password', sql.VarChar, encryptedpass)
        //     .query("SELECT TOP 1 UserID, UserName FROM Efr_Users WHERE UserName = @username AND EncryptedPass = @password AND IsActive=1");

        // console.log(`Database query took: ${performance.now() - dbQueryStartTime}ms`);

        // if (result.recordset && result.recordset.length > 0) {
        //     const tokenStartTime = performance.now();
        //     const user = result.recordset[0];
        //     let tokenPayload = {
        //         username: user.UserName,
        //         userId: user.UserID,
        //         aud: tenantId
        //     };

        //     const currentTimestamp = Math.floor(Date.now() / 1000);

        //     const accessToken = await new SignJWT(tokenPayload)
        //         .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
        //         .setExpirationTime(currentTimestamp + ACCESS_TOKEN_LIFETIME)
        //         .setIssuer(NEXT_PUBLIC_DOMAIN)
        //         .setAudience(tenantId)
        //         .setIssuedAt(currentTimestamp)
        //         .sign(ACCESS_TOKEN_SECRET);
        //     console.log(`Access token generation took: ${performance.now() - tokenStartTime}ms`);

        //     const cookieStartTime = performance.now();
        //     const cookieDomain = NODE_ENV === 'production' ? getDomainForCookie() : undefined;

        //     const accessTokenCookie = serialize('access_token', accessToken, {
        //         httpOnly: true,
        //         secure: NODE_ENV === 'production',
        //         sameSite: 'strict',
        //         path: '/',
        //         ...(cookieDomain ? { domain: cookieDomain } : {})
        //     });

        //     const refreshToken = await new SignJWT(tokenPayload)
        //         .setProtectedHeader({ alg: REFRESH_TOKEN_ALGORITHM })
        //         .setExpirationTime(currentTimestamp + REFRESH_TOKEN_LIFETIME)
        //         .setIssuer(NEXT_PUBLIC_DOMAIN)
        //         .setAudience(tenantId)
        //         .setIssuedAt(currentTimestamp)
        //         .sign(REFRESH_TOKEN_SECRET);
        //     console.log(`Refresh token generation took: ${performance.now() - cookieStartTime}ms`);

        //     const refreshTokenCookie = serialize('refresh_token', refreshToken, {
        //         httpOnly: true,
        //         secure: NODE_ENV === 'production',
        //         sameSite: 'strict',
        //         path: '/',
        //         ...(cookieDomain ? { domain: cookieDomain } : {})
        //     });

        //     await pool.close();
        //     console.log(`Total login process took: ${performance.now() - startTime}ms`);
        //     return res.status(200)
        //         .setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        //         .json({ message: 'Login successful' });
        // }

        // await pool.close();
        // return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
