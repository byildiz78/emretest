import { ExpoTokens } from '@/types/tables';
import axios from 'axios';
import { useState } from 'react';


export function useExpo() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sendNotification = async (UserID: string[], title: string, message: string, sound?: string, priority?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(
                '/api/expo/sendnotification',
                {
                    UserID,
                    title,
                    message,
                    sound,
                    priority
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            )

            if (response.status !== 200) { throw new Error('Failed to send notification'); }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    };

    return { sendNotification, loading, error };
}