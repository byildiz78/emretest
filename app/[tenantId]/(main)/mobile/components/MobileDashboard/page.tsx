"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { WebWidget, WebWidgetData } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import PulseLoader from "react-spinners/PulseLoader";
import { Store, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import BranchList from "./components/MobileDashboardBranchList";
import WidgetCard from "./components/MobileDashboardWidgetCard";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Branch {
    BranchID: string | number;
}

export default function Dashboard() {
    const [widgets, setWidgets] = useState<WebWidget[]>([]);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const { selectedFilter } = useFilterStore();
    const { setBranchDatas } = useWidgetDataStore();

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
                setCountdown(REFRESH_INTERVAL / 1000);
            }
        }
    }, [selectedFilter.selectedBranches, selectedFilter.branches, selectedFilter.date, setBranchDatas]);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [fetchData]);

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

        const countdownInterval = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    return REFRESH_INTERVAL / 1000;
                }
                return prevCount - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
        };
    }, []);

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center py-3 px-4 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Özet Bilgiler
                </h2>
                <div className="bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <motion.div className="text-blue-500" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 22h14" />
                            <path d="M5 2h14" />
                            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                        </svg>
                    </motion.div>
                    <span className="font-medium w-4 text-center">{countdown}</span>
                    <span>saniye</span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {widgets.length <= 0 || widgets === null || widgets === undefined ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {widgets.map((widget, index) => (
                            <WidgetCard
                                key={widget.AutoID}
                                reportId={widget.ReportID}
                                reportName={widget.ReportName}
                                reportIcon={widget.ReportIcon}
                                columnIndex={index % 4}
                            />
                        ))}
                    </div>
                )}

                {widgets.length > 0 && (
                    <>
                        <div className="flex items-center gap-4 mt-10 mb-6">
                            <div className="h-[3px] flex-1 bg-gradient-to-r from-transparent via-border to-border"></div>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border-2 border-primary/10">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span className="text-base font-semibold text-primary">Şube Ciroları</span>
                            </div>
                            <div className="h-[3px] flex-1 bg-gradient-to-l from-transparent via-border to-border"></div>
                        </div>
                        <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <BranchList />
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
