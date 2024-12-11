import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import {
    Bell,
    CheckCircle2,
    Ban,
    Tag,
    AlertCircle,
    ArrowUpRight,
    Clock
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import { Notification, OrderDetail } from "@/types/tables";
import { useOrderDetail } from "@/hooks/use-orderdetail";
import { OrderDetailDialog } from "./MobileDashboardOrderDetailDialog";
import { useFilterStore } from "@/stores/filters-store";
import { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationPanel() {
    const { selectedFilter} = useFilterStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    
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
                    color: "text-emerald-500",
                    borderColor: "border-emerald-500/30",
                    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
                    label: "Satış",
                };
            case "discount":
                return {
                    icon: Tag,
                    color: "text-blue-500",
                    borderColor: "border-blue-500/30",
                    bgColor: "bg-blue-50 dark:bg-blue-500/10",
                    label: "İndirim",
                };
            case "cancel":
                return {
                    icon: Ban,
                    color: "text-rose-500",
                    borderColor: "border-rose-500/30",
                    bgColor: "bg-rose-50 dark:bg-rose-500/10",
                    label: "İptal",
                };
            case "alert":
                return {
                    icon: AlertCircle,
                    color: "text-amber-500",
                    borderColor: "border-amber-500/30",
                    bgColor: "bg-amber-50 dark:bg-amber-500/10",
                    label: "Uyarı",
                };
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            if(selectedFilter.branches.length > 0){
                try {
                    setLoading(true);
                    setError(null)
                    const response = await axios.post<Notification[]>('/api/notifications', {
                       branches: selectedFilter.branches.map(item => item.BranchID) || [] 
                    });
    
                    if(response.status === 200){
                        setNotifications(response.data);
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
                } finally {
                    setLoading(false);
                }
            }
        };


        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [selectedFilter.branches]);

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />

            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-rose-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <p>Bildirimler yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="w-full max-w-md mx-auto">
                <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 pb-3">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-foreground" />
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-base font-semibold">
                                Bildirimler
                            </h2>
                        </div>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xs text-muted-foreground">
                            Canlı
                        </motion.div>
                    </div>

                    <div className="flex gap-1.5 px-3 mt-2">
                        {["sale", "discount", "cancel", "alert"].map((type) => {
                            const style = getNotificationStyle(
                                type as Notification["type"]
                            );
                            return (
                                <span
                                    key={type}
                                    className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                                        "hover:opacity-80 active:scale-95",
                                        style.bgColor,
                                        style.color
                                    )}
                                >
                                    {style.label}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div className="relative pl-6 pt-4">
                    <div className="absolute left-6 top-0 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                    {notifications.map((notification, index) => {
                        const style = getNotificationStyle(notification.type);
                        const Icon = style.icon;
                        const isLastItem = index === notifications.length - 1;

                        return (
                            <motion.div
                                key={notification.autoId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.05,
                                }}
                                className="relative mt-3 first:mt-0"
                            >
                                <div className={cn(
                                    "absolute left-0 top-3 w-6 h-px bg-border",
                                    "after:absolute after:w-2 after:h-2 after:rounded-full after:top-1/2 after:-translate-y-1/2 after:-right-1",
                                    style.borderColor,
                                    "after:border-2 after:border-current after:bg-background",
                                    style.color
                                )} />

                                {!isLastItem && (
                                    <div className="absolute left-6 top-6 bottom-0 w-px bg-border" />
                                )}

                                <div className="relative pl-10 pb-3">
                                    <button
                                        onClick={() => fetchOrderDetail(notification.orderKey)}
                                        disabled={loading}
                                        className={cn(
                                            "w-full group rounded-lg p-3 text-left transition-colors relative min-h-[100px]",
                                            "hover:bg-muted/50",
                                            loading && "opacity-50 cursor-not-allowed",
                                            style.borderColor,
                                            "border-2"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", style.color)} />

                                            <div className="flex-1 min-w-0">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <p className="text-sm font-medium truncate max-w-[200px]">
                                                            {notification.branchName}
                                                        </p>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>{notification.branchName}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <div className="flex items-baseline justify-center gap-1.5 mt-3 mb-8">
                                                    <p className={cn(
                                                        "text-lg font-semibold",
                                                        style.color
                                                    )}>
                                                        {formatCurrency(notification.amountDue)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 absolute bottom-3 left-3 text-xs font-medium text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatTime(notification.orderDateTime)}
                                                </div>
                                                <span className={cn(
                                                    "absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-xs font-medium",
                                                    style.bgColor,
                                                    style.color
                                                )}>
                                                    {notification.type === 'sale' ? 'satış' :
                                                        notification.type === 'discount' ? 'indirim' :
                                                            notification.type === 'cancel' ? 'iptal' : 'uyarı'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "absolute bottom-2 right-2 p-1 rounded-full",
                                            "opacity-0 group-hover:opacity-100 transition-opacity",
                                            "bg-foreground/5"
                                        )}>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <OrderDetailDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                orderDetail={orderDetail as OrderDetail | null}
                loading={loading}
            />
        </TooltipProvider>
    );
}