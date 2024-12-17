"use client";

import { Calendar, Store, Search, Check, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfYear, endOfYear } from "date-fns";
import { tr } from "date-fns/locale";
import BranchStats from "@/app/[tenantId]/(main)/dashboard/components/BranchStats";
import BranchCharts from "@/app/[tenantId]/(main)/dashboard/components/BranchCharts";
import OrdersTable from "@/app/[tenantId]/(main)/dashboard/components/OrdersTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/stores/tab-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useSettingsStore } from "@/stores/settings-store";
import { PulseLoader } from "react-spinners";

interface BranchData {
    id: string;
    name: string;
    stats: {
        checkCount: number;
        checkAverage: number;
        discount: number;
        peopleCount: number;
        peopleAverage: number;
        canceled: number;
    };
    revenue: {
        openChecks: number;
        closedChecks: number;
        total: number;
    };
    orders: Array<{
        id: string;
        checkNumber: string;
        openDate: string;
        staffName: string;
        amount: number;
        type: 'table' | 'package' | 'takeaway';
    }>;
}

interface DetailsClientProps {
    branchData: BranchData;
    allBranches: BranchData[];
}

interface Efr_Branches {
    BranchID: number;
    BranchName: string;
}

const dateRanges = [
    { value: "today", label: "Bugün", color: "bg-blue-500" },
    { value: "yesterday", label: "Dün", color: "bg-purple-500" },
    { value: "thisWeek", label: "Bu Hafta", color: "bg-green-500" },
    { value: "lastWeek", label: "Geçen Hafta", color: "bg-yellow-500" },
    { value: "thisMonth", label: "Bu Ay", color: "bg-orange-500" },
    { value: "lastMonth", label: "Geçen Ay", color: "bg-red-500" },
    { value: "custom", label: "Özel Tarih", color: "bg-gray-500" },
    { value: "thisYear", label: "Bu Yıl", color: "bg-pink-500" },
];

export default function DetailsBranch({ branchData, allBranches }: DetailsClientProps) {
    const { addTab, tabs, setActiveTab } = useTabStore();
    const [date, setDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState("today");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [widgetData, setWidgetData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [branchDataReady, setBranchDataReady] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [availableBranches, setAvailableBranches] = useState<Efr_Branches[]>([]);
    const [currentBranch, setCurrentBranch] = useState<Efr_Branches | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<Efr_Branches | null>(null);
    const [tempDateRange, setTempDateRange] = useState("today");
    const { settings } = useSettingsStore();

    const adjustDateForDaystart = (date: Date, isEndDate: boolean = false) => {
        const newDate = new Date(date);
        const daystart = parseInt(settings.find(setting => setting.Kod === "daystart")?.Value || '0');
        newDate.setHours(daystart, 0, 0, 0);
        
        if (!isEndDate && daystart > date.getHours()) {
            newDate.setDate(newDate.getDate() - 1);
        } else if (isEndDate && daystart <= date.getHours()) {
            newDate.setDate(newDate.getDate() + 1);
        }
        return newDate;
    };

    const getDateRange = (rangeType: string) => {
        const today = new Date();
        let start: Date;
        let end: Date;

        switch (rangeType) {
            case "today":
                start = adjustDateForDaystart(today);
                end = adjustDateForDaystart(today, true);
                break;
            case "yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                start = adjustDateForDaystart(yesterday);
                end = adjustDateForDaystart(yesterday, true);
                break;
            case "thisWeek":
                start = adjustDateForDaystart(startOfWeek(today, { weekStartsOn: 1 }));
                end = adjustDateForDaystart(endOfWeek(today, { weekStartsOn: 1 }), true);
                break;
            case "lastWeek":
                const lastWeek = subWeeks(today, 1);
                start = adjustDateForDaystart(startOfWeek(lastWeek, { weekStartsOn: 1 }));
                end = adjustDateForDaystart(endOfWeek(lastWeek, { weekStartsOn: 1 }), true);
                break;
            case "thisMonth":
                start = adjustDateForDaystart(startOfMonth(today));
                end = adjustDateForDaystart(endOfMonth(today), true);
                break;
            case "lastMonth":
                const lastMonth = subMonths(today, 1);
                start = adjustDateForDaystart(startOfMonth(lastMonth));
                end = adjustDateForDaystart(endOfMonth(lastMonth), true);
                break;
            case "thisYear":
                start = adjustDateForDaystart(startOfYear(today));
                end = adjustDateForDaystart(endOfYear(today), true);
                break;
            default:
                start = adjustDateForDaystart(today);
                end = adjustDateForDaystart(today, true);
        }

        return { start, end };
    };

    const fetchBranchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setBranchDataReady(false);
            
            const response = await fetch('/api/efr_branches');
            const data = await response.json();
            setAvailableBranches(data);
            
            if (branchData?.id) {
                const branch = {
                    BranchID: parseInt(branchData.id),
                    BranchName: branchData.name
                };
                setCurrentBranch(branch);
                setSelectedBranch(branch);
                
                const { start, end } = getDateRange("today");
                setStartDate(start);
                setEndDate(end);
                
                setBranchDataReady(true);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranchDataReady(false);
        } finally {
            setIsLoading(false);
        }
    }, [branchData]);

    useEffect(() => {
        fetchBranchData();
    }, [fetchBranchData]);

    useEffect(() => {
        const { start, end } = getDateRange("today");
        setStartDate(start);
        setEndDate(end);
        setDateRange("today");
    }, [settings]);

    const handleApply = () => {
        if (!selectedBranch) return;

        setDateRange(tempDateRange);

        const { start: newStartDate, end: newEndDate } = getDateRange(tempDateRange);
        setStartDate(newStartDate);
        setEndDate(newEndDate);

        if (currentBranch?.BranchID !== selectedBranch.BranchID) {
            const tabId = `branch-${selectedBranch.BranchID}`;
            
            const newTab = {
                id: tabId,
                title: selectedBranch.BranchName,
                url: `/[tenantId]/(main)/branchdetails/${selectedBranch.BranchID}`,
                lazyComponent: () => import("./DetailsBranch").then(mod => ({
                    default: () => (
                        <DetailsBranch 
                            branchData={{
                                id: selectedBranch.BranchID.toString(),
                                name: selectedBranch.BranchName,
                                stats: {
                                    checkCount: 0,
                                    checkAverage: 0,
                                    discount: 0,
                                    peopleCount: 0,
                                    peopleAverage: 0,
                                    canceled: 0
                                },
                                revenue: {
                                    openChecks: 0,
                                    closedChecks: 0,
                                    total: 0
                                },
                                orders: []
                            }}
                            allBranches={availableBranches}
                        />
                    )
                }))
            };
            
            addTab(newTab);
            setActiveTab(newTab.id);
            setCurrentBranch(selectedBranch);
        } else {
            setCurrentBranch(selectedBranch);
        }
    };

    const filteredBranches = availableBranches.filter((branch) =>
        branch.BranchName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(90vh-4rem)] overflow-y-auto w-full
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
            <div className="mx-auto space-y-6 py-6">
                <Card className="p-3 sm:p-4 border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 transition-all duration-300">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <h2 className="text-base sm:text-lg font-semibold">Filtreler</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                            <Popover 
                                open={isOpen}
                                onOpenChange={setIsOpen}
                                className="flex-1"
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isOpen}
                                        className={cn(
                                            "w-full justify-between bg-background/60 backdrop-blur-sm h-9 sm:h-10",
                                            "border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                                            "hover:border-border hover:bg-background/80",
                                            "text-sm sm:text-base"
                                        )}
                                    >
                                        <span className="truncate">
                                            {selectedBranch ? selectedBranch.BranchName : "Şube seçiniz"}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] sm:w-[300px] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                                    <Command>
                                        <CommandInput 
                                            placeholder="Şube ara..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>Şube bulunamadı.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredBranches.map((branch) => (
                                                    <CommandItem
                                                        key={branch.BranchID}
                                                        value={branch.BranchName}
                                                        onSelect={() => {
                                                            setSelectedBranch(branch);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-sm"
                                                    >
                                                        <Store className="mr-2 h-4 w-4" />
                                                        <span className="truncate flex-1">{branch.BranchName}</span>
                                                        {selectedBranch?.BranchID === branch.BranchID && (
                                                            <Check className="ml-2 h-4 w-4 flex-shrink-0" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Select 
                                value={tempDateRange} 
                                onValueChange={setTempDateRange} 
                                className="flex-1"
                            >
                                <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border h-9 sm:h-10 text-sm sm:text-base">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <SelectValue placeholder="Tarih Aralığı Seçin" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                                    {dateRanges.map((range) => (
                                        <SelectItem
                                            key={range.value}
                                            value={range.value}
                                            className="cursor-pointer text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${range.color}`} />
                                                {range.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button 
                                variant="default"
                                className="px-4 sm:px-8 h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto"
                                onClick={handleApply}
                                disabled={!selectedBranch}
                            >
                                Uygula
                            </Button>
                        </div>

                        {tempDateRange === "custom" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal h-10 sm:h-12 border-2 border-border/60 rounded-xl text-sm sm:text-base w-full",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {startDate ? format(startDate, "PPP", { locale: tr }) : "Başlangıç Tarihi"}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal h-10 sm:h-12 border-2 border-border/60 rounded-xl text-sm sm:text-base w-full",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {endDate ? format(endDate, "PPP", { locale: tr }) : "Bitiş Tarihi"}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </Card>

                {isLoading || !branchDataReady ? (
                    <div className="w-full h-[400px] flex items-center justify-center">
                        <PulseLoader color="#0ea5e9" size={15} margin={5} />
                    </div>
                ) : currentBranch && startDate && endDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <BranchStats 
                            selectedBranch={currentBranch} 
                            startDate={startDate} 
                            endDate={endDate}
                        />
                        <BranchCharts 
                            selectedBranch={currentBranch} 
                            startDate={startDate} 
                            endDate={endDate}
                        />
                        <OrdersTable 
                            selectedBranch={currentBranch} 
                            startDate={startDate} 
                            endDate={endDate}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
