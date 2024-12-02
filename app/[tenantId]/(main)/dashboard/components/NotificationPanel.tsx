"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { motion } from "framer-motion";
import {
    Bell,
    CheckCircle2,
    Ban,
    Tag,
    Receipt,
    TrendingDown,
    AlertCircle,
    Loader2,
    ChevronRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Notification } from "@/types/tables";
import { useOrderDetail } from "@/hooks/use-orderdetail";
import { OrderDetailDialog } from "./OrderDetailDialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export default function NotificationPanel() {
    const { notifications, loading, error } = useNotifications();
    const {
        isOpen,
        setIsOpen,
        orderDetail,
        fetchOrderDetail,
    } = useOrderDetail();

    const getNotificationStyle = (type: Notification["type"]) => {
        switch (type) {
            case "sale":
                return {
                    icon: CheckCircle2,
                    color: "text-green-500",
                    bgColor: "bg-gradient-to-br from-green-50 via-green-100/90 to-green-50 dark:from-green-500/5 dark:via-green-500/10 dark:to-green-500/5",
                    borderColor: "border-green-200/50 dark:border-green-500/20",
                    label: "Satış",
                    labelClass: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 shadow-sm shadow-green-500/10",
                    buttonClass: "hover:bg-green-200/50 dark:hover:bg-green-500/20",
                    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500",
                };
            case "discount":
                return {
                    icon: Tag,
                    color: "text-blue-500",
                    bgColor: "bg-gradient-to-br from-blue-50 via-blue-100/90 to-blue-50 dark:from-blue-500/5 dark:via-blue-500/10 dark:to-blue-500/5",
                    borderColor: "border-blue-200/50 dark:border-blue-500/20",
                    label: "İndirim",
                    labelClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm shadow-blue-500/10",
                    buttonClass: "hover:bg-blue-200/50 dark:hover:bg-blue-500/20",
                    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500",
                };
            case "cancel":
                return {
                    icon: Ban,
                    color: "text-red-500",
                    bgColor: "bg-gradient-to-br from-red-50 via-red-100/90 to-red-50 dark:from-red-500/5 dark:via-red-500/10 dark:to-red-500/5",
                    borderColor: "border-red-200/50 dark:border-red-500/20",
                    label: "İptal",
                    labelClass: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 shadow-sm shadow-red-500/10",
                    buttonClass: "hover:bg-red-200/50 dark:hover:bg-red-500/20",
                    iconBg: "bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500",
                };
            case "alert":
                return {
                    icon: AlertCircle,
                    color: "text-amber-500",
                    bgColor: "bg-gradient-to-br from-amber-50 via-amber-100/90 to-amber-50 dark:from-amber-500/5 dark:via-amber-500/10 dark:to-amber-500/5",
                    borderColor: "border-amber-200/50 dark:border-amber-500/20",
                    label: "Uyarı",
                    labelClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm shadow-amber-500/10",
                    buttonClass: "hover:bg-amber-200/50 dark:hover:bg-amber-500/20",
                    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500",
                };
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <p>Bildirimler yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <>
            <div>
                <div className="bg-background/95 backdrop-blur-sm pb-4">
                    <div className="flex flex-row items-center sm:justify-between justify-center mb-4 gap-3 p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-foreground" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-lg font-semibold">
                                Olay Bildirimleri
                            </h2>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-2 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground ml-2">
                            Canlı
                        </motion.div>
                    </div>

                    <div className="flex gap-2">
                        {["sale", "discount", "cancel", "alert"].map((type) => {
                            const style = getNotificationStyle(
                                type as Notification["type"]
                            );
                            return (
                                <span
                                    key={type}
                                    className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity",
                                        style.labelClass
                                    )}
                                >
                                    {style.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-2.5 p-4 sm:p-0 pr-2 sm:pr-2 overflow-y-auto max-h-[calc(70vh)] 
                     [&::-webkit-scrollbar]:w-2
                     [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-track]:bg-transparent
                     dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                     hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                     dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                    {notifications.map((notification, index) => {
                        const style = getNotificationStyle(notification.type);
                        const Icon = style.icon;

                        return (
                            <motion.div
                                key={notification.autoId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                className={cn(
                                    "group relative rounded-xl transition-all duration-300 backdrop-blur-sm border overflow-hidden",
                                    "hover:shadow-lg hover:shadow-foreground/5",
                                    style.bgColor,
                                    style.borderColor,
                                    "hover:-translate-y-0.5"
                                )}
                            >
                                <div className="relative flex items-center gap-3 p-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                        style.iconBg,
                                        "shadow-lg shadow-foreground/5 group-hover:shadow-xl",
                                        "ring-1 ring-white/20"
                                    )}>
                                        <Icon className="h-5 w-5 flex-shrink-0 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="font-medium text-sm text-foreground/90 truncate cursor-pointer">
                                                                {notification.branchName}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {notification.branchName}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap",
                                                    "transition-all duration-300 group-hover:scale-105",
                                                    "ring-1 ring-border/50",
                                                    style.labelClass
                                                )}>
                                                    {style.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-background/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                {formatTime(notification.orderDateTime)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-1.5 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm w-fit">
                                            <Receipt className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            <span className="text-xs text-muted-foreground/70">
                                                {notification.logDetail}
                                            </span>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn(
                                                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                                    "bg-background/70 backdrop-blur-sm shadow-sm",
                                                    "ring-1 ring-border/50 group-hover:ring-border",
                                                    "transition-all duration-300 group-hover:scale-105"
                                                )}>
                                                    <TrendingDown className={cn("h-3.5 w-3.5", style.color)} />
                                                    <span>{formatCurrency(notification.amountDue)}</span>
                                                </div>

                                                {notification.discountAmount > 0 && (
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                                        "bg-blue-500/10 text-blue-500 shadow-sm shadow-blue-500/10",
                                                        "ring-1 ring-blue-500/20 group-hover:ring-blue-500/30",
                                                        "transition-all duration-300 group-hover:scale-105"
                                                    )}>
                                                        <Tag className="h-3 w-3" />
                                                        {formatCurrency(notification.discountAmount)}
                                                    </div>
                                                )}
                                                {notification.voidAmount > 0 && (
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                                        "bg-red-500/10 text-red-500 shadow-sm shadow-red-500/10",
                                                        "ring-1 ring-red-500/20 group-hover:ring-red-500/30",
                                                        "transition-all duration-300 group-hover:scale-105"
                                                    )}>
                                                        <Ban className="h-3 w-3" />
                                                        {formatCurrency(notification.voidAmount)}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => fetchOrderDetail(notification.orderKey)}
                                                disabled={loading}
                                                className={cn(
                                                    "ml-auto text-[10px] font-medium transition-all duration-300",
                                                    "flex items-center gap-1.5 px-2 py-1 rounded-md",
                                                    "bg-background/70 backdrop-blur-sm hover:bg-background/90",
                                                    "ring-1 ring-border/50 hover:ring-border",
                                                    "shadow-sm hover:shadow-md",
                                                    "active:scale-[0.98] hover:scale-105",
                                                    loading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                Detay
                                                <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <OrderDetailDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                orderDetail={orderDetail as Array<{
                    header: string;
                    payments: string;
                    transactions: string;
                }> | null}
                loading={loading}
            />
        </>
    );
}
