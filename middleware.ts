import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT, decodeJwt } from 'jose';
import { checkTenantDatabase } from './lib/utils';

const textEncoder = new TextEncoder();
const ACCESS_TOKEN_SECRET = textEncoder.encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET = textEncoder.encode(process.env.REFRESH_TOKEN_SECRET);
const NEXT_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900');
const ACCESS_TOKEN_ALGORITHM = process.env.ACCESS_TOKEN_ALGORITHM || 'HS512';
const REFRESH_TOKEN_ALGORITHM = process.env.REFRESH_TOKEN_ALGORITHM || 'HS512';

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|images|avatars|favicon.ico|favicon2.ico).*)',
        '/api/((?!auth).)*'
    ]
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

async function createNewAccessToken(username: string | unknown, userId: string | unknown, tenantId: string): Promise<string> {
    
    if(username !== undefined && userId !== undefined){
        const tokenPayload = {
            username: username,
            userId: userId
        };
        const date = Date.now();
        return await new SignJWT(tokenPayload)
            .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
            .setExpirationTime(Math.floor(date / 1000) + ACCESS_TOKEN_LIFETIME)
            .setIssuer(NEXT_PUBLIC_DOMAIN)
            .setAudience(tenantId)
            .setIssuedAt(Math.floor(date / 1000))
            .sign(ACCESS_TOKEN_SECRET);
    }
    return '';
}

export async function middleware(request: NextRequest) {
    const tenantId = getTenantId(request);
    const isApiRoute = request.nextUrl.pathname.includes("/api/");
    const isLoginRoute = request.nextUrl.pathname.includes("login");
    const isNotFoundRoute = request.nextUrl.pathname.includes("notfound");

    if (isNotFoundRoute) {
        if (tenantId && !isApiRoute) {
            const database = await checkTenantDatabase(tenantId);
            if (database !== undefined) {
                return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
            }
        }
        return NextResponse.next();
    }

    if (!tenantId && !isApiRoute) {
        return NextResponse.redirect(new URL('/notfound', request.url));
    }

    if (!isApiRoute && !tenantId.includes("api")) {
        const database = await checkTenantDatabase(tenantId);
        if (!database === undefined) {
            return NextResponse.redirect(new URL(`/${tenantId}/notfound`, request.url));
        }
    }

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

    const baseTokenOptions = {
        audience: tenantId,
        issuer: NEXT_PUBLIC_DOMAIN,
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
    const isValidAccess = await verifyToken(accessToken, ACCESS_TOKEN_SECRET, {
        ...baseTokenOptions,
        algorithms: [ACCESS_TOKEN_ALGORITHM],
        requiredClaims: ['username', 'userId']
    });

    if (!isValidAccess) {
        const decodedToken = decodeJwt(refreshToken);
        if (!decodedToken) {
            return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
        }
        const newAccessToken = await createNewAccessToken(decodedToken.username, decodedToken.userId, tenantId);
        const response = NextResponse.next();
        
        response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            //...(NODE_ENV === 'production' ? { domain: NEXT_PUBLIC_DOMAIN } : {})
        });

        return response;
    }

    if (isLoginRoute) {
        return NextResponse.redirect(new URL(`/${tenantId}`, request.url));
    }

    return NextResponse.next();
}
