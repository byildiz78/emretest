"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDateTimeYMDHI } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Languages,
  Bell,
  Settings,
  User,
  Trash2,
  CheckCircle2,
  Filter,
  Workflow,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/stores/filters-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { Efr_Branches } from "@/types/tables";
import { BranchProvider } from "@/providers/branch-provider";
import { TimePicker } from "@/components/ui/time-picker";
import { useParams } from "next/navigation";
import { useTabStore } from "@/stores/tab-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/stores/settings-store";

const translations = {
  tr: {
    startDate: "Başlangıç Tarihi",
    endDate: "Bitiş Tarihi",
    allBranches: "Tüm Şubeler",
    branchesSelected: "Şube Seçili",
    searchBranch: "Şube ara...",
    branchNotFound: "Şube bulunamadı.",
    apply: "Uygula",
    refresh: "Yenile",
    notifications: "Bildirimler",
    settings: "Ayarlar",
    profile: "Profil",
    time: "Saat",
    dateRange: "Tarih Aralığı",
    today: "Bugün",
    yesterday: "Dün",
    thisWeek: "Bu Hafta",
    lastWeek: "Geçen Hafta",
    thisMonth: "Bu Ay",
    lastMonth: "Geçen Ay",
    thisYear: "Bu Yıl",
    clearSelected: "Seçimleri Temizle",
    customRange: "Özel Aralık",
    cancel: "İptal",
    functions: "Tarih - Şube Seçimi",
  },
  en: {
    startDate: "Start Date",
    endDate: "End Date",
    allBranches: "All Branches",
    branchesSelected: "Branches Selected",
    searchBranch: "Search branch...",
    branchNotFound: "Branch not found.",
    apply: "Apply",
    refresh: "Refresh",
    notifications: "Notifications",
    settings: "Settings",
    profile: "Profile",
    time: "Time",
    dateRange: "Date Range",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
    clearSelected: "Clear Selected",
    customRange: "Custom Range",
    cancel: "Cancel",
    functions: "Functions",
  },
  ar: {
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    allBranches: "جميع الفروع",
    branchesSelected: "الفروع المحددة",
    searchBranch: "البحث عن فرع...",
    branchNotFound: "لم يتم العثور على فرع.",
    apply: "تطبيق",
    refresh: "تحديث",
    notifications: "إشعارات",
    settings: "إعدادات",
    profile: "الملف الشخصي",
    time: "الوقت",
    dateRange: "نطاق التاريخ",
    today: "اليوم",
    yesterday: "أمس",
    thisWeek: "هذا الأسبوع",
    lastWeek: "الأسبوع الماضي",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    thisYear: "هذه السنة",
    clearSelected: "مسح المحدد",
    customRange: "النطاق المخصص",
    cancel: "إلغاء",
    functions: "الوظائف",
  },
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [desktopBranchOpen, setDesktopBranchOpen] = useState(false);
  const [mobileBranchOpen, setMobileBranchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDateBranchModalOpen, setIsDateBranchModalOpen] = useState(false);
  const { settings } = useSettingsStore();

  const { selectedFilter, setFilter, handleStartDateSelect, handleEndDateSelect } = useFilterStore();
  const [pendingBranches, setPendingBranches] = useState(
    selectedFilter.selectedBranches
  );

  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(selectedFilter.date.from);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(selectedFilter.date.to);
  const [tempStartTime, setTempStartTime] = useState<string>("00:00");
  const [tempEndTime, setTempEndTime] = useState<string>("23:59");

  const { setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const addTab = useTabStore((state) => state.addTab);

  useEffect(() => {
    if (settings.length > 0) {
      const daystart = parseInt(settings.find(setting => setting.Kod === "daystart")?.Value || '0');

      let startTime: string;
      let endTime: string;

      if (daystart === 0) {
        startTime = "00:00";
        endTime = "23:59";
      } else {
        const startHour = daystart.toString().padStart(2, '0');
        startTime = `${startHour}:00`;
        const endHour = ((daystart - 1 + 24) % 24).toString().padStart(2, '0');
        endTime = `${endHour}:59`;
      }

      setTempStartTime(startTime);
      setTempEndTime(endTime);

      if (selectedFilter.date.from && selectedFilter.date.to) {
        const fromDate = new Date(selectedFilter.date.from);
        const toDate = new Date(selectedFilter.date.to);

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        fromDate.setHours(startHours, startMinutes, 0);
        toDate.setHours(endHours, endMinutes, 59);

        if (tempStartDate) {
          const newTempStartDate = new Date(tempStartDate);
          newTempStartDate.setHours(startHours, startMinutes, 0);
          setTempStartDate(newTempStartDate);
        }

        if (tempEndDate) {
          const newTempEndDate = new Date(tempEndDate);
          newTempEndDate.setHours(endHours, endMinutes, 59);
          setTempEndDate(newTempEndDate);
        }

        setFilter({
          ...selectedFilter,
          date: {
            from: fromDate,
            to: toDate
          }
        });

        console.log(selectedFilter)
      }
    }
  }, [settings]);
  const applyFilters = () => {
    if (tempStartDate) {
      const [hours, minutes] = tempStartTime.split(':');
      const newStartDate = new Date(tempStartDate);
      newStartDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      handleStartDateSelect(newStartDate);
    }

    if (tempEndDate) {
      const [hours, minutes] = tempEndTime.split(':');
      const newEndDate = new Date(tempEndDate);
      newEndDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      handleEndDateSelect(newEndDate);
    }

    setFilter({
      ...selectedFilter,
      date: {
        from: tempStartDate,
        to: tempEndDate,
      },
      selectedBranches: pendingBranches,
    });

    setIsMobileFiltersOpen(false);
    setIsDateBranchModalOpen(false);
  };

  const clearSelectedBranches = () => {
    setPendingBranches([]);
  };

  const dateRangeChange = (value: string) => {
    const today = new Date();
    const tomorrow = addDays(new Date(), 1);
    switch (value) {
      case "today":
        setTempStartDate(today);
        setTempEndDate(tomorrow);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setTempStartDate(yesterday);
        setTempEndDate(today);
        break;
      case "thisWeek":
        setTempStartDate(startOfWeek(today, { weekStartsOn: 1 }));
        setTempEndDate(endOfWeek(today, { weekStartsOn: 1 }));
        break;

      case "lastWeek":
        const lastWeek = subWeeks(today, 1);
        setTempStartDate(startOfWeek(lastWeek, { weekStartsOn: 1 }));
        setTempEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
        break;
      case "thisMonth":
        setTempStartDate(startOfMonth(today));
        setTempEndDate(endOfMonth(today));
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        setTempStartDate(startOfMonth(lastMonth));
        setTempEndDate(endOfMonth(lastMonth));
        break;
      case "thisYear":
        setTempStartDate(startOfYear(today));
        setTempEndDate(endOfYear(today));
        break;
      case "lastYear":
        const lastYear = subYears(today, 1);
        setTempStartDate(startOfYear(lastYear));
        setTempEndDate(endOfYear(lastYear));
        break;
      case "lastSevenDays":
        setTempStartDate(subDays(today, 7));
        setTempEndDate(today);
        break;
      default:
        break;
    }
  };

  const handleTabOpen = (id: string, title: string) => {
    const existingTab = useTabStore.getState().tabs.find(tab => tab.id === id);
    if (existingTab) {
      useTabStore.getState().setActiveTab(id);
    } else {
      addTab({
        id,
        title,
        lazyComponent: () => import(`@/app/[tenantId]/(main)/${id}/page`),
      });
    }
  };

  return (
    <BranchProvider>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-lg dark:shadow-slate-900/20">
        <div className="flex-end h-16 items-center p-4 gap-4">
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 flex-1">
            <Select onValueChange={dateRangeChange} defaultValue="today">
              <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border">
                <SelectValue placeholder={t.dateRange} />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                <SelectItem value="today">{t.today}</SelectItem>
                <SelectItem value="yesterday">{t.yesterday}</SelectItem>
                <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                <SelectItem value="lastWeek">{t.lastWeek}</SelectItem>
                <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                <SelectItem value="thisYear">{t.thisYear}</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/60 backdrop-blur-sm",
                      "border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                      "hover:border-border hover:bg-background/80",
                      !tempStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempStartDate
                      ? formatDateTimeYMDHI(tempStartDate)
                      : t.startDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                  align="start"
                >
                  <div className="p-4 space-y-4">
                    <Calendar
                      mode="single"
                      selected={tempStartDate}
                      onSelect={(date) => {
                        if (date) {
                          const [hours, minutes] = tempStartTime.split(':');
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                          setTempStartDate(newDate);
                        } else {
                          setTempStartDate(undefined);
                        }
                      }}
                      initialFocus
                      disabled={(date: Date) =>
                        tempEndDate ? date > tempEndDate : false
                      }
                      className="rounded-md border-border/50"
                    />
                    <TimePicker
                      value={tempStartTime}
                      onChange={(value) => {
                        setTempStartTime(value);
                        if (tempStartDate) {
                          const [hours, minutes] = value.split(':');
                          const newDate = new Date(tempStartDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                          setTempStartDate(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/60 backdrop-blur-sm",
                      "border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                      "hover:border-border hover:bg-background/80",
                      !tempEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempEndDate
                      ? formatDateTimeYMDHI(tempEndDate)
                      : t.endDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                  align="start"
                >
                  <div className="p-4 space-y-4">
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={(date) => {
                        if (date) {
                          const [hours, minutes] = tempEndTime.split(':');
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                          setTempEndDate(newDate);
                        } else {
                          setTempEndDate(undefined);
                        }
                      }}
                      initialFocus
                      disabled={(date: Date) =>
                        tempStartDate ? date < tempStartDate : false
                      }
                      className="rounded-md border-border/50"
                    />
                    <TimePicker
                      value={tempEndTime}
                      onChange={(value) => {
                        setTempEndTime(value);
                        if (tempEndDate) {
                          const [hours, minutes] = value.split(':');
                          const newDate = new Date(tempEndDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                          setTempEndDate(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Popover
                open={desktopBranchOpen}
                onOpenChange={setDesktopBranchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={desktopBranchOpen}
                    className={cn(
                      "flex-1 justify-between bg-background/60 backdrop-blur-sm",
                      "border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
                      "hover:border-border hover:bg-background/80"
                    )}
                  >
                    {pendingBranches.length > 0
                      ? `${pendingBranches.length} ${t.branchesSelected}`
                      : t.allBranches}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                  <Command>
                    <div className="flex items-center p-2 border-b border-border/50">
                      <CommandInput
                        placeholder={t.searchBranch}
                        className="h-9 border-none focus:ring-0"
                      />
                    </div>
                    <CommandEmpty>{t.branchNotFound}</CommandEmpty>
                    <CommandGroup>
                      <CommandList
                        className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
                      >
                        {selectedFilter.branches.map((branch: Efr_Branches) => (
                          <CommandItem
                            key={branch.BranchID}
                            onSelect={() => {
                              const isSelected = pendingBranches.find(
                                (selectedBranch: Efr_Branches) =>
                                  selectedBranch.BranchID === branch.BranchID
                              );

                              const newSelectedBranches = isSelected
                                ? pendingBranches.filter(
                                  (selectedBranch: Efr_Branches) =>
                                    selectedBranch.BranchID !==
                                    branch.BranchID
                                )
                                : [...pendingBranches, branch];

                              setPendingBranches(newSelectedBranches);
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50"
                          >
                            <Checkbox
                              checked={
                                pendingBranches.find(
                                  (selectedBranch: Efr_Branches) =>
                                    selectedBranch.BranchID === branch.BranchID
                                )
                                  ? true
                                  : false
                              }
                              className="border-border/50"
                            />
                            <span>{branch.BranchName}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                {pendingBranches.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearSelectedBranches}
                    className="shrink-0"
                    title={t.clearSelected}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}

                <Button
                  onClick={applyFilters}
                  className={cn(
                    "bg-blue-200 hover:bg-blue-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-gray-900",
                    "hidden sm:flex"
                  )}
                >
                  {t.apply}
                </Button>

                <Button
                  onClick={applyFilters}
                  size="icon"
                  className={cn(
                    "bg-blue-200 hover:bg-blue-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-gray-900",
                    "flex sm:hidden"
                  )}
                  title={t.apply}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="flex md:hidden items-center justify-between gap-4 px-2">
            {/* Filter Button with Badge */}
            <div className="relative">
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsDateBranchModalOpen(true)}
                className={cn(
                  "flex items-center gap-2 bg-background/80 backdrop-blur-sm",
                  "shadow-sm hover:shadow-md transition-all duration-300",
                  isDateBranchModalOpen && "bg-accent"
                )}
              >
                <Filter className="h-5 w-5" />
                <span>{t.functions}</span>
                {(tempStartDate || tempEndDate || pendingBranches.length > 0) && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    {(!!tempStartDate ? 1 : 0) + (!!tempEndDate ? 1 : 0) + (pendingBranches.length > 0 ? 1 : 0)}
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex items-center gap-2 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {useTheme().theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    <span className="hidden xs:inline">
                      {useTheme().theme === "dark" ? "Dark" : "Light"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="p-1.5 bg-accent/30 rounded-md">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Light</span>
                      <span className="text-xs text-muted-foreground">Light theme for bright environments</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="p-1.5 bg-accent/30 rounded-md">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Dark</span>
                      <span className="text-xs text-muted-foreground">Dark theme for low-light environments</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex items-center gap-2 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                     <span> {language === "tr" ? "TR" : language === "en" ? "EN" : "AR"}
                    </span>
                  
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setLanguage("tr")}
                    className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="p-1.5 bg-accent/30 rounded-md text-lg">
                      🇹🇷
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Türkçe</span>
                      <span className="text-xs text-muted-foreground">Turkish</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="p-1.5 bg-accent/30 rounded-md text-lg">
                      🇬🇧
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">English</span>
                      <span className="text-xs text-muted-foreground">English</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("ar")}
                    className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="p-1.5 bg-accent/30 rounded-md text-lg">
                      🇸🇦
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">العربية</span>
                      <span className="text-xs text-muted-foreground">Arabic</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Date-Branch Selection Modal */}
          <Dialog open={isDateBranchModalOpen} onOpenChange={setIsDateBranchModalOpen}>
            <DialogContent className="w-full h-[90vh] max-w-none m-0 p-0 gap-0 rounded-t-xl">
              <DialogHeader className="px-4 py-3 border-b">
                <DialogTitle className="text-lg font-semibold">{t.functions}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Date Range Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{t.dateRange}</span>
                  </div>
                  <Select onValueChange={dateRangeChange} defaultValue="today">
                    <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder={t.dateRange} />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                      <SelectItem value="today">{t.today}</SelectItem>
                      <SelectItem value="yesterday">{t.yesterday}</SelectItem>
                      <SelectItem value="lastWeek">{t.lastWeek}</SelectItem>
                      <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                      <SelectItem value="custom">{t.customRange}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Time Pickers */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t.startDate}</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          "bg-background/60 backdrop-blur-sm border-border/50",
                          "shadow-sm hover:shadow-md transition-all duration-300",
                          tempStartDate && "text-foreground"
                        )}
                        onClick={() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          setTempStartDate(today);
                          setTempStartTime("00:00");
                        }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempStartDate ? formatDateTimeYMDHI(tempStartDate) : t.startDate}
                      </Button>
                      <TimePicker
                        value={tempStartTime}
                        onChange={(value) => {
                          setTempStartTime(value);
                          if (tempStartDate) {
                            const [hours, minutes] = value.split(':');
                            const newDate = new Date(tempStartDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                            setTempStartDate(newDate);
                          }
                        }}
                        className="w-[120px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t.endDate}</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          "bg-background/60 backdrop-blur-sm border-border/50",
                          "shadow-sm hover:shadow-md transition-all duration-300",
                          tempEndDate && "text-foreground"
                        )}
                        onClick={() => {
                          const today = new Date();
                          today.setHours(23, 59, 0, 0);
                          setTempEndDate(today);
                          setTempEndTime("23:59");
                        }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempEndDate ? formatDateTimeYMDHI(tempEndDate) : t.endDate}
                      </Button>
                      <TimePicker
                        value={tempEndTime}
                        onChange={(value) => {
                          setTempEndTime(value);
                          if (tempEndDate) {
                            const [hours, minutes] = value.split(':');
                            const newDate = new Date(tempEndDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                            setTempEndDate(newDate);
                          }
                        }}
                        className="w-[120px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Branch Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Workflow className="h-4 w-4" />
                      <span>{t.branches}</span>
                    </div>
                    {pendingBranches.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedBranches}
                        className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t.clear}
                      </Button>
                    )}
                  </div>

                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder={t.searchBranch}
                      className="h-9"
                    />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                          <span>{t.branchNotFound}</span>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {selectedFilter.branches.map((branch: Efr_Branches) => (
                          <CommandItem
                            key={branch.BranchID}
                            onSelect={() => {
                              const isSelected = pendingBranches.find(
                                (selectedBranch: Efr_Branches) =>
                                  selectedBranch.BranchID === branch.BranchID
                              );

                              const newSelectedBranches = isSelected
                                ? pendingBranches.filter(
                                  (selectedBranch: Efr_Branches) =>
                                    selectedBranch.BranchID !== branch.BranchID
                                )
                                : [...pendingBranches, branch];

                              setPendingBranches(newSelectedBranches);
                            }}
                            className="flex items-center gap-2 px-2 py-1.5"
                          >
                            <Checkbox
                              checked={
                                pendingBranches.find(
                                  (selectedBranch: Efr_Branches) =>
                                    selectedBranch.BranchID === branch.BranchID
                                )
                                  ? true
                                  : false
                              }
                              className="border-border/50"
                            />
                            <span>{branch.BranchName}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </div>

              {/* Footer with Apply Button */}
              <div className="border-t p-4 bg-background/95 backdrop-blur-md">
                <Button
                  onClick={applyFilters}
                  className="w-full bg-blue-200 hover:bg-blue-300 text-gray-900"
                >
                  {t.apply}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ... */}
      </header>
    </BranchProvider>
  );
}
