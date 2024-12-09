"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import dynamic from "next/dynamic";

const MobileDetailsBranch = dynamic(() => import("../../Mobilebranchdetails/[branchId]/MobileDetailsBranch"), {
    loading: () => <div>Loading...</div>
});

interface BranchData {
    id: string;
    name: string;
    currentValue: string;
    previousValue: string;
    difference: string;
    totalDaily: string;
    dailyCustomers: string;
    peopleCount: string;
    percentageChange: string | null;
}

interface BranchCardProps {
    data: BranchData;
    index: number;
    maxValue: number;
}

const gradientColors = [
    {
        bg: "from-blue-100/95 via-blue-50/85 to-white/80 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-background/80",
        border: "border-blue-200/60 dark:border-blue-800/60",
        bar: "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600",
        shadow: "bg-blue-500/5 dark:bg-blue-400/5",
        text: "text-blue-700 dark:text-blue-400",
        badge: "bg-blue-100/90 text-blue-700 border-blue-200 dark:bg-blue-950/90 dark:text-blue-400 dark:border-blue-800"
    },
    {
        bg: "from-emerald-100/95 via-emerald-50/85 to-white/80 dark:from-emerald-950/30 dark:via-emerald-900/20 dark:to-background/80",
        border: "border-emerald-200/60 dark:border-emerald-800/60",
        bar: "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600",
        shadow: "bg-emerald-500/5 dark:bg-emerald-400/5",
        text: "text-emerald-700 dark:text-emerald-400",
        badge: "bg-emerald-100/90 text-emerald-700 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-400 dark:border-emerald-800"
    },
    {
        bg: "from-amber-100/95 via-amber-50/85 to-white/80 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-background/80",
        border: "border-amber-200/60 dark:border-amber-800/60",
        bar: "from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600",
        shadow: "bg-amber-500/5 dark:bg-amber-400/5",
        text: "text-amber-700 dark:text-amber-400",
        badge: "bg-amber-100/90 text-amber-700 border-amber-200 dark:bg-amber-950/90 dark:text-amber-400 dark:border-amber-800"
    }
];

function BranchCard({ data, index, maxValue }: BranchCardProps) {
    const colorSet = gradientColors[index % gradientColors.length];
    const [showDetails, setShowDetails] = useState(false);

    const formatCurrency = (value: string | null | undefined) => {
        if (value === null || value === undefined) return '0 ₺';
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numValue);
    };

    const getTrendIcon = (difference: string) => {
        const numDifference = Number(difference) || 0;
        return numDifference >= 0 ? (
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400" />
        ) : (
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400" />
        );
    };

    const currentValueNum = Number(data.currentValue) || 0;
    const barHeight = Math.min((currentValueNum / maxValue) * 100, 100);

    const handleClick = () => {
        setShowDetails(true);
    };

    const handleBack = () => {
        setShowDetails(false);
    };

    if (showDetails) {
        const branchData = {
            id: data.id,
            name: data.name,
            stats: {
                checkCount: Math.floor(Math.random() * 1000),
                checkAverage: Math.floor(Math.random() * 500) + 100,
                discount: Math.floor(Math.random() * 1000),
                peopleCount: Number(data.peopleCount),
                peopleAverage: Math.floor(Math.random() * 50) + 10,
                canceled: Math.floor(Math.random() * 20)
            },
            revenue: {
                openChecks: Math.floor(Math.random() * 50000),
                closedChecks: Math.floor(Math.random() * 100000),
                total: Number(data.currentValue) || 0
            },
            orders: Array.from({ length: 10 }, (_, index) => ({
                id: `order-${index}`,
                checkNumber: `#${Math.floor(Math.random() * 10000)}`,
                openDate: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                staffName: `Personel ${index + 1}`,
                amount: Math.floor(Math.random() * 1000) + 100,
                type: ['table', 'package', 'takeaway'][Math.floor(Math.random() * 3)] as 'table' | 'package' | 'takeaway'
            }))
        };

        const allBranches = Array.from({ length: 5 }, (_, index) => ({
            id: (index + 345).toString(),
            name: `Şube ${index + 345}`,
            stats: {
                checkCount: Math.floor(Math.random() * 1000),
                checkAverage: Math.floor(Math.random() * 500) + 100,
                discount: Math.floor(Math.random() * 1000),
                peopleCount: Math.floor(Math.random() * 500),
                peopleAverage: Math.floor(Math.random() * 50) + 10,
                canceled: Math.floor(Math.random() * 20)
            },
            revenue: {
                openChecks: Math.floor(Math.random() * 50000),
                closedChecks: Math.floor(Math.random() * 100000),
                total: Math.floor(Math.random() * 150000)
            },
            orders: []
        }));

        return <MobileDetailsBranch branchData={branchData} allBranches={allBranches} onBack={handleBack} />;
    }

    return (
        <div onClick={handleClick} className="cursor-pointer">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 h-full relative">
                <div className={cn(
                    "absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium backdrop-blur-sm shadow-md border px-2 py-1 rounded-full",
                    colorSet.badge
                )}>
                    <span>Detaylar</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1">{data.name}</h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/70 px-2 sm:px-3 py-1 rounded-full shadow-sm border border-border/60 whitespace-nowrap">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                                {data.peopleCount} kişi
                            </span>
                        </div>
                    </div>

                    <div className={cn(
                        "mb-4 sm:mb-6 bg-gradient-to-br p-4 sm:p-6 rounded-xl border-2 shadow-lg backdrop-blur-md relative overflow-hidden",
                        colorSet.bg,
                        colorSet.border
                    )}>
                        <motion.div
                            className={cn("absolute inset-0", colorSet.shadow)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                        <div className="flex items-center justify-between relative mb-2">
                            <p className={cn("text-xs sm:text-sm font-medium relative", colorSet.text)}>Ciro</p>
                            {data.percentageChange && (
                                <motion.span
                                    className={cn(
                                        "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm shadow-md border",
                                        colorSet.badge
                                    )}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {Number(data.percentageChange).toFixed(2)}%
                                </motion.span>
                            )}
                        </div>
                        <div className="flex items-center justify-between relative">
                            <motion.p
                                className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight break-words"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                {formatCurrency(data.currentValue)}
                            </motion.p>
                        </div>

                        <motion.div
                            className="mt-4 h-2 sm:h-2.5 bg-background/50 rounded-full overflow-hidden border border-border/40"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <motion.div
                                className={cn("h-full bg-gradient-to-r rounded-full", colorSet.bar)}
                                initial={{ width: 0 }}
                                animate={{ width: `${barHeight}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        className="grid grid-cols-2 gap-3 sm:gap-4 text-sm bg-muted/50 p-3 sm:p-4 rounded-xl shadow-inner border border-border/60"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <div>
                            <p className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Geçen Hafta Bu an</p>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                                {formatCurrency(data.previousValue)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Geçen Hafta aynı gün</p>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                                {formatCurrency(data.totalDaily)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Müşteri Sayısı</p>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                                {data.dailyCustomers}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Fark</p>
                            <div className="flex items-center gap-1">
                                {getTrendIcon(data.difference)}
                                <span className={cn(
                                    "font-semibold text-sm sm:text-base",
                                    Number(data.difference) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                )}>
                                    {formatCurrency(data.difference)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Card>
        </div>
    );
}

export default memo(BranchCard);