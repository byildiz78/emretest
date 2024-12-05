"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import { Loader2 } from "lucide-react";

interface WebWidget {
  AutoID: number;
  ReportName: string;
  ReportIcon: string;
  V1Type: string;
  V1Value: string | number;
  ReportID?: number;
}

interface WidgetData {
  widget: WebWidget;
  loading: boolean;
  value: any;
}

export default function BranchStats() {
  const { selectedFilter } = useFilterStore();
  const [widgetStates, setWidgetStates] = useState<WidgetData[]>([]);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await fetch('/api/branchdetailwidgets');
        const data: WebWidget[] = await response.json();
        
        // Her widget için başlangıç durumu oluştur
        const initialStates: WidgetData[] = data.map(widget => ({
          widget,
          loading: true,
          value: null
        }));
        setWidgetStates(initialStates);

        // Her widget için ayrı veri çek
        data.forEach(async (widget, index) => {
          if (widget.ReportID) {
            try {
              const date1 = new Date();
              const date2 = new Date();
              date1.setHours(6, 0, 0, 0);
              date2.setHours(6, 0, 0, 0);

              const params = {
                date1: date1.toISOString(),
                date2: date2.toISOString(),
                reportId: widget.ReportID,
                branches: selectedFilter?.branches?.map(b => b.BranchID) || []
              };

              const response = await fetch('/api/widgetreport', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
              });

              if (!response.ok) {
                throw new Error('API response was not ok');
              }

              const reportData = await response.json();
              
              setWidgetStates(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = {
                  ...newStates[index],
                  loading: false,
                  value: reportData[0]
                };
                return newStates;
              });
            } catch (error) {
              console.error(`Error fetching data for widget ${widget.ReportName}:`, error);
              setWidgetStates(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = {
                  ...newStates[index],
                  loading: false,
                  value: 'Error'
                };
                return newStates;
              });
            }
          }
        });
      } catch (error) {
        console.error('Error fetching widgets:', error);
      }
    };

    if (selectedFilter?.branches?.length) {
      fetchWidgets();
    }
  }, [selectedFilter?.branches]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getColorByIndex = (index: number): string => {
    // Daha soft ve uyumlu renkler
    const colors = [
      'blue',      // Ana renk - mavi
      'green',     // Pozitif - yeşil
      'indigo',    // Koyu mavi
      'sky',       // Açık mavi
      'emerald',   // Açık yeşil
      'violet',    // Soft mor
      'cyan',      // Turkuaz
      'teal'       // Koyu turkuaz
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgetStates.map((widgetState, index) => {
        const Icon = LucideIcons[widgetState.widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
        const color = getColorByIndex(index);
        
        return (
          <motion.div
            key={widgetState.widget.AutoID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${color}-500 dark:bg-${color}-600`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted text-${color}-600 dark:text-${color}-400`}>
                  {widgetState.widget.ReportName}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {widgetState.loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Yükleniyor...</span>
                    </div>
                  ) : (
                    widgetState.widget.V1Type === 'currency' && widgetState.value?.reportValue1
                      ? formatCurrency(Number(widgetState.value.reportValue1))
                      : widgetState.value?.reportValue1 || '0'
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Son 24 saat
                </p>
              </div>
              <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-${color}-500`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}