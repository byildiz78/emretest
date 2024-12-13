"use client";

import { Home, Brain, Bell, BarChart3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

interface MobileFooterProps {
    onNotificationsClick: () => void;
}

const navItems = [
    {
        label: "Ana Sayfa",
        icon: Home,
        href: "/[tenantId]/mobile",
    },
    {
        label: "Yapay Zeka",
        icon: Brain,
        href: "/[tenantId]/mobile/analyser",
    },
    {
        label: "Bildirimler",
        icon: Bell,
        href: "/[tenantId]/mobile/notifications",
    },
    {
        label: "Konuşarak Rapor",
        icon: BarChart3,
        href: "/[tenantId]/mobile/chatbot",
    },
];

export function MobileFooter({ onNotificationsClick }: MobileFooterProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Extract tenantId from the current pathname
    const tenantId = pathname.split('/')[1];

    const handleNavigation = (href: string) => {
        if (href.includes('[tenantId]')) {
            href = href.replace('[tenantId]', tenantId);
        }
        return href;
    };

    return (
        <>
            <Toaster />
            <nav className="fixed bottom-1 left-0 right-0 z-50">
                <div className="border-[3px] bg-background/95 backdrop-blur-xl rounded-xl shadow-[0_-8px_25px_-4px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-around p-2">
                        {navItems.map((item) => {
                            const isActive = pathname === handleNavigation(item.href);
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => {
                                        if (item.label === "Bildirimler") {
                                            onNotificationsClick();
                                        } else {
                                            router.push(handleNavigation(item.href));
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center flex-1 py-2 px-1"
                                >
                                    <motion.div
                                        initial={{ scale: 1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "flex flex-col items-center justify-center relative",
                                            isActive && "text-primary"
                                        )}
                                    >
                                        <item.icon className="h-6 w-6" />
                                        <span className="text-xs mt-1">{item.label}</span>
                                        {item.label === "Bildirimler" && (
                                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-medium text-primary-foreground rounded-full flex items-center justify-center">
                                                10
                                            </span>
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute -bottom-2 w-12 h-1 bg-primary rounded-full"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}
