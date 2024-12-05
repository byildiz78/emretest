'use client'
import { useFilterStore } from "@/stores/filters-store";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect, useRef, useState } from "react";

const SUPERSET_BASE_URL = process.env.NEXT_PUBLIC_SUPERSET_BASE_URL;
const tokenCache: Record<string, TokenCache> = {};
const TOKEN_EXPIRY_MINUTES = 50;

const styles = {
    container: 'w-full h-screen flex flex-col',
    filterBar: 'bg-blue-50 p-4 border-b border-gray-200',
    filterRow: 'flex flex-wrap gap-3 items-center',
    dashboardContainer: 'flex-1 relative',
    loading: 'absolute inset-0 flex justify-center items-center text-2xl z-50',
};

interface DasboardParams {
    dashboardId: string;
    standalone?: number;
    extraParams?: Record<string, string>;
}

interface TokenCache {
    token: string;
    expiresAt: number;
}


const getGuestToken = async (dashboardId: string, forceRefresh?: boolean) => {
    const now = Date.now();
    const cached = tokenCache[dashboardId];
    if (cached && cached.expiresAt > now && !forceRefresh) {
        return cached.token;
    }

    try {
        const response = await fetch(`/api/superset/guest_token?dashboard_id=${dashboardId}`);
        const data = await response.json();
        tokenCache[dashboardId] = {
            token: data.guest_token,
            expiresAt: now + (TOKEN_EXPIRY_MINUTES * 60 * 1000)
        };

        return data.guest_token;
    } catch (error) {
        console.error('Error fetching guest token:', error);
        throw error;
    }
};



export default function SupersetDashboardComponent({ dashboardId, standalone, extraParams }: DasboardParams) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedFilter } = useFilterStore()
    if (!SUPERSET_BASE_URL) {
        return <div>Hata: Ayarlar Alınamadı</div>;
    }

    const getFilterParams = () => {
        const formatDate = (date: Date) => {
            return date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0') + ' ' +
                String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0') + ':' +
                String(date.getSeconds()).padStart(2, '0') + '.' +
                String(date.getMilliseconds()).padStart(3, '0');
        };

        let params: Record<string, string> = {};
        if (selectedFilter.date.from) params.start_time = formatDate(selectedFilter.date.from);
        if (selectedFilter.date.to) params.end_time = formatDate(selectedFilter.date.to);
        if (selectedFilter.selectedBranches.length > 0) params.branchids = selectedFilter.selectedBranches.join(',');
        if(standalone) params.standalone = standalone.toString();
        if(extraParams){
            return {...params, ...extraParams};
        }
        return params
    };

    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            if (container.children[0]) {
                const firstChild = container.children[0] as HTMLElement;
                firstChild.style.width = "100%";
                firstChild.style.height = "100%";
            }
        }
    }, [isLoading]);

    useEffect(() => {
        let isMounted = true;
        const loadDashboard = async () => {
            if (!containerRef.current) {
                setError("Container ref is null");
                return;
            }
            
            setIsLoading(true);
            let retryCount = 0;
            const maxRetries = 3;

            const attemptLoad = async (): Promise<void> => {
                try {
                    const guestToken = await getGuestToken(dashboardId);
                    await embedDashboard({
                        id: dashboardId,
                        supersetDomain: SUPERSET_BASE_URL,
                        mountPoint: containerRef.current!,
                        fetchGuestToken: () => guestToken,
                        dashboardUiConfig: {
                            hideTitle: true,
                            hideTab: false,
                            hideChartControls: false,
                            urlParams: getFilterParams()
                        }
                    });

                    // Set size for the embedded container
                    if (containerRef.current && containerRef.current.children[0]) {
                        const firstChild = containerRef.current.children[0] as HTMLElement;
                        firstChild.style.width = "100%";
                        firstChild.style.height = "100%";
                    }

                    if (isMounted) {
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error("Error embedding Superset dashboard:", error);
                    
                    if (retryCount < maxRetries) {
                        retryCount++;
                        
                        // Clear any cached token and wait briefly before retry
                        await getGuestToken(dashboardId, true); 
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
                        return attemptLoad();
                    }

                    setError(error instanceof Error ? error.message : String(error));
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            await attemptLoad();
        };

        loadDashboard();

        return () => {
            isMounted = false;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [selectedFilter.date.from, selectedFilter.date.to, selectedFilter.selectedBranches, dashboardId]);

    return (
        <div className={`${styles.dashboardContainer} embedded-superset`} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
}