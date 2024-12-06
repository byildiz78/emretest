"use client";

import { Calendar, Store, Search, Check, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfYear, endOfYear } from "date-fns";
import { tr } from "date-fns/locale";
import BranchStats from "@/app/[tenantId]/(main)/dashboard/components/BranchStats";
import BranchCharts from "@/app/[tenantId]/(main)/dashboard/components/BranchCharts";
import OrdersTable from "@/app/[tenantId]/(main)/dashboard/components/OrdersTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/stores/tab-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

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
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [availableBranches, setAvailableBranches] = useState<Efr_Branches[]>([]);
    
    // Mevcut şube (görüntülenen)
    const [currentBranch, setCurrentBranch] = useState<Efr_Branches | null>(null);
    // Seçilen şube (henüz uygulanmamış)
    const [selectedBranch, setSelectedBranch] = useState<Efr_Branches | null>(null);
    // Seçilen tarih aralığı (henüz uygulanmamış)
    const [tempDateRange, setTempDateRange] = useState("today");

    // Şubeleri çek
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('/api/efr_branches');
                const data = await response.json();
                setAvailableBranches(data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };

        fetchBranches();
    }, []);

    // Başlangıçta mevcut şubeyi ayarla
    useEffect(() => {
        if (branchData?.id && !currentBranch) {
            const branch = {
                BranchID: parseInt(branchData.id),
                BranchName: branchData.name
            };
            setCurrentBranch(branch);
            setSelectedBranch(branch);
        }
    }, [branchData, currentBranch]);

    // API istekleri için tarih aralığını ayarla
    useEffect(() => {
        const today = new Date();
        const date1 = new Date(today);
        date1.setHours(6, 0, 0, 0);
        
        const date2 = new Date(today);
        date2.setDate(date2.getDate() + 1);
        date2.setHours(6, 0, 0, 0);

        setStartDate(date1);
        setEndDate(date2);
    }, []);

    const handleApply = () => {
        if (!selectedBranch) return;

        // Tarih aralığını güncelle
        setDateRange(tempDateRange);

        // Tarih değerlerini ayarla
        const today = new Date();
        let newStartDate = startDate;
        let newEndDate = endDate;

        switch (tempDateRange) {
            case "today":
                newStartDate = new Date(today);
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = new Date(today);
                newEndDate.setDate(newEndDate.getDate() + 1);
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                newStartDate = new Date(yesterday);
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = new Date(today);
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "thisWeek":
                newStartDate = startOfWeek(today, { weekStartsOn: 1 });
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = endOfWeek(today, { weekStartsOn: 1 });
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "lastWeek":
                const lastWeek = subWeeks(today, 1);
                newStartDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "thisMonth":
                newStartDate = startOfMonth(today);
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = endOfMonth(today);
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "lastMonth":
                const lastMonth = subMonths(today, 1);
                newStartDate = startOfMonth(lastMonth);
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = endOfMonth(lastMonth);
                newEndDate.setHours(6, 0, 0, 0);
                break;
            case "thisYear":
                newStartDate = startOfYear(today);
                newStartDate.setHours(6, 0, 0, 0);
                newEndDate = endOfYear(today);
                newEndDate.setHours(6, 0, 0, 0);
                break;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);

        // Şube değişti mi kontrol et
        if (currentBranch?.BranchID !== selectedBranch.BranchID) {
            // Farklı şube seçildiyse yeni tab aç
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
            // Aynı şube seçildiyse mevcut tabı güncelle
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
                <Card className="p-3 border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 transition-all duration-300">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Filtreler</h2>
                        </div>

                        <div className="flex flex-row items-center gap-4">
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
                                            "w-full justify-between bg-background/60 backdrop-blur-sm",
                                            "border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                                            "hover:border-border hover:bg-background/80"
                                        )}
                                    >
                                        {selectedBranch ? selectedBranch.BranchName : "Şube seçiniz"}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
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
                                                    >
                                                        <Store className="mr-2 h-4 w-4" />
                                                        {branch.BranchName}
                                                        {selectedBranch?.BranchID === branch.BranchID && (
                                                            <Check className="ml-auto h-4 w-4" />
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
                                <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Tarih Aralığı Seçin" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                                    {dateRanges.map((range) => (
                                        <SelectItem
                                            key={range.value}
                                            value={range.value}
                                            className="cursor-pointer"
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
                                className="px-8 h-10"
                                onClick={handleApply}
                                disabled={!selectedBranch}
                            >
                                Uygula
                            </Button>
                        </div>

                        {tempDateRange === "custom" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal h-12 border-2 border-border/60 rounded-xl",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {startDate ? (
                                                format(startDate, "PPP", { locale: tr })
                                            ) : (
                                                "Başlangıç Tarihi"
                                            )}
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
                                                "justify-start text-left font-normal h-12 border-2 border-border/60 rounded-xl",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {endDate ? (
                                                format(endDate, "PPP", { locale: tr })
                                            ) : (
                                                "Bitiş Tarihi"
                                            )}
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

                {currentBranch && (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}
