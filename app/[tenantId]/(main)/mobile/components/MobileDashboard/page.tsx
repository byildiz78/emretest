"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WebWidget, WebWidgetData } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import RingLoader from "react-spinners/RingLoader";
import { Bell, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import WidgetCard from "./components/MobileDashboardWidgetCard";
import BranchList from "./components/MobileDashboardBranchList";
import NotificationPanel from "./components/MobileDashboardNotificationPanel";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Branch {
    BranchID: string | number;
}

export default function Dashboard() {
    const [loading, setLoading] = useState<boolean>(true);
    const [widgets, setWidgets] = useState<WebWidget[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const { selectedFilter } = useFilterStore();
    const { addOrReplaceWidgetData, setBranchDatas } = useWidgetDataStore();

    const fetchData = useCallback(async () => {
        const branches =
            selectedFilter.selectedBranches.length <= 0
                ? selectedFilter.branches
                : selectedFilter.selectedBranches;

        if (branches.length > 0) {
            const branchIds = branches.map((item: Branch) => item.BranchID);

            try {
                const response = await axios.post<WebWidgetData[]>(
                    "/api/widgetreport",
                    {
                        date1: selectedFilter.date.from,
                        date2: selectedFilter.date.to,
                        branches: branchIds,
                        reportId: 522,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                )
                setBranchDatas(response.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setInitialLoading(false);
                setFilterLoading(false);
                setCountdown(REFRESH_INTERVAL / 1000);
            }
        }
    }, [selectedFilter.selectedBranches, selectedFilter.branches, selectedFilter.date, addOrReplaceWidgetData, setBranchDatas]);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Countdown timer effect
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    return REFRESH_INTERVAL / 1000;
                }
                return prevCount - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    useEffect(() => {
        const fetchWidgetsData = async () => {
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

        fetchWidgetsData();
    }, []);

    return (
        <div className="h-full flex">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
            >
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Özet Bilgiler
                    </h2>
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start flex items-center gap-2 group">
                        <div className="duration-[8000ms] text-blue-500 group-hover:text-blue-600 [animation:spin_6s_linear_infinite]">
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 22h14" />
                                <path d="M5 2h14" />
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                            </svg>
                        </div>
                        <span className="font-medium w-4 text-center">{countdown}</span>
                        <span>saniye</span>
                    </div>
                </div>

                <div className="p-3 space-y-4 md:space-y-6 pb-20">
                    {widgets.length <= 0 || widgets === null || widgets === undefined ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <RingLoader color="#fff" loading size={30} speedMultiplier={2} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-auto">
                            {widgets.map((widget, index) => (
                                <WidgetCard reportId={widget.ReportID} key={widget.AutoID} reportName={widget.ReportName}
                                    reportIcon={widget.ReportIcon}
                                    {...widget}
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
                                Cirolar
                            </h2>
                            <BranchList />
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="hidden lg:block w-[300px] border-l border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="h-full p-3 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
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
