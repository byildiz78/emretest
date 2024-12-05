import { checkTenantDatabase } from "../../lib/utils";
import { NextApiRequest } from 'next';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
}

interface ExecuteParams {
    databaseId?: string;
    tenantId?: string;
    query: string;
    parameters?: {
        date1?: string;
        date2?: string;
        BranchID?: number;
        [key: string]: string | number | undefined;
    };
    req?: NextApiRequest;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class Dataset {
    private static instance: Dataset;
    private readonly QUERY_CACHE = new Map<string, CacheEntry<any>>();

    private constructor() {}

    public static getInstance(): Dataset {
        if (!Dataset.instance) {
            Dataset.instance = new Dataset();
        }
        return Dataset.instance;
    }

    private async datasetApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body } = options;
        const headers = {
            'Content-Type': 'application/json',
        };

        const requestOptions: RequestInit = {
            method,
            headers,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${process.env.DATASET_API_BASE_URL}${endpoint}`, requestOptions);
            const responseText = await response.text();
            
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : null;
            } catch (parseError) {
                console.error('Response parsing error:', parseError);
                console.error('Raw response:', responseText);
                throw new Error('Invalid response format');
            }
    
            if (!response.ok) {
                throw new Error(data?.message || 'Request failed');
            }
    
            return data.data as T;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    public async executeQuery<T>(params: ExecuteParams): Promise<T> {
        const { query, parameters = {}, tenantId: paramTenantId, req } = params;
        let tenantId = paramTenantId;
        if (params.req && req?.headers.referer) {
            try {
                tenantId = new URL(req.headers.referer).pathname.split('/')[1];
            } catch (error) {
                console.error('Error parsing referer:', error);
            }
        }
        try {

            const database = await checkTenantDatabase(tenantId || '');
            const databaseId = database?.databaseId || params.databaseId;
            if(databaseId !== undefined && databaseId !== null) {
                return this.datasetApi<T>('/query/execute', {
                    method: 'POST',
                    body: {
                        databaseId,
                        query,
                        parameters
                    }
                });
            }
            return [] as T;
        } catch (error) {
            console.error('executeQuery error:', error);
            throw error;
        }
    }

    public async getDatabase<T>(tenantId: string = ""): Promise<T> {
        return this.datasetApi<T>(`/config/database/${tenantId}`);
    }
    
}

// Export singleton instance
export const dataset = Dataset.getInstance();