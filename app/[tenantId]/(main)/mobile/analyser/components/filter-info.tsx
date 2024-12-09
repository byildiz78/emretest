import { useFilterStore } from "@/stores/filters-store";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, ArrowRight, ListFilter } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface FilterInfoProps {
    selectedMenu: string | null;
    isLoading: boolean;
    handleAnalyze: (menuId: string) => void;
}

export function FilterInfo({ selectedMenu, isLoading, handleAnalyze }: FilterInfoProps) {
    const { selectedFilter } = useFilterStore();

    if (!selectedMenu) return null;

    return (
        <div className="bg-card border rounded-lg p-4 mb-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {format(selectedFilter.date.from, "d MMMM yyyy", { locale: tr })} -{" "}
                        {format(selectedFilter.date.to, "d MMMM yyyy", { locale: tr })}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>
                        {selectedFilter.selectedBranches.length > 0
                            ? `${selectedFilter.selectedBranches.length} şube seçili`
                            : "Tüm şubeler"}
                    </span>
                </div>

                <Button
                    onClick={() => handleAnalyze(selectedMenu)}
                    disabled={isLoading}
                    className="w-full mt-2"
                >
                    {isLoading ? (
                        "Analiz yapılıyor..."
                    ) : (
                        <>
                            Analiz Et
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
