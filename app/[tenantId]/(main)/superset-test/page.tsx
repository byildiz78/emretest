'use client'

import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect, useRef, useState } from "react";

const SUPERSET_BASE_URL = process.env.NEXT_PUBLIC_SUPERSET_BASE_URL;

interface TestConfig {
    dashboardId: string;
    databaseName: string;
}

interface TokenResponse {
    guest_token: string;
    dashboard_id: string;
    database_name: string;
}

export default function SupersetTestPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<TestConfig>({
        dashboardId: '',
        databaseName: 'PfCemilUsta'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = async (forceRefresh: boolean = false) => {
        if (!containerRef.current || !config.dashboardId || !config.databaseName) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Mevcut dashboard'u temizle
            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }

            // Test token'ı al
            const tokenResponse = await fetch('/api/superset/test-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dashboard_id: config.dashboardId,
                    database_name: config.databaseName,
                    force_refresh: forceRefresh
                }),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                throw new Error(`Token alınamadı: ${errorData.message || errorData.error || 'Bilinmeyen hata'}`);
            }

            const tokenData = await tokenResponse.json() as TokenResponse;

            if (!tokenData.guest_token) {
                throw new Error('Guest token alınamadı: Token boş döndü');
            }

            // Dashboard'u embed et
            const dashboard = await embedDashboard({
                id: config.dashboardId,
                supersetDomain: SUPERSET_BASE_URL || '',
                mountPoint: containerRef.current,
                fetchGuestToken: () => Promise.resolve(tokenData.guest_token),
                dashboardUiConfig: {
                    hideTitle: false,
                    hideTab: false,
                    hideChartControls: false,
                }
            });

            // Embed edilen iframe'in boyutlarını ayarla
            if (containerRef.current && containerRef.current.children[0]) {
                const iframe = containerRef.current.children[0] as HTMLElement;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';

                // Filter değerini güncelle
                const urlParams = new URLSearchParams(iframe.getAttribute('src') || '');
                urlParams.set('preselect_filters', JSON.stringify({
                    'db_filter': config.databaseName
                }));
                
                const currentSrc = iframe.getAttribute('src') || '';
                const baseUrl = currentSrc.split('?')[0];
                iframe.setAttribute('src', `${baseUrl}?${urlParams.toString()}`);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
            console.error('Dashboard yükleme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    // Component unmount olduğunda cleanup yap
    useEffect(() => {
        return () => {
            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
        };
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 space-y-4 max-w-screen-xl mx-auto w-full">
                <div className="space-y-4 bg-white p-4 rounded-lg shadow">
                    <h1 className="text-2xl font-bold">Superset Test Sayfası</h1>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Veritabanı Adı:
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        value={config.databaseName}
                                        onChange={(e) => setConfig(prev => ({ ...prev, databaseName: e.target.value }))}
                                        placeholder="Örn: PfCemilUsta"
                                    />
                                </label>
                                <p className="text-sm text-gray-500">
                                    Örnek: PfCemilUsta, PfMahmutUsta
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Dashboard ID:
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        value={config.dashboardId}
                                        onChange={(e) => setConfig(prev => ({ ...prev, dashboardId: e.target.value }))}
                                        placeholder="Örn: cb654ce7-794b-4322-bf73-7fafb2675ee6"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => loadDashboard(false)}
                                disabled={loading}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {loading ? 'Yükleniyor...' : 'Dashboard\'u Yükle'}
                            </button>

                            <button
                                onClick={() => loadDashboard(true)}
                                disabled={loading}
                                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
                            >
                                Force Refresh
                            </button>
                        </div>

                        {error && (
                            <div className="text-red-500 mt-2">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div 
                    className="flex-1 relative bg-white rounded-lg shadow overflow-hidden min-h-[700px]" 
                >
                    <div 
                        ref={containerRef} 
                        className="absolute inset-0"
                        style={{ width: '100%', height: '100%' }}
                    />
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                            <div className="text-lg">Yükleniyor...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
