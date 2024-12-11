"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";

interface WebWidget {
  AutoID: number;
  ReportName: string;
  ReportIcon: string;
  V1Type: string;
  V1Value: string | number;
}

export default function BranchDetailWidgets() {
  const [widgets, setWidgets] = useState<WebWidget[]>([]);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await fetch('/api/branchdetailwidgets');
        const data = await response.json();
        setWidgets(data);
      } catch (error) {
        console.error('Error fetching widgets:', error);
      }
    };

    fetchWidgets();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getColorByIndex = (index: number): string => {
    const colors = ['blue', 'purple', 'yellow', 'green', 'cyan', 'red', 'indigo', 'emerald', 'orange', 'pink', 'teal', 'amber'];
    return colors[index % colors.length];
  };

  const gradientColors = [
    {
        bg: "from-emerald-100/95 via-teal-50/85 to-white/80 dark:from-emerald-950/30 dark:via-teal-900/20 dark:to-background/80",
        border: "border-emerald-200/60 dark:border-teal-800/60",
        text: "text-emerald-700 dark:text-teal-400",
        badge: "bg-emerald-500 text-white dark:bg-emerald-600"
    },
    {
        bg: "from-blue-100/95 via-indigo-50/85 to-white/80 dark:from-blue-950/30 dark:via-indigo-900/20 dark:to-background/80",
        border: "border-blue-200/60 dark:border-indigo-800/60",
        text: "text-blue-700 dark:text-indigo-400",
        badge: "bg-blue-500 text-white dark:bg-blue-600"
    },
    {
        bg: "from-sky-100/95 via-blue-50/85 to-white/80 dark:from-sky-950/30 dark:via-blue-900/20 dark:to-background/80",
        border: "border-sky-200/60 dark:border-blue-800/60",
        text: "text-sky-700 dark:text-blue-400",
        badge: "bg-sky-500 text-white dark:bg-blue-600"
    },
    {
        bg: "from-violet-100/95 via-purple-50/85 to-white/80 dark:from-violet-950/30 dark:via-purple-900/20 dark:to-background/80",
        border: "border-violet-200/60 dark:border-purple-800/60",
        text: "text-violet-700 dark:text-purple-400",
        badge: "bg-violet-500 text-white dark:bg-violet-600"
    }
];

const colorSet = gradientColors[columnIndex % gradientColors.length];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((widget, index) => {
        const Icon = LucideIcons[widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
        const color = colorSet(index);
        
        return (
          <motion.div
            key={widget.AutoID}
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
                  {widget.ReportName}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {widget.V1Type === 'currency' ? formatCurrency(Number(widget.V1Value)) : widget.V1Value}
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
