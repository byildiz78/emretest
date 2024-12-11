import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCircle2,
    Ban,
    Tag,
    AlertCircle,
    Loader2,
    ArrowUpRight,
    Clock,
    X
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
import { OrderDetailDialog } from "@/app/[tenantId]/(main)/dashboard/components/OrderDetailDialog";
import { Card } from "@/components/ui/card";
import { useFilterStore } from "@/stores/filters-store";
import { useEffect, useState } from "react";
import axios from "axios";
import { useExpo } from "@/hooks/use-expo";

interface MobileNotificationsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileNotifications({ isOpen, onClose }: MobileNotificationsProps) {
    const { selectedFilter} = useFilterStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    
    const {
        isOpen: isOrderDetailOpen,
        setIsOpen: setOrderDetailOpen,
        orderDetail,
        fetchOrderDetail,
    } = useOrderDetail();


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

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute inset-x-0 bottom-0 h-[85vh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl"
            >
                <TooltipProvider>
                    <div className="w-full">
                        <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 pb-3 border-b">
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
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-xs text-muted-foreground"
                                    >
                                        Canlı
                                    </motion.div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-1.5 px-3 mt-2 overflow-x-auto pb-2">
                                {["sale", "discount", "cancel", "alert"].map((type) => {
                                    const style = getNotificationStyle(
                                        type as Notification["type"]
                                    );
                                    return (
                                        <span
                                            key={type}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
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

                        <div className="overflow-y-auto max-h-[calc(85vh-5rem)]">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-64 text-rose-500">
                                    <AlertCircle className="h-6 w-6 mr-2" />
                                    <p>Bildirimler yüklenirken hata oluştu</p>
                                </div>
                            ) : (
                                <div className="relative pl-6 pt-4 pb-20">
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

                                                <div className="relative pl-10 pb-3 px-4">
                                                    <button
                                                        onClick={() => fetchOrderDetail(notification.orderKey)}
                                                        disabled={loading}
                                                        className={cn(
                                                            "w-full group rounded-lg p-3 text-left transition-colors relative min-h-[100px]",
                                                            "hover:bg-muted/50 active:scale-[0.99]",
                                                            loading && "opacity-50 cursor-not-allowed",
                                                            style.borderColor,
                                                            "border-2"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", style.color)} />
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium line-clamp-1">
                                                                    {notification.branchName}
                                                                </p>
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
                            )}
                        </div>
                    </div>

                    <OrderDetailDialog
                        isOpen={isOrderDetailOpen}
                        onOpenChange={setOrderDetailOpen}
                        orderDetail={orderDetail as OrderDetail | null}
                        loading={loading}
                    />
                </TooltipProvider>
            </motion.div>
        </motion.div>
    );
}
