'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Database, TrendingUp, Clock, Search } from 'lucide-react';
import axios from 'axios';
import { useFilterStore } from '@/stores/filters-store';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: any;
}

export default function MobileChatbotPage() {
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setLoadingMessage('Yanıt hazırlanıyor...');

        try {
            const response = await axios.post('/api/chat', {
                message: userMessage,
                filter: selectedFilter
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
            }]);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <h1 className="text-lg font-semibold">Konuşarak Rapor</h1>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 max-w-sm mx-auto px-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-4 text-center">
                                <div>
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                                        Merhaba! Size nasıl yardımcı olabilirim?
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Aşağıdaki örnek soruları sorabilir veya kendi sorunuzu yazabilirsiniz
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-muted-foreground">Örnek sorular:</p>
                                    <div className="grid gap-3">
                                        <button
                                            onClick={() => setInput("Son 7 günün satış raporu nedir?")}
                                            className="flex items-center gap-3 p-3 text-left rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Search className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm">Son 7 günün satış raporu nedir?</span>
                                        </button>
                                        <button
                                            onClick={() => setInput("Geçen aya göre satışlar nasıl?")}
                                            className="flex items-center gap-3 p-3 text-left rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm">Geçen aya göre satışlar nasıl?</span>
                                        </button>
                                        <button
                                            onClick={() => setInput("En çok satılan ürünler hangileri?")}
                                            className="flex items-center gap-3 p-3 text-left rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Database className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm">En çok satılan ürünler hangileri?</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex w-full",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2",
                                    message.role === 'user'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <div className="prose prose-sm dark:prose-invert">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            {loadingMessage}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-900 border-t">
                <div className="max-w-2xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 min-h-[40px] bg-transparent border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            input.trim() && !isLoading
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
