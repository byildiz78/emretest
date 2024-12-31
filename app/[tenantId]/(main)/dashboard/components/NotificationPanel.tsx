import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { Bell, CheckCircle2, Ban, Tag, AlertCircle, ArrowUpRight, Clock, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import { Notification, NotificationType, OrderDetail } from "@/types/tables";
import { useOrderDetail } from "@/hooks/use-orderdetail";
import { OrderDetailDialog } from "./OrderDetailDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import axios from "axios";
import { SettingsMenu } from "@/components/notifications/settings-menu";

interface NotificationStyle {
    icon: typeof CheckCircle2;
    color: string;
    borderColor: string;
    bgColor: string;
    label: string;
}

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

interface NotificationPanelProps {
    settings: Settings;
    settingsLoading: boolean;
    onSettingsChange: (settings: Settings) => void;
}

const DEFAULT_SETTINGS: Settings = {
    minDiscountAmount: 0,
    minCancelAmount: 0,
    minSaleAmount: 0
};

const NOTIFICATION_STYLES: Record<NotificationType, NotificationStyle> = {
    sale: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
        label: "Satış",
    },
    discount: {
        icon: Tag,
        color: "text-blue-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
        label: "İndirim",
    },
    cancel: {
        icon: Ban,
        color: "text-rose-500",
        borderColor: "border-rose-500/30",
        bgColor: "bg-rose-50 dark:bg-rose-500/10",
        label: "İptal",
    },
    alert: {
        icon: AlertCircle,
        color: "text-amber-500",
        borderColor: "border-amber-500/30",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
        label: "Uyarı",
    },
};

const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function NotificationPanel({ 
    settings,
    settingsLoading,
    onSettingsChange
}: NotificationPanelProps) {
    const { selectedFilter } = useFilterStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [intervalLoading, setIntervalLoading] = useState(false);
    const [settingsUpdateLoading, setSettingsUpdateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tempSettings, setTempSettings] = useState<Settings>(settings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { isOpen, setIsOpen, orderDetail, fetchOrderDetail } = useOrderDetail();
    const [hasFetched, setHasFetched] = useState(false);

    // Update tempSettings when settings prop changes
    useEffect(() => {
        if (JSON.stringify(tempSettings) !== JSON.stringify(settings)) {
            setTempSettings(settings);
            // Settings değiştiğinde notifications'ı yeniden çek
            if (!settingsLoading) {
                fetchNotifications(true);
            }
        }
    }, [settings, settingsLoading]);

    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (!selectedFilter.branches.length) return;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIntervalLoading(true);
            }
            setError(null);
            
            const { data } = await axios.post('/api/notifications', {
                branches: selectedFilter.branches.map(item => item.BranchID),
                ...settings
            });

            setNotifications(Array.isArray(data) ? data : []);
            setHasFetched(true);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
            setIntervalLoading(false);
        }
    }, [selectedFilter.branches, settings]);

    const handleSettingsSave = useCallback(async (newSettings: Settings) => {
        try {
            setSettingsUpdateLoading(true);
            await onSettingsChange(newSettings);
            // Settings güncellendikten sonra notifications'ı otomatik olarak güncelleme
            // fetchNotifications artık settings prop'undaki değişikliği algılayıp çalışacak
            setIsSettingsOpen(false);
        } catch (error) {
            console.error('Error updating settings:', error);
        } finally {
            setSettingsUpdateLoading(false);
        }
    }, [onSettingsChange]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const startInterval = () => {
            if (!selectedFilter.branches.length) return;

            // İlk fetch sadece bir kere yapılacak
            if (!hasFetched && !settingsLoading) {
                fetchNotifications(true);
            }
            
            // Set interval for subsequent fetches
            intervalId = setInterval(() => {
                if (document.hidden) return;
                fetchNotifications(false);
            }, 50000);
        };

        startInterval();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchNotifications, selectedFilter.branches, settingsLoading, hasFetched]);

    const renderNotification = useCallback((notification: Notification, index: number, isLastItem: boolean) => {
        const style = NOTIFICATION_STYLES[notification.type];
        const Icon = style.icon;

        return (
            <motion.div
                key={notification.autoId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
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
                                    <p className={cn("text-lg font-semibold", style.color)}>
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
                                    {NOTIFICATION_STYLES[notification.type].label.toLowerCase()}
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
    }, [fetchOrderDetail, loading]);

    if (loading && !hasFetched) {
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
        <div className="h-full w-full">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 pb-3">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-foreground" />
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-base font-semibold">Bildirimler</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {(intervalLoading || settingsUpdateLoading) ? (
                                <motion.div className="flex items-center gap-1">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                    <span className="text-xs text-muted-foreground">Yenileniyor</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-xs text-muted-foreground"
                                >
                                    Canlı
                                </motion.div>
                            )}
                        </div>
                        <SettingsMenu 
                            settings={tempSettings} 
                            onSettingsChange={setTempSettings}
                            onSave={handleSettingsSave}
                            loading={settingsUpdateLoading}
                            isOpen={isSettingsOpen}
                            onOpenChange={setIsSettingsOpen}
                        />
                    </div>

                    <div className="flex gap-1.5 px-3 mt-2">
                        {Object.entries(NOTIFICATION_STYLES).map(([type, style]) => (
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
                        ))}
                    </div>
                </div>

                <div className="relative pl-6 pt-4">
                    <div className="absolute left-6 top-0 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                    {notifications.map((notification, index) => 
                        renderNotification(notification, index, index === notifications.length - 1)
                    )}
                </div>
            </div>

            <OrderDetailDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                orderDetail={orderDetail as OrderDetail | null}
                loading={loading}
            />
        </div>
    );
}