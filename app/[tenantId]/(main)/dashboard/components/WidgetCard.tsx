import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ScaleLoader from "react-spinners/ScaleLoader";
import * as LucideIcons from "lucide-react";
import axios from "axios";
import { useFilterStore } from "@/stores/filters-store";
import { useTabStore } from '@/stores/tab-store';

const REFRESH_INTERVAL = 90000;

const gradientColors = [
    {
        bg: "from-emerald-100/95 via-teal-50/85 to-white/80 dark:from-emerald-950/30 dark:via-teal-900/20 dark:to-background/80",
        border: "border-emerald-200/60 dark:border-teal-800/60",
        text: "text-emerald-700 dark:text-teal-400",
        badge: "bg-emerald-500 text-white dark:bg-emerald-600"
    },
    {
        bg: "from-blue-100/95 via-indigo-50/85 to-white/80 dark:from-blue-950/30 dark:via-indigo-900/20 dark:to-background/80",
        border: "border-blue-200/60 dark:border-indigo-800/60",
        text: "text-blue-700 dark:text-indigo-400",
        badge: "bg-blue-500 text-white dark:bg-blue-600"
    },
    {
        bg: "from-violet-100/95 via-purple-50/85 to-white/80 dark:from-violet-950/30 dark:via-purple-900/20 dark:to-background/80",
        border: "border-violet-200/60 dark:border-purple-800/60",
        text: "text-violet-700 dark:text-purple-400",
        badge: "bg-violet-500 text-white dark:bg-violet-600"
    },
    {
        bg: "from-violet-100/95 via-purple-50/85 to-white/80 dark:from-violet-950/30 dark:via-purple-900/20 dark:to-background/80",
        border: "border-violet-200/60 dark:border-purple-800/60",
        text: "text-violet-700 dark:text-purple-400",
        badge: "bg-violet-500 text-white dark:bg-violet-600"
    }
];

const DynamicIcon = ({ iconName, className }) => {
    if (!iconName) return null;
    const IconComponent = LucideIcons[iconName];
    if (!IconComponent) return null;
    return <IconComponent className={className} />;
};

const formatNumberIntl = (value) => {
    if (value === null || value === undefined) return '0';
    if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString('tr-TR');
    }
    return value.toLocaleString('tr-TR');
};

const formatMainValue = (value) => {
    if (value === null || value === undefined) return '0';
    if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? value : Math.floor(num).toLocaleString('tr-TR', { maximumFractionDigits: 0 });
    }
    return Math.floor(value).toLocaleString('tr-TR', { maximumFractionDigits: 0 });
};

const WidgetCard = memo(function WidgetCard({
    reportId,
    reportName,
    reportIcon,
    columnIndex = 0,
}) {
    const [widgetData, setWidgetData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { selectedFilter } = useFilterStore();
    const colorSet = useMemo(() => gradientColors[columnIndex % gradientColors.length], [columnIndex]);
    const { tabs, activeTab } = useTabStore();

    const selectedBranches = useMemo(() =>
        selectedFilter.selectedBranches.length <= 0
            ? selectedFilter.branches
            : selectedFilter.selectedBranches,
        [selectedFilter.selectedBranches, selectedFilter.branches]
    );

    const getReportData = useCallback(async (isInitial = false) => {
        if (activeTab === "dashboard") {
            if (selectedBranches.length === 0) return;
            try {
                if (isInitial) {
                    setIsLoading(true);
                } else {
                    setIsUpdating(true);
                }
                const response = await axios.post("/api/widgetreport", {
                    date1: selectedFilter.date.from,
                    date2: selectedFilter.date.to,
                    branches: selectedBranches.map((item) => item.BranchID),
                    reportId,
                });
                if (response.status === 200) {
                    setWidgetData(response.data[0]);
                }
            } catch (err) {
                console.error(`Error fetching data for widget ${reportId}:`, err);
            } finally {
                if (isInitial) {
                    setIsLoading(false);
                } else {
                    setIsUpdating(false);
                }
            }
        }

    }, [selectedFilter.date, selectedBranches, reportId]);

    useEffect(() => {
        let isSubscribed = true;

        const fetchData = async () => {
            await getReportData(true);
            if (!isSubscribed) return;
        };

        fetchData();

        const interval = setInterval(() => {
            if (!isSubscribed) return;
            getReportData(false);
        }, 90000);

        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, [getReportData]);

    const showValue2 = widgetData?.reportValue2 != null &&
        widgetData?.reportValue2 !== undefined &&
        widgetData?.reportValue2 !== "" &&
        widgetData?.reportValue2 !== "0";

    return (
        <Card className="h-32 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <motion.div
                className={cn(
                    "h-full bg-gradient-to-br p-4 relative",
                    colorSet.bg,
                    colorSet.border
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-3">
                    <div className="relative">
                        <h3 className={cn(
                            "text-sm font-semibold",
                            colorSet.text
                        )}>
                            {reportName}
                        </h3>
                        <motion.div
                            className={cn(
                                "absolute -bottom-2 left-0 h-[2px]",
                                "bg-gradient-to-r from-current to-transparent opacity-25"
                            )}
                            style={{
                                background: `linear-gradient(to right, ${colorSet.text} 0%, transparent 100%)`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: "70%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <div className={cn(
                        "p-2 rounded-lg bg-white/60 dark:bg-black/60",
                        colorSet.text
                    )}>
                        <DynamicIcon iconName={reportIcon} className="h-6 w-6" />
                    </div>
                </div>

                {/* Main Value */}
                <div className="relative mt-3">
                    <motion.div
                        className={cn(
                            "text-2xl font-bold",
                            colorSet.text,
                            "flex items-center gap-2 h-8"
                        )}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {isLoading || isUpdating ? (
                            <div className="transform scale-50 -ml-2">
                                <ScaleLoader color="#6366f1" height={20} />
                            </div>
                        ) : (
                            formatMainValue(widgetData?.reportValue1 || 0)
                        )}
                    </motion.div>
                </div>

                {/* Secondary Value Tag */}
                {(showValue2 || isLoading || isUpdating) && (
                    <motion.div
                        className="absolute bottom-4 right-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {isLoading || isUpdating ? (
                            <div className="transform scale-50">
                                <ScaleLoader color="#6366f1" height={15} />
                            </div>
                        ) : (
                            <span className={cn(
                                "px-2 py-1 rounded-md text-sm font-medium shadow-sm",
                                colorSet.badge
                            )}>
                                {formatNumberIntl(widgetData.reportValue2)}
                            </span>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </Card>
    );
});

export default WidgetCard;