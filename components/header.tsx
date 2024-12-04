"use client";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn, formatDateTimeDMY } from "../lib/utils";
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
  X,
  Trash2,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useState } from "react";
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
  },
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [desktopBranchOpen, setDesktopBranchOpen] = useState(false);
  const [mobileBranchOpen, setMobileBranchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { selectedFilter, setFilter } = useFilterStore();
  const [pendingBranches, setPendingBranches] = useState(
    selectedFilter.selectedBranches
  );

  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    selectedFilter.date.from
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    selectedFilter.date.to
  );
  const { setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const applyFilters = () => {
    setFilter({
      ...selectedFilter,
      date: {
        from: selectedStartDate,
        to: selectedEndDate,
      },
      selectedBranches: pendingBranches,
    });
  };

  const clearSelectedBranches = () => {
    setPendingBranches([]);
  };

  const dateRangeChange = (value: string) => {
    const today = new Date();
    const tomorrow = addDays(new Date(), 1);
    switch (value) {
      case "today":
        setSelectedStartDate(today);
        setSelectedEndDate(tomorrow);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setSelectedStartDate(yesterday);
        setSelectedEndDate(today);
        break;
      case "thisWeek":
        setSelectedStartDate(startOfWeek(today, { weekStartsOn: 1 }));
        setSelectedEndDate(endOfWeek(today, { weekStartsOn: 1 }));
        break;

      case "lastWeek":
        const lastWeek = subWeeks(today, 1);
        setSelectedStartDate(startOfWeek(lastWeek, { weekStartsOn: 1 }));
        setSelectedEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
        break;
      case "thisMonth":
        setSelectedStartDate(startOfMonth(today));
        setSelectedEndDate(endOfMonth(today));
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        setSelectedStartDate(startOfMonth(lastMonth));
        setSelectedEndDate(endOfMonth(lastMonth));
        break;
      case "thisYear":
        setSelectedStartDate(startOfYear(today));
        setSelectedEndDate(endOfYear(today));
        break;
      case "lastYear":
        const lastYear = subYears(today, 1);
        setSelectedStartDate(startOfYear(lastYear));
        setSelectedEndDate(endOfYear(lastYear));
        break;
      case "lastSevenDays":
        setSelectedStartDate(subDays(today, 7));
        setSelectedEndDate(today);
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
                      !selectedStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate
                      ? formatDateTimeDMY(selectedStartDate)
                      : t.startDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    initialFocus
                    disabled={(date: Date) =>
                      selectedEndDate ? date > selectedEndDate : false
                    }
                    className="rounded-md border-border/50"
                  />
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
                      !selectedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedEndDate
                      ? formatDateTimeDMY(selectedEndDate)
                      : t.endDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    initialFocus
                    disabled={(date: Date) =>
                      selectedStartDate ? date < selectedStartDate : false
                    }
                    className="rounded-md border-border/50"
                  />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/50 transition-colors duration-300"
                >
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
              >
                <DropdownMenuItem
                  onClick={() => setLanguage("tr")}
                  className="cursor-pointer"
                >
                  Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className="cursor-pointer"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("ar")}
                  className="cursor-pointer"
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-colors duration-300"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-colors duration-300"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-colors duration-300"
            >
              <User className="h-5 w-5" />
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
                  {selectedStartDate
                    ? formatDateTimeDMY(selectedStartDate)
                    : t.startDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  initialFocus
                  disabled={(date: Date) =>
                    selectedEndDate ? date > selectedEndDate : false
                  }
                  className="rounded-md border-border/50"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background/60 backdrop-blur-sm border-border/50 shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedEndDate
                    ? formatDateTimeDMY(selectedEndDate)
                    : t.endDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={setSelectedEndDate}
                  initialFocus
                  disabled={(date: Date) =>
                    selectedStartDate ? date < selectedStartDate : false
                  }
                  className="rounded-md border-border/50"
                />
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
