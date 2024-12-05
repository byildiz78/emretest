import { checkTenantDatabase } from "./utils";

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
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
}

export async function datasetApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
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

export async function executeQuery<T>(params: ExecuteParams): Promise<T> {
    const { query, parameters = {}, tenantId: paramTenantId } = params;
    let tenantId = paramTenantId;
    const isClient = typeof window !== 'undefined';
    try {
        if (!tenantId && isClient) {
            tenantId = window.location.pathname.split('/')[1];
        }
        const database = await checkTenantDatabase(tenantId || '');
        const databaseId = database?.databaseId || params.databaseId;
        if(databaseId !== undefined && databaseId !== null) {
            return datasetApi<T>('/query/execute', {
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

export async function getDatabase<T>(tenantId: string = ""): Promise<T> {
    return datasetApi<T>(`/config/database/${tenantId}`);
}