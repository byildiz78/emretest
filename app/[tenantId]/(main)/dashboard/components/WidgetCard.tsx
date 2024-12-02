"use client";

import { Card } from "@/components/ui/card";
import { cn, formatNumberIntl } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Branch, WebWidgetData } from "@/types/tables";
import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import axios, { AxiosError } from "axios";
import { useFilterStore } from "@/stores/filters-store";

// Constants
const REFRESH_INTERVAL = 60000;
const COUNTDOWN_INTERVAL = 1000;

// Types
interface WidgetCardProps {
    reportId: number;
    reportName?: string;
    reportIcon?: string;
    columnIndex?: number;
}

interface DynamicIconProps {
    iconName?: string;
    className?: string;
}

// Styles
const gradientColors = [
    {
        bg: "from-purple-100/95 via-purple-50/85 to-white/80 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-background/80",
        border: "border-purple-200/60 dark:border-purple-800/60",
        bar: "from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600",
        shadow: "bg-purple-500/5 dark:bg-purple-400/5",
        text: "text-purple-700 dark:text-purple-400",
    },
    {
        bg: "from-yellow-100/95 via-yellow-50/85 to-white/80 dark:from-yellow-950/30 dark:via-yellow-900/20 dark:to-background/80",
        border: "border-yellow-200/60 dark:border-yellow-800/60",
        bar: "from-yellow-500 to-yellow-700 dark:from-yellow-400 dark:to-yellow-600",
        shadow: "bg-yellow-500/5 dark:bg-yellow-400/5",
        text: "text-yellow-700 dark:text-yellow-400",
    },
    {
        bg: "from-orange-100/95 via-orange-50/85 to-white/80 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-background/80",
        border: "border-orange-200/60 dark:border-orange-800/60",
        bar: "from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600",
        shadow: "bg-orange-500/5 dark:bg-orange-400/5",
        text: "text-orange-700 dark:text-orange-400",
    },
];

// Components
const DynamicIcon = ({ iconName, className }: DynamicIconProps) => {
    if (!iconName) return null;
    
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
    if (!IconComponent) return null;

    return <IconComponent className={className} />;
};

export default function WidgetCard({
    reportId,
    reportName,
    reportIcon,
    columnIndex = 0,
}: WidgetCardProps) {
    const [widgetData, setWidgetData] = useState<WebWidgetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedFilter } = useFilterStore();
    const colorSet = useMemo(() => gradientColors[columnIndex % gradientColors.length], [columnIndex]);
    const barHeight = 50;
    
    const selectedBranches = useMemo(() => {
        return selectedFilter.selectedBranches.length <= 0
            ? selectedFilter.branches
            : selectedFilter.selectedBranches;
    }, [selectedFilter.selectedBranches, selectedFilter.branches]);

    const getReportData = useCallback(async () => {
        if (selectedBranches.length === 0) return;

        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.post<WebWidgetData>(
                "/api/widgetreport",
                {
                    date1: selectedFilter.date.from,
                    date2: selectedFilter.date.to,
                    branches: selectedBranches.map((item: Branch) => item.BranchID),
                    reportId,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status === 200) {
                setWidgetData(response.data);
            }
        } catch (err) {
            const error = err as AxiosError;
            console.error(`Error fetching data for widget ${reportId}:`, error);
            setError('Failed to fetch widget data');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFilter.date, selectedBranches, reportId]);

    // Effects
    useEffect(() => {
        getReportData();
        const fetchInterval = setInterval(getReportData, REFRESH_INTERVAL);
        return () => clearInterval(fetchInterval);
    }, [getReportData]);


    if (isLoading || !widgetData) {
        return (
            <Card className="group bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm text-muted-foreground font-medium">
                            {reportName}
                        </h3>
                        <motion.div
                            className={cn("p-2 rounded-lg shadow-md", colorSet.text)}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DynamicIcon iconName={reportIcon} className="h-5 w-5" />
                        </motion.div>
                    </div>
                    <div
                        className={cn(
                            "bg-gradient-to-br p-4 rounded-xl border-2 shadow-lg backdrop-blur-md flex items-center justify-center",
                            colorSet.bg,
                            colorSet.border
                        )}
                    >
                        <ScaleLoader color="#fff" loading height={15} speedMultiplier={1} />
                    </div>
                </div>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="group bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg">
                <div className="p-6">
                    <div className="text-red-500 text-center">{error}</div>
                </div>
            </Card>
        );
    }

    const isPositive = Number(widgetData.reportValue2) >= 0;
    const showSecondaryValue = widgetData.reportValue2 != null && 
                              widgetData.reportValue2 !== undefined && 
                              widgetData.reportValue2 !== "" && 
                              widgetData.reportValue2 !== "0";

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-muted-foreground font-medium line-clamp-2 flex-1 mr-4">
                        {reportName}
                    </h3>
                    <motion.div
                        className={cn("p-2 rounded-lg shadow-md", colorSet.text)}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DynamicIcon iconName={reportIcon} className="h-5 w-5" />
                    </motion.div>
                </div>

                <div
                    className={cn(
                        "bg-gradient-to-br p-4 rounded-xl border-2 shadow-lg backdrop-blur-md relative overflow-hidden mb-3",
                        colorSet.bg,
                        colorSet.border
                    )}
                >
                    <motion.div
                        className={cn("absolute inset-0", colorSet.shadow)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />
                    <div className="flex items-center justify-between relative">
                        <motion.p
                            className="text-3xl font-bold text-foreground tracking-tight"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            key={widgetData.reportValue1}
                        >
                            {formatNumberIntl(widgetData.reportValue1)}
                        </motion.p>

                        {showSecondaryValue && (
                            <motion.span
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm shadow-md border",
                                    isPositive
                                        ? "bg-green-100/90 text-green-700 border-green-200 dark:bg-green-950/90 dark:text-green-400 dark:border-green-800"
                                        : "bg-red-100/90 text-red-700 border-red-200 dark:bg-red-950/90 dark:text-red-400 dark:border-red-800"
                                )}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                key={widgetData.reportValue2}
                            >
                                {formatNumberIntl(widgetData.reportValue2)}
                            </motion.span>
                        )}
                    </div>

                    <motion.div
                        className="mt-3 h-2 bg-background/50 rounded-full overflow-hidden border border-border/40"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        <motion.div
                            className={cn(
                                "h-full bg-gradient-to-r rounded-full",
                                colorSet.bar
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${barHeight}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </motion.div>
                </div>
            </div>
        </Card>
    );
}
