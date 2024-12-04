import axios from 'axios';
import { useState, useCallback } from 'react';

export function useReport<T = any>() {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const execute = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get('/api/webreportlist', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Query execution failed');
            }

            setData(response.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, error, isLoading, execute };
}