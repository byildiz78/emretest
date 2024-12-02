"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WebWidget, WebWidgetData, BranchModel } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import RingLoader from "react-spinners/RingLoader";
import LazyWidgetCard from "@/app/[tenantId]/(main)/dashboard/components/LazyWidgetCard";
import NotificationPanel from "@/app/[tenantId]/(main)/dashboard/components/NotificationPanel";
import { Bell, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import BranchList from "@/app/[tenantId]/(main)/dashboard/components/BranchList";
import WidgetCard from "./components/WidgetCard";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Branch {
    BranchID: string | number;
}

export default function Dashboard() {
    const [widgets, setWidgets] = useState<WebWidget[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const { selectedFilter } = useFilterStore();
    const { addOrReplaceWidgetData, setBranchDatas} =
        useWidgetDataStore();
    const mountedRef = useRef(false);

    const fetchData = useCallback(async () => {
        console.log('fetchData called with:', {
            selectedBranches: selectedFilter.selectedBranches,
            branches: selectedFilter.branches,
            widgets: widgets
        });

        const branches =
            selectedFilter.selectedBranches.length <= 0
                ? selectedFilter.branches
                : selectedFilter.selectedBranches;

        if (branches.length > 0) {
            const branchIds = branches.map((item: Branch) => item.BranchID);

            try {
                const [widgetResponse, branchResponse] = await Promise.all([
                    axios.post<WebWidgetData[]>(
                        "/api/widgetreport",
                        {
                            date1: selectedFilter.date.from,
                            date2: selectedFilter.date.to,
                            branches: branchIds,
                            reportId: widgets.map((widget) => widget.ReportID),
                        },
                        {
                            headers: { "Content-Type": "application/json" },
                        }
                    ),
                    axios.post<BranchModel[]>(
                        "/api/widgetbranch",
                        {
                            date1: selectedFilter.date.from,
                            date2: selectedFilter.date.to,
                            branches: branchIds,
                            reportId: "522",
                        },
                        {
                            headers: { "Content-Type": "application/json" },
                        }
                    )
                ]);

                widgetResponse.data.forEach((widget) => {
                    addOrReplaceWidgetData(widget);
                });

                if (Array.isArray(branchResponse.data)) {
                    const validBranchData = branchResponse.data.map((branch) => ({
                        BranchID: Number(branch.BranchID),
                        reportValue1: String(branch.reportValue1),
                        reportValue2: Number(branch.reportValue2),
                        reportValue3: Number(branch.reportValue3),
                        reportValue4: Number(branch.reportValue4),
                        reportValue5: Number(branch.reportValue5),
                        reportValue6: Number(branch.reportValue6),
                        reportValue7: Number(branch.reportValue7),
                        reportValue8: Number(branch.reportValue8),
                        reportValue9: Number(branch.reportValue9),
                    }));
                    setBranchDatas(validBranchData);
                }

                // Update lastAppliedFilter after successful fetch
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setInitialLoading(false);
                setFilterLoading(false);
                setCountdown(REFRESH_INTERVAL / 1000);
            }
        }
    }, [selectedFilter, widgets, addOrReplaceWidgetData, setBranchDatas]);

    // Initial data fetch when component mounts
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            const fetchInitialData = async () => {
                try {
                    const response = await axios.get<WebWidget[]>("/api/webwidgets", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setWidgets(response.data);
                } catch (error) {
                    console.error("Error fetching initial data:", error);
                }
            };

            fetchInitialData();
        }
    }, []);

    // Only fetch data when widgets are loaded
    useEffect(() => {
        console.log('widgets effect triggered:', widgets.length);
        if (widgets.length > 0) {
            console.log('Calling fetchData because widgets loaded');
            fetchData();

            // Set up refresh interval
            const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
            return () => clearInterval(intervalId);
        }
    }, [widgets, fetchData]);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return REFRESH_INTERVAL / 1000;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-full overflow-hidden flex">
            <div
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
            >
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Toplam Tutarlar
                    </h2>
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start">
                        Yenileme: {countdown} saniye
                    </div>
                </div>

                <div className="p-3 space-y-4 md:space-y-6">
                    {widgets.length <= 0 || widgets === null || widgets === undefined ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <RingLoader color="#fff" loading size={30} speedMultiplier={2} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-auto">
                            {widgets.map((widget, index) => (
                                // <LazyWidgetCard
                                //     key={widget.AutoID}
                                //     {...widget}
                                //     loading={initialLoading || filterLoading}
                                //     columnIndex={index % 3}
                                // />
                                <WidgetCard key={widget.AutoID}
                                {...widget}
                                loading={initialLoading || filterLoading}
                                columnIndex={index % 3} />
                            ))}
                        </div>
                    )}

                    {widgets.length > 0 && (
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Şube Bazlı Tutarlar
                            </h2>
                            <BranchList />
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="hidden lg:block w-[300px] border-l border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="h-full p-3">
                    <NotificationPanel />
                </div>
            </div>

            <div className="fixed bottom-4 right-4 lg:hidden z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full h-12 w-12">
                            <div className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-[90%] max-w-[400px] p-0 sm:w-[400px]"
                    >
                        <NotificationPanel />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
