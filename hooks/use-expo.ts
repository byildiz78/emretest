import { useState } from 'react';


export function useExpo() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sendNotification = async (UserID: string[], title: string, message: string, sound?: string, priority?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/expo/sendnotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({         
                    UserID,
                    title,
                    message,
                    sound,
                    priority
                }),
            });

            if (!response.ok) { throw new Error('Failed to send notification'); }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    };

    return { sendNotification, loading, error };
}