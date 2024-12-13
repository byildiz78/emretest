'use client';

import { useState, useRef } from 'react';
import { Send, Bot, Database, TrendingUp, Clock, Search } from 'lucide-react';
import axios from 'axios';
import { useFilterStore } from '@/stores/filters-store';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: any;
}

const AIChatbotPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { selectedFilter } = useFilterStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatValue = (value: any) => {
        if (typeof value === 'number') {
            return value.toLocaleString('tr-TR');
        }
        return value;
    };

    const renderTableContent = (content: any[]) => {
        if (!Array.isArray(content) || content.length === 0) return null;

        const headers = Object.keys(content[0]);

        return (
            <div className="overflow-x-auto w-full">
                <table className="min-w-full border-collapse bg-white dark:bg-gray-900">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="border px-4 py-2 bg-gray-50 dark:bg-gray-950 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {content.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                {headers.map((header, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="border px-4 py-2 text-sm text-gray-700 dark:text-gray-400"
                                    >
                                        {formatValue(row[header])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const tempInputText = input;
        setInput('');
        
        const userMessage: Message = {
            role: 'user',
            content: tempInputText, 
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setLoadingMessage('Başlatılıyor...');

        try {
            const response = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    branches: (selectedFilter.selectedBranches.length ===  selectedFilter.branches.length || selectedFilter.selectedBranches.length ===  0) 
                        ? 'all' 
                        : (selectedFilter.selectedBranches.length > 0 
                        ? selectedFilter.selectedBranches.map(item => item.BranchID) 
                        : selectedFilter.branches.map(item => item.BranchID) || []),
                    message: tempInputText,
                    ChatBotID: '999', // String olarak gönderiyoruz
                    oldMessages: messages.map((item) => {
                        if(item.role === 'user') {
                            return "Kullanıcı: " +  item.content;
                        }else{
                            return "Sen: " +  item.content;
                        }
                    })
                }),
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Stream not available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.status === 'progress') {
                                setLoadingMessage(data.message);
                            } else if (data.status === 'complete') {
                                const assistantMessage: Message = {
                                    role: 'assistant',
                                    content: data.data,
                                };
                                setMessages(prev => [...prev, assistantMessage]);
                                setIsLoading(false);
                            } else if (data.status === 'error') {
                                const errorMessage: Message = {
                                    role: 'assistant',
                                    content: data.error,
                                };
                                setMessages(prev => [...prev, errorMessage]);
                                setIsLoading(false);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            let errorContent = 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
            
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    errorContent = error.response.data;
                }
            }
        
            const errorMessage: Message = {
                role: 'assistant',
                content: errorContent,
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 px-4 py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl mx-auto flex flex-col items-center"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 dark:bg-gradient-to-br from-primary/10 to-primary/20">
                        <Database className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent dark:from-primary/90 dark:via-primary/70 dark:to-primary/90">
                        Veri Tabanı ile Sohbet
                    </h1>
                </div>

                <div className="relative w-full max-w-2xl mb-4">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-4"
                    >
                        <p className="text-base md:text-lg text-muted-foreground dark:text-gray-400">
                            Veri tabanınızdaki bilgileri doğal dil ile sorgulayın
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                "En çok satılan 5 ürünü göster"
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                "Geçen ayın ciro toplamını söyle"
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                                <Search className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                "Bu haftaki en az satılan ürünler"
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border dark:border-gray-800"
                >
                    <div className="flex flex-col h-[50vh] w-full">
                        <div className="px-6 py-4 border-b flex items-center gap-2">
                            <Bot className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">robotPOS AI</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground dark:text-gray-400">
                                    <Bot className="w-12 h-12 opacity-20 dark:opacity-10" />
                                    <p>Sohbete başlamak için bir mesaj gönderin</p>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index}
                                    className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full border dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-2xl p-4 ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-sm dark:from-primary/90 dark:to-primary/80'
                                                : 'border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-bl-sm'
                                        }`}
                                    >
                                        {Array.isArray(message.content) && message.role === 'assistant' && message.content.length > 0 && typeof message.content[0] === 'object'
                                            ? renderTableContent(message.content)
                                            : Array.isArray(message.content) 
                                                ? message.content[0]
                                                : typeof message.content === 'string' 
                                                    ? <ReactMarkdown 
                                                        components={{
                                                            pre: ({node, ...props}) => (
                                                                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2 overflow-x-auto" {...props} />
                                                            ),
                                                            code: ({node, ...props}) => (
                                                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded" {...props} />
                                                            ),
                                                            h1: ({node, ...props}) => (
                                                                <h1 className="text-2xl font-bold my-4" {...props} />
                                                            ),
                                                            h2: ({node, ...props}) => (
                                                                <h2 className="text-xl font-bold my-3" {...props} />
                                                            ),
                                                            h3: ({node, ...props}) => (
                                                                <h3 className="text-lg font-bold my-2" {...props} />
                                                            ),
                                                            ul: ({node, ...props}) => (
                                                                <ul className="list-disc ml-4 my-2" {...props} />
                                                            ),
                                                            ol: ({node, ...props}) => (
                                                                <ol className="list-decimal ml-4 my-2" {...props} />
                                                            ),
                                                            li: ({node, ...props}) => (
                                                                <li className="my-1" {...props} />
                                                            ),
                                                            p: ({node, ...props}) => (
                                                                <p className="my-2" {...props} />
                                                            ),
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                    : message.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-end gap-2"
                                >
                                    <div className="w-6 h-6 rounded-full border dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="rounded-2xl rounded-bl-sm p-4 border dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{loadingMessage}</span>
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-primary/50 dark:bg-primary/50 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-primary/50 dark:bg-primary/50 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-primary/50 dark:bg-primary/50 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} /> {/* Scroll anchor */}
                        </div>

                        <div className="px-6 py-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Bir mesaj yazın..."
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-gray-200 dark:placeholder-gray-400"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5 text-primary" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AIChatbotPage;