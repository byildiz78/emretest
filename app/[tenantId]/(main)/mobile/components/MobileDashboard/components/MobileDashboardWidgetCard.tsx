import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ScaleLoader from "react-spinners/ScaleLoader";
import * as LucideIcons from "lucide-react";
import axios from "axios";
import { useFilterStore } from "@/stores/filters-store";

const REFRESH_INTERVAL = 60000;

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
        bg: "from-sky-100/95 via-blue-50/85 to-white/80 dark:from-sky-950/30 dark:via-blue-900/20 dark:to-background/80",
        border: "border-sky-200/60 dark:border-blue-800/60",
        text: "text-sky-700 dark:text-blue-400",
        badge: "bg-sky-500 text-white dark:bg-blue-600"
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

export default function EnhancedWidgetCard({
    reportId,
    reportName,
    reportIcon,
    columnIndex = 0,
}) {
    const [widgetData, setWidgetData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const { selectedFilter } = useFilterStore();
    const colorSet = gradientColors[columnIndex % gradientColors.length];

    const selectedBranches = selectedFilter.selectedBranches.length <= 0
        ? selectedFilter.branches
        : selectedFilter.selectedBranches;

    const getReportData = useCallback(async () => {
        if (selectedBranches.length === 0) return;
        try {
            setIsLoading(true);
            setError(null);
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
            setError('Failed to fetch widget data');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFilter.date, selectedBranches, reportId]);

    useEffect(() => {
        getReportData();
        const fetchInterval = setInterval(getReportData, REFRESH_INTERVAL);
        return () => clearInterval(fetchInterval);
    }, [getReportData]);

    if (isLoading || !widgetData) {
        return (
            <Card className="h-40 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
                <div className={cn(
                    "h-full flex items-center justify-center bg-gradient-to-br backdrop-blur-sm",
                    colorSet.bg,
                    colorSet.border
                )}>
                    <ScaleLoader color="#6366f1" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-40 shadow-lg mb-4">
                <div className="h-full flex items-center justify-center text-red-500">
                    {error}
                </div>
            </Card>
        );
    }

    const showValue2 = widgetData.reportValue2 != null && 
                      widgetData.reportValue2 !== undefined && 
                      widgetData.reportValue2 !== "" && 
                      widgetData.reportValue2 !== "0";

    return (
        <Card 
            className="h-40 relative overflow-hidden group border-2 shadow-xl hover:shadow-2xl transition-all duration-300 mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className={cn(
                    "h-full bg-gradient-to-br p-4 relative backdrop-blur-sm",
                    colorSet.bg,
                    colorSet.border
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                    boxShadow: "0 12px 36px -12px rgba(0, 0, 0, 0.2)",
                }}
            >
                {/* Header with Icon */}
                <motion.div 
                    className="flex items-start justify-between relative pb-2"
                    initial={false}
                    animate={{ y: isHovered ? -2 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="relative">
                        <h3 className={cn(
                            "text-base font-bold tracking-wide",
                            colorSet.text
                        )}>
                            {reportName}
                        </h3>
                        <motion.div 
                            className={cn(
                                "absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full",
                                colorSet.text
                            )}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ 
                                scaleX: isHovered ? 1 : 0.3, 
                                opacity: isHovered ? 1 : 0.5 
                            }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                                transformOrigin: "left",
                                background: `currentColor`,
                                filter: "brightness(1.2)"
                            }}
                        />
                    </div>
                    <motion.div 
                        className={cn(
                            "p-2 rounded-xl bg-white/60 dark:bg-black/60 backdrop-blur-sm",
                            "shadow-lg transition-all duration-300",
                            colorSet.text
                        )}
                        whileHover={{ scale: 1.05 }}
                        animate={{ rotate: isHovered ? 5 : 0 }}
                    >
                        <DynamicIcon iconName={reportIcon} className="h-6 w-6" />
                    </motion.div>
                </motion.div>

                {/* Main Value */}
                <motion.div
                    className={cn(
                        "text-4xl sm:text-5xl font-bold mt-4",
                        "tracking-tight leading-none",
                        "relative z-10 flex justify-center items-center",
                        colorSet.text
                    )}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.span
                        initial={false}
                        animate={{ scale: isHovered ? 1.05 : 1 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block transform-gpu"
                    >
                        {formatMainValue(widgetData.reportValue1)}
                    </motion.span>
                </motion.div>

                {/* Secondary Value Tag */}
                <AnimatePresence>
                    {showValue2 && (
                        <motion.div
                            className="absolute bottom-4 right-4"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ 
                                duration: 0.3,
                                delay: 0.1
                            }}
                        >
                            <span className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-semibold",
                                "shadow-lg backdrop-blur-sm",
                                "border-2 border-white/20",
                                colorSet.badge
                            )}>
                                {formatNumberIntl(widgetData.reportValue2)}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Card>
    );
}