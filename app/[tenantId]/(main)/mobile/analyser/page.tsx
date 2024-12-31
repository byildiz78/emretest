'use client'

import { useState, useEffect, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import { ChatBot } from '@/types/tables';
import { useFilterStore } from '@/stores/filters-store';
import { Bot, Sparkles, Calendar, Building2, ArrowRight, ArrowLeft, Home } from 'lucide-react'
import { FilterInfo } from './components/filter-info';
import { LoadingAnimation } from './components/loading-animation';
import WelcomeScreen from './components/welcome-screen';
import { BalanceCard } from './components/balance-card';
import { MessageContent } from './components/message-content';
import { Balance, MenuItem } from './types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter, useParams } from 'next/navigation';
import { AnalysisStages } from './components/analysis-stages';
import { AnalysisTypeGrid } from './components/analysis-type-grid';
import { AnimatedHeader } from './components/animated-header';

export default function MobileChatBotComponent() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Array<{ role: 'assistant', content: string }>>([])
    const [rawData, setRawData] = useState<any[] | null>(null)
    const [balanceData, setBalanceData] = useState<Balance | null>(null)
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<'welcome' | 'filter' | 'analysis' | 'result'>('welcome')
    const [analysisStage, setAnalysisStage] = useState<'preparing' | 'querying' | 'analyzing' | 'complete'>('preparing')
    const { selectedFilter } = useFilterStore();
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch('/api/ai/analyser_menu_items');
                if (!response.ok) throw new Error('Failed to fetch menu items');
                const data = await response.json();

                const transformedItems = data.map((item: ChatBot) => {
                    const IconComponent = (LucideIcons as any)[item.Icon] || LucideIcons.HandCoins;
                    return {
                        id: item.ChatBotID,
                        title: item.AnalysisTitle,
                        icon: <IconComponent className="w-4 h-4" />,
                        bgColor: '',
                        textColor: ''
                    };
                });

                setMenuItems(transformedItems);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch menu items');
            }
        };

        fetchMenuItems();
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages, balanceData])

    const handleAnalyze = async (menuId: string) => {
        if (!menuId) return;

        setIsLoading(true);
        setError(null);
        setMessages([]);
        setRawData(null);
        setBalanceData(null);
        setSelectedMenu(menuId);
        setStep('result');
        setAnalysisStage('preparing');

        try {


            setAnalysisStage('querying');

            const response = await fetch('/api/ai/analyser', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    ChatBotID: menuId,
                    date1: selectedFilter.date.from,
                    date2: selectedFilter.date.to,
                    branches: selectedFilter.selectedBranches.length > 0 
                        ? selectedFilter.selectedBranches.map(item => item.BranchID) 
                        : selectedFilter.branches.map(item => item.BranchID) || []
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', errorText);
                throw new Error(`Analysis failed: ${response.status} ${errorText}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            setMessages([{ role: 'assistant', content: '' }]);
            let firstMessageReceived = false;

            setAnalysisStage('analyzing');

            const textDecoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setAnalysisStage('complete');
                    break;
                }

                const chunk = textDecoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.balance) {
                                setBalanceData(data.balance);
                            } else {
                                if (!firstMessageReceived && data.rawData) {
                                    setRawData(data.rawData);
                                }

                                if (!firstMessageReceived && data.content) {
                                    firstMessageReceived = true;
                                    setIsLoading(false);
                                }

                                setMessages(prev => [{
                                    ...prev[0],
                                    content: prev[0].content + (data.content || '')
                                }]);
                            }
                        } catch (parseError) {
                            console.error('Error parsing SSE data:', parseError);
                        }
                    }
                }
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col bg-gray-50 dark:bg-slate-900">
            <AnimatedHeader step={step} selectedFilter={selectedFilter} />
            
            {step === 'welcome' && (
                <div className="flex flex-col">
                    <div className="flex-1">
                        <WelcomeScreen />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                        <Button 
                            className="w-full" 
                            onClick={() => setStep('filter')}
                        >
                            Başla
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
            {step === 'filter' && (
                <div className="flex flex-col">
                    <div className="p-4 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">Tarih Aralığı</h2>
                                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border w-full">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {format(selectedFilter.date.from, "d MMMM yyyy", { locale: tr })} -{" "}
                                        {format(selectedFilter.date.to, "d MMMM yyyy", { locale: tr })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">Şubeler</h2>
                                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border w-full">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {selectedFilter.selectedBranches.length > 0
                                            ? `${selectedFilter.selectedBranches.length} şube seçili`
                                            : "Tüm şubeler"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full" 
                            onClick={() => setStep('analysis')}
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Devam Et
                        </Button>
                    </div>
                </div>
            )}
            {step === 'analysis' && (
                <div className="flex flex-col">
                    <div className="p-4 space-y-6">
                        <AnalysisTypeGrid
                            menuItems={menuItems}
                            selectedMenu={selectedMenu}
                            onSelect={(id) => {
                                setSelectedMenu(id);
                                handleAnalyze(id);
                            }}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
            {step === 'result' && (
                <div className="flex flex-col">
                    <div className="p-4 space-y-6">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-destructive/50"
                                >
                                    <path d="M12 8v4" />
                                    <path d="M12 16h.01" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
                                    <p className="text-sm text-destructive/80">{error}</p>
                                </div>
                            </div>
                        ) : isLoading ? (
                            <div className="p-4">
                                <AnalysisStages currentStage={analysisStage} />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto p-4" ref={containerRef}>
                                {messages.map((message, index) => (
                                    <MessageContent key={index} content={message.content} />
                                ))}
                                {balanceData && <BalanceCard balance={balanceData} />}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
