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
    const { selectedFilter } = useFilterStore();
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch('/api/ai/chatbot_menu_items');
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

        try {
            const response = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ChatBotID: menuId,
                    date1: selectedFilter.date.from,
                    date2: selectedFilter.date.to,
                    branches: selectedFilter.selectedBranches.length > 0 ? selectedFilter.selectedBranches.map(item => item.BranchID) : selectedFilter.branches.map(item => item.BranchID) || []
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            setMessages([{ role: 'assistant', content: '' }]);

            const textDecoder = new TextDecoder();
            let buffer = '';
            let firstMessageReceived = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += textDecoder.decode(value, { stream: true });

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
                        } catch (e) {
                            console.error('Error parsing SSE message:', e);
                        }
                    }
                }
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            setStep('analysis');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="font-semibold">Yapay Zeka Analizi</h1>
                    <p className="text-sm text-muted-foreground">
                        {step === 'welcome' && 'Hoş Geldiniz'}
                        {step === 'filter' && 'Filtre Seçimi'}
                        {step === 'analysis' && 'Analiz Seçimi'}
                        {step === 'result' && 'Analiz Sonucu'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {step !== 'welcome' && step !== 'filter' && (
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setStep(step === 'result' ? 'analysis' : 'filter')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/${tenantId}`)}
                >
                    <Home className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const renderFilterStep = () => (
        <div className="p-4 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Tarih Aralığı</h2>
                    <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                            {format(selectedFilter.date.from, "d MMMM yyyy", { locale: tr })} -{" "}
                            {format(selectedFilter.date.to, "d MMMM yyyy", { locale: tr })}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Şubeler</h2>
                    <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
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
                Devam Et
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );

    const renderAnalysisStep = () => (
        <div className="grid grid-cols-1 gap-2 p-4">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleAnalyze(item.id)}
                    disabled={isLoading}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all border
                        ${selectedMenu === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10">
                        {item.icon}
                    </div>
                    <span className="font-medium">{item.title}</span>
                </button>
            ))}
        </div>
    );

    const renderResultStep = () => (
        <div className="flex-1 p-4 space-y-4">
            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="bg-card shadow-lg rounded-xl">
                    <LoadingAnimation />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Chatbot Messages */}
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <MessageContent key={index} content={message.content} />
                        ))}
                    </div>

                    {/* Balance Card */}
                    {balanceData && <BalanceCard balance={balanceData} />}
                </div>
            )}
        </div>
    );

    if (step === 'welcome') {
        return (
            <div>
                {renderHeader()}
                <WelcomeScreen />
                <div className="fixed bottom-4 left-4 right-4">
                    <Button 
                        className="w-full" 
                        onClick={() => setStep('filter')}
                    >
                        Başla
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {renderHeader()}
            <div className="flex-1 overflow-y-auto">
                {step === 'filter' && renderFilterStep()}
                {step === 'analysis' && renderAnalysisStep()}
                {step === 'result' && renderResultStep()}
            </div>
        </div>
    );
}
