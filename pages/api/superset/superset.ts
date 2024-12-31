import { CACHE_CONSTANTS } from "../constants";
import type {
    SuperSetLoginResponse,
    SuperSetCrsfResponse,
    SuperSetQueryOptions,
    SuperSetErrorResponse,
    SuperSetExecuteResponse,
    SuperSetDatabaseResponse
} from "@/types/superset";
import axios, { AxiosRequestConfig } from 'axios';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class Superset {
    private baseUrl: string;
    private username: string;
    private password: string;
    private provider: string;
    private token: string = "";
    private csrfToken: string = "";
    private tokenExpiry: number = 0;
    private static instance: Superset;
    private readonly MAX_RETRIES = 3;
    private readonly TOKEN_REFRESH_THRESHOLD = 300000;
    private readonly GUEST_TOKEN_EXPIRY = 3600000; // 1 hour
    private readonly DATABASE_CACHE = new Map<string, CacheEntry<SuperSetDatabaseResponse>>();
    private readonly GUEST_TOKEN_CACHE = new Map<string, { token: string; expiresAt: number }>();

    private constructor() {
        this.baseUrl = `http://localhost:${process.env.SUPERSET_PORT}`;
        this.username = process.env.SUPERSET_USERNAME || '';
        this.password = process.env.SUPERSET_PASSWORD || '';
        this.provider = process.env.SUPERSET_PROVIDER || '';
    }

    public static getInstance(): Superset {
        if (!Superset.instance) {
            Superset.instance = new Superset();
        }
        return Superset.instance;
    }

    private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
        let lastError: Error | null = null;
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                const axiosConfig: AxiosRequestConfig = {
                    method: options.method,
                    headers: {
                        ...(options.headers as Record<string, string>),
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip, deflate, br'
                    } as Record<string, string>,
                };

                if (options.body) {
                    const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
                    axiosConfig.data = bodyStr;
                    if (axiosConfig.headers) {
                        axiosConfig.headers = {
                            ...axiosConfig.headers,
                            'Content-Length': Buffer.from(bodyStr).length.toString()
                        };
                    }
                }

                const axiosResponse = await axios(url, axiosConfig);

                // Axios yanıtını fetch Response formatına dönüştürme
                const response = new Response(JSON.stringify(axiosResponse.data), {
                    status: axiosResponse.status,
                    statusText: axiosResponse.statusText,
                    headers: new Headers(axiosResponse.headers as any)
                });

                if (response.status === 401) {
                    await this.renewTokens();
                    continue;
                }
                return response;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    await this.renewTokens();
                    continue;
                }
                lastError = error as Error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
            }
        }
        throw lastError || new Error('Request failed after max retries');
    }

    public async getCsrfToken(): Promise<void> {
        try {
            const response = await this.fetchWithRetry(
                `${this.baseUrl}/api/v1/security/csrf_token`,
                { method: 'GET' }
            );
            const data: SuperSetCrsfResponse = await response.json();

            if (data.result) {
                this.csrfToken = data.result;
            } else {
                throw new Error('CSRF token not found in response');
            }
        } catch (error) {
            console.error('CSRF token error:', error);
            throw error;
        }
    }

    public async getGuestToken(dashboardId: string, forceRefresh: boolean = false): Promise<string> {
        try {
            const now = Date.now();
            const cached = this.GUEST_TOKEN_CACHE.get(dashboardId);
            if (!forceRefresh && cached && cached.expiresAt > now) {
                return cached.token;
            }

            await this.createTokens();

            const response = await this.fetchWithRetry(`${this.baseUrl}/api/v1/security/guest_token/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'X-CSRFToken': this.csrfToken,
                    'Referer': this.baseUrl,
                    'Origin': this.baseUrl
                },
                body: JSON.stringify({
                    resources: [{ 
                        id: dashboardId,
                        type: "dashboard"
                    }],
                    rls: [{ clause: "1=1" }],
                    user: {
                        first_name: "admin",
                        last_name: "admin",
                        username: "admin"
                    }
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to obtain guest token');
            }
    
            const data = await response.json();
            
            // Cache the token
            this.GUEST_TOKEN_CACHE.set(dashboardId, {
                token: data.token,
                expiresAt: now + this.GUEST_TOKEN_EXPIRY
            });

            return data.token;
        } catch (error) {
            console.error('Error getting guest token:', error);
            throw error;
        }
    }

    private async login(): Promise<void> {
        try {
            const response = await this.fetchWithRetry(
                `${this.baseUrl}/api/v1/security/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                        provider: this.provider,
                        refresh: true
                    })
                }
            );

            const data: SuperSetLoginResponse = await response.json();

            if (data.access_token) {
                this.token = data.access_token;
                this.tokenExpiry = Date.now() + 3600000;
            } else {
                throw new Error('Access token not found in response');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    private async renewTokens(): Promise<void> {
        this.token = "";
        this.csrfToken = "";
        await this.createTokens();
    }

    private async createTokens(): Promise<void> {
        if (!this.token || Date.now() > this.tokenExpiry - this.TOKEN_REFRESH_THRESHOLD) {
            await this.login();
        }
        if (!this.csrfToken) {
            await this.getCsrfToken();
        }
    }


    public async executeQuery<T>(
        sql: string,
        options: SuperSetQueryOptions = {}
    ): Promise<SuperSetExecuteResponse<T> | SuperSetErrorResponse> {
        try {
            const defaultOptions = {
                database_id: 3,
                sql: sql
            };

            const mergedOptions = { ...defaultOptions, ...options };
            await this.createTokens();

            const response = await this.fetchWithRetry(
                `${this.baseUrl}/api/v1/sqllab/execute`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept-Charset': 'utf-8',
                        'Authorization': `Bearer ${this.token}`,
                        'X-CSRFToken': this.csrfToken
                    },
                    body: JSON.stringify(mergedOptions)
                }
            );

            const result = await response.json();

            return result as SuperSetExecuteResponse<T>;
        } catch (error) {
            console.error('Query execution error:', error);
            return {
                error: 'Query execution failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    public async getDatabases(): Promise<SuperSetDatabaseResponse | SuperSetErrorResponse> {
        try {
            const cached = this.DATABASE_CACHE.get(CACHE_CONSTANTS.DATABASE.KEY);
            if (cached && (Date.now() - cached.timestamp < CACHE_CONSTANTS.DATABASE.TTL)) {
                return cached.data;
            }
            await this.createTokens();

            const response = await this.fetchWithRetry(
                `${this.baseUrl}/api/v1/database/`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                        'X-CSRFToken': this.csrfToken
                    }
                }
            );

            const data = await response.json();
            this.DATABASE_CACHE.set(CACHE_CONSTANTS.DATABASE.KEY, { data: data, timestamp: Date.now() });
            return data || [];
        } catch (error) {
            console.error('Get databases error:', error);
            return {
                error: 'Failed to fetch databases',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    public async getDatabaseById(id: number): Promise<SuperSetDatabaseResponse | SuperSetErrorResponse> {
        try {
            await this.createTokens();

            const response = await this.fetchWithRetry(
                `${this.baseUrl}/api/v1/database/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                        'X-CSRFToken': this.csrfToken
                    }
                }
            );

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Get database error:', error);
            return {
                error: 'Failed to fetch database',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export const db = {
    async query<T>(
        sql: string,
        options?: SuperSetQueryOptions
    ): Promise<{ data: T | null; error: string | null }> {
        try {
            const client = Superset.getInstance();
            const result = await client.executeQuery<T>(sql, options);

            if ('error' in result) {
                return { data: null, error: result.message };
            }

            return { data: result.data as T || null, error: null };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
};
