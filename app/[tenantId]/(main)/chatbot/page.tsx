'use client'

import { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { ChatBot } from '@/types/tables';
import { useFilterStore } from '@/stores/filters-store';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Database, Bot, Sparkles, Calendar, Building2, ArrowRight, ListFilter } from 'lucide-react'
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MenuItem {
    id: string;
    title: string;
    icon: JSX.Element;
    bgColor: string;
    textColor: string;
}

const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative w-24 h-24">
            {/* Outer spinning circle */}
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing bot icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-12 h-12 text-blue-500 animate-pulse" />
            </div>
        </div>
        
        <div className="space-y-3 text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Yapay Zeka Analizi Yapılıyor
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Sparkles className="w-4 h-4 animate-pulse text-yellow-500" />
                <span>Veriler işleniyor ve analiz ediliyor...</span>
            </div>
        </div>

        {/* Animated progress bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
        </div>
    </div>
);

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-block p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                    <Bot className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Yapay Zeka Analizine Hoş Geldiniz
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Analiz başlatmak için lütfen aşağıdaki adımları takip edin
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">1. Tarih Aralığı</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Üst menüden analiz yapmak istediğiniz tarih aralığını seçin
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">2. Şube Seçimi</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Üst menüden analiz yapmak istediğiniz şubeleri seçin
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                        <ListFilter className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">3. Analiz Türü</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sol menüden yapmak istediğiniz analiz türünü seçin
                        </p>
                    </div>
                </div>
            </div>

            {/* Arrow indicator pointing to sidebar */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 text-blue-500 dark:text-blue-400 animate-bounce">
                <ArrowRight className="w-6 h-6 -rotate-45" />
                <span className="text-sm font-medium">Analiz Seçin</span>
            </div>
        </div>
    </div>
);

export default function ChatBotComponent() {
    const [messages, setMessages] = useState<Array<{ role: 'assistant', content: string }>>([])
    const [rawData, setRawData] = useState<any[] | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number } | null>(null)
    const { selectedFilter } = useFilterStore();

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
        if (selectedMenu) {
            handleAnalyze(selectedMenu);
        }
    }, [selectedFilter.date.from, selectedFilter.date.to, selectedFilter.selectedBranches, selectedFilter.branches]);

    const handleAnalyze = async (menuId: string) => {
        if (!menuId) return;
        
        setIsLoading(true);
        setError(null);
        setMessages([]);
        setRawData(null);
        setSelectedMenu(menuId);

        try {
            const response = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ChatBotID: menuId,
                    date1: selectedFilter.date.from,
                    date2: selectedFilter.date.to,
                    branches: selectedFilter.selectedBranches.length > 0 ? selectedFilter.selectedBranches.map(item=> item.BranchID) : selectedFilter.branches.map(item=> item.BranchID) || []
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }
            
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            // Initialize the message once
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
                            
                            // Set raw data from the first message
                            if (!firstMessageReceived && data.rawData) {
                                setRawData(data.rawData);
                            }

                            if (!firstMessageReceived && data.content) {
                                firstMessageReceived = true;
                                setIsLoading(false);
                            }

                            setMessages(prev => [{
                                ...prev[0],
                                content: prev[0].content + data.content
                            }]);
                        } catch (e) {
                            console.error('Error parsing SSE message:', e);
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

    const renderDataTable = (data: any[]) => {
        if (!data || data.length === 0) return null;
        
        const columns = Object.keys(data[0]);
        
        return (
            <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {typeof row[column] === 'object' ? JSON.stringify(row[column]) : row[column]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex h-screen">
            <div className={`w-64 bg-white dark:bg-slate-800 shadow-lg transition-all overflow-y-auto
                border-r border-gray-200 dark:border-slate-700
                scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80
                ${isSidebarOpen ? '' : '-translate-x-full'}`}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleAnalyze(item.id)}
                        className={`w-full p-4 text-left flex items-center gap-2 transition-colors
                            ${selectedMenu === item.id 
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-4 border-blue-500' 
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'
                            }`}
                        disabled={isLoading}
                    >
                        <div className={`${selectedMenu === item.id 
                            ? 'text-blue-500 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.icon}
                        </div>
                        <span>{item.title}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 p-4 overflow-auto
                scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl">
                        <LoadingAnimation />
                    </div>
                ) : messages.length > 0 || rawData ? (
                    <Tabs defaultValue="analysis" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger 
                                value="analysis" 
                                icon={<MessageSquare className="w-4 h-4" />}
                            >
                                Yapay Zeka Analizi
                            </TabsTrigger>
                            <TabsTrigger 
                                value="data" 
                                icon={<Database className="w-4 h-4" />}
                            >
                                Ham Veri
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="analysis" className="space-y-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20">
                                        <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Yapay Zeka Analiz Sonucu
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Seçili tarih aralığı ve şubeler için analiz raporu
                                        </p>
                                    </div>
                                </div>

                                {/* Date and Branch Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4 border border-blue-100/50 dark:border-blue-900/30">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-medium">Tarih Aralığı</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {format(new Date(selectedFilter.date.from || new Date()), 'd MMMM yyyy', { locale: tr })} - {format(new Date(selectedFilter.date.to || ''), 'd MMMM yyyy', { locale: tr })}
                                        </div>
                                    </div>
                                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4 border border-blue-100/50 dark:border-blue-900/30">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                            <Building2 className="w-4 h-4" />
                                            <span className="font-medium">Seçili Şubeler</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                            {selectedFilter.selectedBranches.length > 0 
                                                ? selectedFilter.selectedBranches.map(branch => branch.BranchName).join(', ')
                                                : selectedFilter.branches.map(branch => branch.BranchName).join(', ')}
                                        </div>
                                    </div>
                                </div>

                                {messages.map((message, index) => (
                                    <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-md border border-blue-100/50 dark:border-blue-900/30">
                                        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-blue-900 dark:prose-headings:text-blue-100 prose-p:text-gray-600 dark:prose-p:text-gray-300">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({node, ...props}) => (
                                                        <div className="overflow-x-auto my-8 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-sm">
                                                            <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-900/50" {...props} />
                                                        </div>
                                                    ),
                                                    tr: ({node, ...props}) => (
                                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors" {...props} />
                                                    ),
                                                    th: ({node, ...props}) => (
                                                        <th className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/20 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider" {...props} />
                                                    ),
                                                    td: ({node, ...props}) => (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300" {...props} />
                                                    ),
                                                    p: ({node, ...props}) => (
                                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed my-4" {...props} />
                                                    ),
                                                    h1: ({node, ...props}) => (
                                                        <div className="flex items-center gap-2 my-6">
                                                            <Sparkles className="w-5 h-5 text-blue-500" />
                                                            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100" {...props} />
                                                        </div>
                                                    ),
                                                    h2: ({node, ...props}) => (
                                                        <div className="flex items-center gap-2 my-5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200" {...props} />
                                                        </div>
                                                    ),
                                                    h3: ({node, ...props}) => (
                                                        <div className="flex items-center gap-2 my-4">
                                                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                                                            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300" {...props} />
                                                        </div>
                                                    ),
                                                    ul: ({node, ...props}) => (
                                                        <ul className="list-none space-y-2 my-4" {...props} />
                                                    ),
                                                    ol: ({node, ...props}) => (
                                                        <ol className="list-none space-y-2 my-4 counter-reset: item" {...props} />
                                                    ),
                                                    li: ({node, ...props}) => (
                                                        <li className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                            <div {...props} > </div>
                                                        </li>
                                                    ),
                                                    code: ({node, inline, ...props}) => (
                                                        inline ? 
                                                            <code className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-sm font-mono text-blue-600 dark:text-blue-300" {...props} /> :
                                                            <code className="block p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-sm font-mono text-blue-600 dark:text-blue-300 overflow-x-auto my-4" {...props} />
                                                    ),
                                                    blockquote: ({node, ...props}) => (
                                                        <blockquote className="border-l-4 border-blue-400 pl-4 italic text-blue-600 dark:text-blue-300 my-4 bg-blue-50/50 dark:bg-blue-900/20 py-2 rounded-r-lg" {...props} />
                                                    ),
                                                    hr: ({node, ...props}) => (
                                                        <hr className="my-8 border-blue-200 dark:border-blue-900/50" {...props} />
                                                    ),
                                                    a: ({node, ...props}) => (
                                                        <a className="text-blue-600 dark:text-blue-400 hover:underline decoration-2 decoration-blue-300 dark:decoration-blue-700" {...props} />
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="data">
                            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20">
                                        <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Ham Veri Görünümü
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Analiz için kullanılan kaynak veriler
                                        </p>
                                    </div>
                                </div>
                                {rawData && renderDataTable(rawData)}
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <WelcomeScreen />
                )}
            </div>
        </div>
    );
}