'use client';

import { useState } from 'react';
import { Send, Bot } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIChatbotPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        // TODO: Implement actual AI API call here
        setTimeout(() => {
            const aiResponse: Message = {
                role: 'assistant',
                content: 'This is a sample response from the AI. The actual API integration needs to be implemented.'
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="w-full h-full px-4 py-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col h-[75vh] border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center gap-2">
                        <Bot className="w-6 h-6" />
                        <h1 className="text-xl font-semibold">AI Chatbot</h1>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                                <Bot className="w-12 h-12 opacity-20" />
                                <p>Sohbete başlamak için bir mesaj gönderin</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] rounded-2xl p-4 ${
                                        message.role === 'user'
                                            ? 'border-2 rounded-br-sm'
                                            : 'border rounded-bl-sm'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2">
                                <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="rounded-2xl rounded-bl-sm p-4 border">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Mesajınızı yazın..."
                                className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-1"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3 border rounded-xl hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatbotPage;