import { useState, useEffect } from 'react';
import { Notification } from '@/types/tables';
import { useFilterStore } from '@/stores/filters-store';
import axios from 'axios';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { selectedFilter} = useFilterStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.post('/api/notifications', {
                   branches: selectedFilter.branches 
                });

                if(response.status === 200){
                    setNotifications(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30 saniyede bir güncelle
        return () => clearInterval(interval);
    }, []);

    return { notifications, loading, error };
}