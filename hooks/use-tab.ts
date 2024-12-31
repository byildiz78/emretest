import { useTabStore } from '@/stores/tab-store';
import { useFilterStore } from '@/stores/filters-store';
import { toZonedTime } from 'date-fns-tz';
import { addDays } from 'date-fns';

export function useTab() {
    const addTab = useTabStore((state) => state.addTab);
    const setFilter = useFilterStore((state) => state.setFilter);

    const getDefaultFilter = () => ({
        date: {
            from: toZonedTime(new Date(new Date().setHours(0, 0, 0, 0)), 'Europe/Istanbul'),
            to: toZonedTime(addDays(new Date().setHours(23, 59, 59, 999), 1), 'Europe/Istanbul')
        },
        branches: [],
        selectedBranches: []
    });

    const handleTabOpen = (id: string, title: string) => {
        const existingTab = useTabStore.getState().tabs.find(tab => tab.id === id);
        if (existingTab) {
            useTabStore.getState().setActiveTab(id);
            // Mevcut tab'ın filtresini al ve global state'e uygula
            const tabFilter = useTabStore.getState().getTabFilter(id);
            if (tabFilter) {
                setFilter(tabFilter);
            } else {
                // Eğer tab'ın filtresi yoksa yeni bir filtre oluştur
                const newFilter = getDefaultFilter();
                useTabStore.getState().setTabFilter(id, newFilter);
                setFilter(newFilter);
            }
        } else {
            // Yeni tab için varsayılan filtreyi ayarla
            const defaultFilter = getDefaultFilter();
            
            addTab({
                id,
                title,
                filter: defaultFilter,
                lazyComponent: () => import(`@/app/[tenantId]/(main)/${id}/page`),
            });
            
            setFilter(defaultFilter);
        }
    };

    return { handleTabOpen };
}