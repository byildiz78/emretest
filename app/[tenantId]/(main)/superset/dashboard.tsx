'use client'
import { useFilterStore } from "@/stores/filters-store";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams } from 'next/navigation';
import { useDatabase } from '@/hooks/use-database';

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
    const mountedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedFilter } = useFilterStore();
    const params = useParams();
    const tenantId = params.tenantId as string;
    const { database } = useDatabase(tenantId);

    if (!SUPERSET_BASE_URL) {
        return <div>Hata: Ayarlar Alınamadı</div>;
    }

    const filterParams = useMemo(() => {
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
        if (selectedFilter.selectedBranches.length > 0) {
            params.branchids = selectedFilter.selectedBranches.map(branch => branch.BranchID).join(',');
        }
        if (selectedFilter.date.from) params.start_time = formatDate(selectedFilter.date.from);
        if (selectedFilter.date.to) params.end_time = formatDate(selectedFilter.date.to);
        if(standalone) params.standalone = standalone.toString();
        if (database?.database) {
            params.database = database.database;
        }
        return extraParams ? {...params, ...extraParams} : params;
    }, [selectedFilter.date.from, selectedFilter.date.to, selectedFilter.selectedBranches, standalone, database?.database, extraParams]);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }

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
                    console.log('Dashboard yüklenirken parametreler:', filterParams);
                    
                    await embedDashboard({
                        id: dashboardId,
                        supersetDomain: SUPERSET_BASE_URL,
                        mountPoint: containerRef.current!,
                        fetchGuestToken: () => guestToken,
                        dashboardUiConfig: {
                            hideTitle: true,
                            hideTab: false,
                            hideChartControls: false,
                            urlParams: filterParams
                        }
                    });

                    if (containerRef.current?.children[0]) {
                        const firstChild = containerRef.current.children[0] as HTMLElement;
                        firstChild.style.width = "100%";
                        firstChild.style.height = "100%";
                    }

                    setIsLoading(false);
                } catch (error) {
                    console.error("Error embedding Superset dashboard:", error);
                    
                    if (retryCount < maxRetries) {
                        retryCount++;
                        await getGuestToken(dashboardId, true);
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
                        return attemptLoad();
                    }

                    setError(error instanceof Error ? error.message : String(error));
                    setIsLoading(false);
                }
            };

            await attemptLoad();
        };

        loadDashboard();

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [dashboardId, filterParams]);

    return (
        <div className={`${styles.dashboardContainer} embedded-superset`} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
}