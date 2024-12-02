"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useTabStore } from "@/stores/tab-store";

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
        text: "text-blue-700 dark:text-blue-400"
    },
    {
        bg: "from-emerald-100/95 via-emerald-50/85 to-white/80 dark:from-emerald-950/30 dark:via-emerald-900/20 dark:to-background/80",
        border: "border-emerald-200/60 dark:border-emerald-800/60",
        bar: "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600",
        shadow: "bg-emerald-500/5 dark:bg-emerald-400/5",
        text: "text-emerald-700 dark:text-emerald-400"
    },
    {
        bg: "from-amber-100/95 via-amber-50/85 to-white/80 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-background/80",
        border: "border-amber-200/60 dark:border-amber-800/60",
        bar: "from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600",
        shadow: "bg-amber-500/5 dark:bg-amber-400/5",
        text: "text-amber-700 dark:text-amber-400"
    }
];

function BranchCard({ data, index, maxValue }: BranchCardProps) {
    const colorSet = gradientColors[index % gradientColors.length];
    const { addTab, tabs, setActiveTab } = useTabStore();

    const formatCurrency = (value: string) => {
        const numValue = Number(value) || 0;
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(numValue);
    };

    const getTrendIcon = (difference: string) => {
        const numDifference = Number(difference) || 0;
        return numDifference >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
        ) : (
            <TrendingDown className="h-5 w-5 text-red-500 dark:text-red-400" />
        );
    };

    const currentValueNum = Number(data.currentValue) || 0;
    const barHeight = Math.min((currentValueNum / maxValue) * 100, 100);

    const handleClick = () => {
        const tabId = `branch-${data.id}`;

        // Tab zaten açıksa sadece aktif yap
        const existingTab = tabs.find(tab => tab.id === tabId);
        if (existingTab) {
            setActiveTab(tabId);
            return;
        }

        // Yeni tab aç
        addTab({
            id: tabId,
            title: `${data.name} Detay`,
            lazyComponent: () => import("@/app/[tenantId]/(main)/branchdetails/[branchId]/DetailsBranch").then(
                (mod) => ({
                    default: () => {
                        // Fake data oluştur
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

                        return <mod.default branchData={branchData} allBranches={allBranches} />;
                    }
                })
            )
        });
    };

    return (
        <div onClick={handleClick} className="cursor-pointer">
            <div>
            <Card className="group hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 h-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-foreground">{data.name}</h3>
                        <div className="flex items-center gap-2 bg-muted/70 px-3 py-1 rounded-full shadow-sm border border-border/60">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {data.peopleCount} kişi
                            </span>
                        </div>
                    </div>

                    <div className={cn(
                        "mb-6 bg-gradient-to-br p-6 rounded-xl border-2 shadow-lg backdrop-blur-md relative overflow-hidden",
                        colorSet.bg,
                        colorSet.border
                    )}>
                        <motion.div
                            className={cn("absolute inset-0", colorSet.shadow)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                        <p className={cn("text-sm font-medium mb-2 relative", colorSet.text)}>Ciro</p>
                        <div className="flex items-center justify-between relative">
                            <motion.p
                                className="text-4xl font-bold text-foreground tracking-tight"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                {formatCurrency(data.currentValue)}
                            </motion.p>
                            {data.percentageChange && (
                                <motion.span
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm shadow-md border",
                                        Number(data.percentageChange) >= 0
                                            ? "bg-green-100/90 text-green-700 border-green-200 dark:bg-green-950/90 dark:text-green-400 dark:border-green-800"
                                            : "bg-red-100/90 text-red-700 border-red-200 dark:bg-red-950/90 dark:text-red-400 dark:border-red-800"
                                    )}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    {Number(data.percentageChange).toFixed(2)}%
                                </motion.span>
                            )}
                        </div>

                        <motion.div
                            className="mt-4 h-2.5 bg-background/50 rounded-full overflow-hidden border border-border/40"
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
                        className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-xl shadow-inner border border-border/60"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Geçen Hafta</p>
                            <p className="font-semibold text-foreground text-base">
                                {formatCurrency(data.previousValue)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Günlük Toplam</p>
                            <p className="font-semibold text-foreground text-base">
                                {formatCurrency(data.totalDaily)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Müşteri Sayısı</p>
                            <p className="font-semibold text-foreground text-base">
                                {data.dailyCustomers}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Fark</p>
                            <div className="flex items-center gap-1">
                                {getTrendIcon(data.difference)}
                                <span className={cn(
                                    "font-semibold text-base",
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
        </div>
    );
}

export default memo(BranchCard);
