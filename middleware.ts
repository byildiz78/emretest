import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Superset } from './pages/api/superset';
import { CACHE_CONSTANTS } from './pages/api/constants';
import { Efr_Users } from './types/tables';
import { jwtVerify, SignJWT, decodeJwt } from 'jose';

// Sabit değerler ve encoder'ı bir kere oluştur
const textEncoder = new TextEncoder();
const ACCESS_TOKEN_SECRET = textEncoder.encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET = textEncoder.encode(process.env.REFRESH_TOKEN_SECRET);
const NEXT_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900');
const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '129600');
const ACCESS_TOKEN_ALGORITHM = process.env.ACCESS_TOKEN_ALGORITHM || 'HS512';
const REFRESH_TOKEN_ALGORITHM = process.env.REFRESH_TOKEN_ALGORITHM || 'HS512';

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
        '/api/((?!auth).)*'
    ]
}

// Cache için Map kullan
const databaseCache = new Map<string, { exists: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

async function checkTenantDatabase(tenantId: string): Promise<boolean> {
    // Cache kontrolü
    const cached = databaseCache.get(tenantId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.exists;
    }

    try {
        const superset = Superset.getInstance();
        const databases = await superset.getDatabases();

        if ('error' in databases) {
            throw new Error(databases.message);
        }

        const exists = databases.result.some(db => 
            db.database_name.toLowerCase() === tenantId.toLowerCase()
        );

        // Sonucu cache'le
        databaseCache.set(tenantId, { exists, timestamp: Date.now() });
        return exists;
    } catch (error) {
        console.error('Tenant database check error:', error);
        return false;
    }
}

function getTenantId(request: NextRequest): string {
    if (request.nextUrl.pathname.includes("/api/")) {
        const referrer = request.headers.get('referer') || '';
        return referrer.split('/')[3] || '';
    }
    return request.nextUrl.pathname.split('/')[1] || '';
}

async function verifyToken(token: string, secret: Uint8Array, options: any): Promise<boolean> {
    try {
        await jwtVerify(token, secret, options);
        return true;
    } catch {
        return false;
    }
}

async function createNewAccessToken(user: Efr_Users, tenantId: string): Promise<string> {
    const tokenPayload = {
        username: user.UserName,
        userId: user.UserID
    };
    console.log(tokenPayload)
    const date = Date.now();
    return await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
        .setExpirationTime(Math.floor(date / 1000) + ACCESS_TOKEN_LIFETIME)
        .setIssuer(NEXT_PUBLIC_DOMAIN)
        .setAudience(tenantId)
        .setIssuedAt(Math.floor(date / 1000))
        .sign(ACCESS_TOKEN_SECRET);
}

export async function middleware(request: NextRequest) {
    const tenantId = getTenantId(request);
    const isApiRoute = request.nextUrl.pathname.includes("/api/");
    const isLoginRoute = request.nextUrl.pathname.includes("login");
    const isNotFoundRoute = request.nextUrl.pathname.includes("notfound");

    // NotFound sayfası kontrolü
    if (isNotFoundRoute) {
        if (tenantId && !isApiRoute) {
            const databaseExists = await checkTenantDatabase(tenantId);
            if (databaseExists) {
                return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
            }
        }
        return NextResponse.next();
    }

    // Tenant ID kontrolü
    if (!tenantId && !isApiRoute) {
        return NextResponse.redirect(new URL('/notfound', request.url));
    }

    // Database kontrolü
    if (!isApiRoute && !tenantId.includes("api")) {
        const databaseExists = await checkTenantDatabase(tenantId);
        if (!databaseExists) {
            return NextResponse.redirect(new URL(`/${tenantId}/notfound`, request.url));
        }
    }

    // Token kontrolü
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!accessToken || !refreshToken) {
        if (isLoginRoute || isApiRoute) {
            return NextResponse.next();
        }
        const response = NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
        response.cookies.set('access_token', '', { maxAge: 0 });
        response.cookies.set('refresh_token', '', { maxAge: 0 });
        return response;
    }

    // Token doğrulama
    const baseTokenOptions = {
        audience: tenantId,
        issuer: NEXT_PUBLIC_DOMAIN
    };

    const isValidRefresh = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET, {
        ...baseTokenOptions,
        algorithms: [REFRESH_TOKEN_ALGORITHM]
    });

    if (!isValidRefresh) {
        const response = NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
        response.cookies.set('access_token', '', { maxAge: 0 });
        response.cookies.set('refresh_token', '', { maxAge: 0 });
        return response;
    }
    console.log("refresh", isValidRefresh)
    const isValidAccess = await verifyToken(accessToken, ACCESS_TOKEN_SECRET, {
        ...baseTokenOptions,
        algorithms: [ACCESS_TOKEN_ALGORITHM],
        requiredClaims: ['username', 'userId']
    });

    if (!isValidAccess) {
        const decodedToken = decodeJwt(refreshToken); // refresh token'dan bilgileri al
        if (!decodedToken) {
            return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
        }
        console.log(decodedToken)
        const newAccessToken = await createNewAccessToken(decodedToken as Efr_Users, tenantId);
        const response = NextResponse.next(); // Yönlendirme yerine next() kullan
        
        response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            ...(NODE_ENV === 'production' ? { domain: NEXT_PUBLIC_DOMAIN } : {})
        });

        return response;
    }

    if (isLoginRoute) {
        return NextResponse.redirect(new URL(`/${tenantId}`, request.url));
    }

    return NextResponse.next();
}

const cleanupCache = async () => {
    const superset = Superset.getInstance();
    await superset.getDatabases();
}

setInterval(cleanupCache, CACHE_CONSTANTS.DATABASE.TTL);