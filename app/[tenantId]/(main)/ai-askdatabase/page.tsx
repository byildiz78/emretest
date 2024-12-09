"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Database, MessageSquare, MicIcon, Search, TrendingUp, Clock } from "lucide-react";

export default function AskDatabasePage() {
    const [iframeUrl, setIframeUrl] = useState("");

    useEffect(() => {
        fetch("/api/ai/ask_database", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((res) => res.json())
            .then(({ url }) => {
                setIframeUrl(url);
            })
            .catch((error) => {
                console.error("Error loading chatbot:", error);
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 px-4 py-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl flex flex-col items-center"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <Database className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                        Veri Tabanı ile Sohbet
                    </h1>
                </div>

                <div className="relative w-full max-w-2xl mb-4">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-4"
                    >
                        <p className="text-base md:text-lg text-muted-foreground">
                            Veri tabanınızdaki bilgileri doğal dil ile sorgulayın
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                "En çok satılan 5 ürünü göster"
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                "Geçen ayın ciro toplamını söyle"
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Search className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                "Bu hafta en az satılan ürünler"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <div className="w-full max-w-5xl">
                {!iframeUrl ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full aspect-[16/9] rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Yapay zeka modeli yükleniyor...
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/80">
                                <MicIcon className="h-3 w-3" />
                                <span>Mikrofon izni istenebilir</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
                    >
                        <iframe
                            className="w-full rounded-lg"
                            style={{
                                height: "calc(100vh - 420px)",
                                minHeight: "300px",
                                maxHeight: "600px",
                            }}
                            src={iframeUrl}
                            allow="microphone"
                        />
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-muted-foreground"
                >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                        <Database className="h-4 w-4 text-primary" />
                        <span>Gerçek zamanlı veri</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                        <Bot className="h-4 w-4 text-primary" />
                        <span>Yapay zeka destekli</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>Doğal dil desteği</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
