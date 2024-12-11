import { useTabStore } from '@/stores/tab-store';


export function useTab() {
    const addTab = useTabStore((state) => state.addTab);

    const handleTabOpen = (id: string, title: string) => {
        const existingTab = useTabStore.getState().tabs.find(tab => tab.id === id);
        if (existingTab) {
          useTabStore.getState().setActiveTab(id);
        } else {
          addTab({
            id,
            title,
            lazyComponent: () => import(`@/app/[tenantId]/(main)/${id}/page`),
          });
        }
      };

    return { handleTabOpen };
}