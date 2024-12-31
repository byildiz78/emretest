"use client";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn, formatDateTimeDMYHI, formatDateTimeYMDHI } from "../lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Bell,
  Settings,
  Trash2,
  CheckCircle2,
  Filter,
  Workflow,
} from "lucide-react";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useTheme } from "../providers/theme-provider";
import { useLanguage } from "../providers/language-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFilterStore } from "../stores/filters-store";
import { SidebarTrigger } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
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
import { Efr_Branches } from "../types/tables";
import { BranchProvider } from "../providers/branch-provider";
import { TimePicker } from "./ui/time-picker";
import { useTabStore } from "../stores/tab-store";
import { useSettingsStore } from "@/stores/settings-store";
import { toZonedTime } from "date-fns-tz";
import { useExpo } from "@/hooks/use-expo";
import { useTab } from "@/hooks/use-tab";

import "flag-icons/css/flag-icons.min.css";

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
    functions: "Fonksiyonlar",
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
  const [desktopBranchOpen, setDesktopBranchOpen] = React.useState(false);
  const [mobileBranchOpen, setMobileBranchOpen] = React.useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const { selectedFilter, setFilter, handleStartDateSelect, handleEndDateSelect } = useFilterStore();
  const { settings } = useSettingsStore();
  const { activeTab } = useTabStore();
  const [tempStartTime, setTempStartTime] = React.useState<string>("00:00");
  const [tempEndTime, setTempEndTime] = React.useState<string>("23:59");
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(selectedFilter.date.from);
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(selectedFilter.date.to);
  const { setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  
  const {handleTabOpen } = useTab();
  React.useEffect(() => {
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

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const fromDate = new Date(new Date().setHours(startHours, startMinutes, 0));
        const toDate = addDays(new Date().setHours(endHours, endMinutes, 0), 1);

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
            from: toZonedTime(fromDate, 'Europe/Istanbul'),
            to: toZonedTime(toDate, 'Europe/Istanbul') 
          }
        });

      }
    }
  }, [settings]);
  const [pendingBranches, setPendingBranches] = React.useState(
    selectedFilter.selectedBranches
  );

  React.useEffect(() => {
    setTempStartDate(selectedFilter.date.from);
    setTempEndDate(selectedFilter.date.to);
  }, [selectedFilter.date.from, selectedFilter.date.to, activeTab]);

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
        from: toZonedTime(tempStartDate || new Date(), 'Europe/Istanbul'),
        to: toZonedTime(tempEndDate|| new Date(), 'Europe/Istanbul') 
      },
      selectedBranches: pendingBranches,
    });
  };

  const clearSelectedBranches = () => {
    setPendingBranches([]);
  };

  const determineDateRange = (fromDate: Date, toDate: Date) => {
    const daystart = parseInt(settings.find(setting => setting.Kod === "daystart")?.Value || '0');
    let startTime = daystart === 0 ? "00:00" : `${daystart.toString().padStart(2, '0')}:00`;
    let endTime = daystart === 0 ? "23:59" : `${((daystart - 1 + 24) % 24).toString().padStart(2, '0')}:59`;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const today = new Date(new Date().setHours(startHours, startMinutes, 0));
    
    // Bugün kontrolü
    const isToday = fromDate.getDate() === today.getDate() && 
                    fromDate.getMonth() === today.getMonth() &&
                    fromDate.getFullYear() === today.getFullYear();
                    
    if (isToday) return "today";
    
    // Dün kontrolü
    const yesterday = subDays(today, 1);
    const isYesterday = fromDate.getDate() === yesterday.getDate() &&
                        fromDate.getMonth() === yesterday.getMonth() &&
                        fromDate.getFullYear() === yesterday.getFullYear();
                        
    if (isYesterday) return "yesterday";
    
    // Diğer tarih aralıkları için kontroller eklenebilir
    
    return "custom";
  };

  React.useEffect(() => {
    if (selectedFilter.date.from && selectedFilter.date.to) {
      const newDateRange = determineDateRange(selectedFilter.date.from, selectedFilter.date.to);
      setSelectedDateRange(newDateRange);
    }
  }, [selectedFilter.date.from, selectedFilter.date.to, activeTab]);

  const dateRangeChange = (value: string) => {
    setSelectedDateRange(value);
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

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const today = new Date(new Date().setHours(startHours, startMinutes, 0));
    const tomorrow = addDays(new Date().setHours(endHours, endMinutes, 0), 1);
    switch (value) {
      case "today":
        setTempStartDate(today);
        setTempEndDate(tomorrow);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setTempStartDate(new Date(yesterday.setHours(startHours, startMinutes, 0)));
        setTempEndDate(new Date(today.setHours(endHours, endMinutes, 0)));
        break;
      case "thisWeek":
        setTempStartDate(new Date(startOfWeek(today, { weekStartsOn: 1 }).setHours(startHours, startMinutes, 0)));
        setTempEndDate(new Date(endOfWeek(today, { weekStartsOn: 2 }).setHours(endHours, endMinutes, 0)));
        break;

      case "lastWeek":
        const lastWeek = subWeeks(today, 1);
        setTempStartDate(new Date(startOfWeek(lastWeek, { weekStartsOn: 1 }).setHours(startHours, startMinutes, 0)));
        setTempEndDate(new Date(endOfWeek(lastWeek, { weekStartsOn: 2 }).setHours(endHours, endMinutes, 0)));
        break;
      case "thisMonth":
        setTempStartDate(new Date(startOfMonth(today).setHours(startHours, startMinutes, 0)));
        setTempEndDate(addDays(new Date(endOfMonth(today).setHours(endHours, endMinutes, 0)),1));
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        setTempStartDate(new Date(startOfMonth(lastMonth).setHours(startHours, startMinutes, 0)));
        setTempEndDate(addDays(new Date(endOfMonth(lastMonth).setHours(endHours, endMinutes, 0)),1));
        break;
      case "thisYear":
        setTempStartDate(new Date(startOfYear(today).setHours(startHours, startMinutes, 0)));
        setTempEndDate(addDays(new Date(endOfYear(today).setHours(endHours, endMinutes, 0)),1));
        break;
      case "lastYear":
        const lastYear = subYears(today, 1);
        setTempStartDate(new Date(startOfYear(lastYear).setHours(startHours, startMinutes, 0)));
        setTempEndDate(addDays(new Date(endOfYear(lastYear).setHours(endHours, endMinutes, 0)),1));
        break;
      case "lastSevenDays":
        setTempStartDate(subDays(today, 7));
        setTempEndDate(today);
        break;
      default:
        break;
    }
  };

  return (
    <BranchProvider>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md shadow-lg dark:shadow-slate-900/20">
        <div className="flex h-16 items-center px-4 gap-4">
          <SidebarTrigger className="-ml-1" />

          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 flex-1">
          <Select onValueChange={dateRangeChange} value={selectedDateRange}>
              <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border">
                <SelectValue placeholder={t.dateRange} />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                <SelectItem value="today" className="cursor-pointer">{t.today}</SelectItem>
                <SelectItem value="yesterday" className="cursor-pointer">{t.yesterday}</SelectItem>
                <SelectItem value="thisWeek" className="cursor-pointer">{t.thisWeek}</SelectItem>
                <SelectItem value="lastWeek" className="cursor-pointer">{t.lastWeek}</SelectItem>
                <SelectItem value="thisMonth" className="cursor-pointer">{t.thisMonth}</SelectItem>
                <SelectItem value="lastMonth" className="cursor-pointer">{t.lastMonth}</SelectItem>
                <SelectItem value="thisYear" className="cursor-pointer">{t.thisYear}</SelectItem>
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
                      ? formatDateTimeDMYHI(tempStartDate)
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
                      ? formatDateTimeDMYHI(tempEndDate)
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
          <div className="flex md:hidden flex-1 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="hover:bg-accent/50"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/50 transition-colors duration-300 w-[48px] h-[48px] p-0 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {language === "tr" && (
                      <span className="fi fi-tr text-2xl" />
                    )}
                    {language === "en" && (
                      <span className="fi fi-gb text-2xl" />
                    )}
                    {language === "ar" && (
                      <span className="fi fi-sa text-2xl" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl w-48"
              >
                <DropdownMenuItem
                  onClick={() => setLanguage("tr")}
                  className="cursor-pointer flex items-center gap-4 p-4"
                >
                  <span className="fi fi-tr text-2xl" />
                  <span className="text-lg">Türkçe</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className="cursor-pointer flex items-center gap-4 p-4"
                >
                  <span className="fi fi-gb text-2xl" />
                  <span className="text-lg">English</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("ar")}
                  className="cursor-pointer flex items-center gap-4 p-4"
                >
                  <span className="fi fi-sa text-2xl" />
                  <span className="text-lg">العربية</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/50 transition-colors duration-300"
                >
                  <Palette className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
              >
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50"
              onClick={() => handleTabOpen('functions', t.functions)}
            >
              <Workflow className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 md:flex hidden"
              onClick={() => handleTabOpen('notifications', t.notifications)}
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50"
              onClick={() => handleTabOpen('settings', t.settings)}
            >
              <Settings className="h-5 w-5" />
            </Button>

          </div>
        </div>

        {/* Mobile Filters */}
        {isMobileFiltersOpen && (
          <div className="flex flex-col p-4 gap-3 md:hidden border-t border-border/50">
            <Select onValueChange={dateRangeChange} defaultValue="today">
              <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border">
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background/60 backdrop-blur-sm border-border/50 shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempStartDate
                    ? formatDateTimeDMYHI(tempStartDate)
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background/60 backdrop-blur-sm border-border/50 shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempEndDate
                    ? formatDateTimeDMYHI(tempEndDate)
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

            <div className="flex flex-col gap-2">
              <Popover
                open={mobileBranchOpen}
                onOpenChange={setMobileBranchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={mobileBranchOpen}
                    className="w-full justify-between bg-background/60 backdrop-blur-sm border-border/50 shadow-sm"
                  >
                    {pendingBranches.length > 0
                      ? `${pendingBranches.length} ${t.branchesSelected}`
                      : t.allBranches}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
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
                        className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2
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

              {pendingBranches.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSelectedBranches}
                  className="hover:bg-destructive/10 hover:text-destructive self-end"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Button
              onClick={applyFilters}
              className="w-full mt-2 bg-blue-200 hover:bg-blue-300 shadow-md hover:shadow-lg transition-all duration-300 text-gray-900"
            >
              {t.apply}
            </Button>
          </div>
        )}
      </header>
    </BranchProvider>
  );
}
