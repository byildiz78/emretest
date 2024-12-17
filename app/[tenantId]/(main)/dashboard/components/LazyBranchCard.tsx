import { useInView } from "@/hooks/use-inview";
import BranchCard from "./BranchCard";
import { memo } from "react";

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

interface LazyBranchCardProps {
    data: BranchData;
    index: number;
    maxValue: number;
}

const LazyBranchCard = memo(function LazyBranchCard({ data, index, maxValue }: LazyBranchCardProps) {
    const [ref, isInView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    return (
        <div ref={ref} className="min-h-[300px]">
            {isInView ? (
                <BranchCard data={data} index={index} maxValue={maxValue} />
            ) : (
                <div className="h-[300px] bg-card/95 backdrop-blur-sm border-2 border-border/60 rounded-xl shadow-lg animate-pulse">
                    <div className="p-6 space-y-6">
                        {/* Header placeholder */}
                        <div className="flex items-center justify-between">
                            <div className="w-1/3 h-6 bg-muted/70 rounded-full" />
                            <div className="w-1/4 h-8 bg-muted/70 rounded-full" />
                        </div>

                        {/* Main content placeholder */}
                        <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-6 rounded-xl border-2 border-border/40">
                            <div className="w-1/4 h-4 bg-muted/70 rounded-full mb-4" />
                            <div className="w-2/3 h-8 bg-muted/70 rounded-full" />
                        </div>

                        {/* Stats placeholder */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="w-1/2 h-3 bg-muted/70 rounded-full" />
                                <div className="w-3/4 h-4 bg-muted/70 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-1/2 h-3 bg-muted/70 rounded-full" />
                                <div className="w-3/4 h-4 bg-muted/70 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default LazyBranchCard;
