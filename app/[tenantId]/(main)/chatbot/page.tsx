'use client'

import { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import ScaleLoader from "react-spinners/ScaleLoader";
import { ChatBot } from '@/types/tables';
import { useFilterStore } from '@/stores/filters-store';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MenuItem {
    id: string;
    title: string;
    icon: JSX.Element;
    bgColor: string;
    textColor: string;
}

export default function ChatBotComponent() {
    const [messages, setMessages] = useState<Array<{ role: 'assistant', content: string }>>([])
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

                // Append new chunk to buffer
                buffer += textDecoder.decode(value, { stream: true });

                // Process complete messages in buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (!firstMessageReceived && data.content) {
                                firstMessageReceived = true;
                                setIsLoading(false);
                            }

                            // Update message content efficiently
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

    return (
        <div className="flex h-screen">
            <div className={`w-64 bg-white shadow-lg transition-all overflow-y-auto
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
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500' 
                                : 'hover:bg-gray-100'
                            }`}
                        disabled={isLoading}
                    >
                        <div className={`${selectedMenu === item.id ? 'text-blue-500' : 'text-gray-500'}`}>
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
                
                {isLoading && (
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <ScaleLoader color="#4B5563" />
                        {chunkProgress && (
                            <div className="text-sm text-gray-600">
                                Processing chunk {chunkProgress.current} of {chunkProgress.total}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className="bg-white shadow rounded p-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Özel tablo stilleri
                                        table: ({node, ...props}) => (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200" {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => (
                                            <thead className="bg-gray-50" {...props} />
                                        ),
                                        th: ({node, ...props}) => (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                                        ),
                                        td: ({node, ...props}) => (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props} />
                                        ),
                                        // Kod bloğu stilleri
                                        code: ({node, inline, className, children, ...props}) => (
                                            <code
                                                className={`${className} ${inline ? 'bg-gray-100 rounded px-1' : 'block bg-gray-100 p-4 rounded-lg'}`}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        ),
                                        // Liste stilleri
                                        ul: ({node, ...props}) => (
                                            <ul className="list-disc pl-6 space-y-2" {...props} />
                                        ),
                                        ol: ({node, ...props}) => (
                                            <ol className="list-decimal pl-6 space-y-2" {...props} />
                                        ),
                                        // Başlık stilleri
                                        h1: ({node, ...props}) => (
                                            <h1 className="text-2xl font-bold mb-4" {...props} />
                                        ),
                                        h2: ({node, ...props}) => (
                                            <h2 className="text-xl font-bold mb-3" {...props} />
                                        ),
                                        h3: ({node, ...props}) => (
                                            <h3 className="text-lg font-bold mb-2" {...props} />
                                        ),
                                        // Link stilleri
                                        a: ({node, ...props}) => (
                                            <a className="text-blue-600 hover:text-blue-800" {...props} />
                                        ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}