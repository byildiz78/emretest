const BASE_URL = 'https://srv7.robotpos.com/Serkanset/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

interface ExecuteParams {
    databaseId: string;
    query: string;
    parameters: {
        date1?: string;
        date2?: string;
        BranchID?: number;
        [key: string]: string | number | undefined;
    };
}

export async function serkansetApi(endpoint: string, options: RequestOptions = {}) {
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
        const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);
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

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

export async function login(username: string, password: string) {
    return serkansetApi('/auth/login', {
        method: 'POST',
        body: { username, password }
    });
}

export async function execute(params: ExecuteParams) {
    return serkansetApi('/query/execute', {
        method: 'POST',
        body: {
            databaseId: params.databaseId,
            query: params.query,
            parameters: params.parameters
        }
    });
}