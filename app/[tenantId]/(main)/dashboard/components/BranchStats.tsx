"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Receipt, Ban, Percent, TrendingUp, Calculator } from "lucide-react";

interface BranchStatsProps {
  data: {
    checkCount: number;
    checkAverage: number;
    discount: number;
    peopleCount: number;
    peopleAverage: number;
    canceled: number;
  };
}

export default function BranchStats({ data }: BranchStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const stats = [
    { 
      label: "ÇEK SAYISI", 
      value: data.checkCount, 
      icon: Receipt,
      color: "bg-blue-500 dark:bg-blue-600",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "ÇEK ORTALAMA", 
      value: formatCurrency(data.checkAverage), 
      icon: Calculator,
      color: "bg-purple-500 dark:bg-purple-600",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    { 
      label: "İNDİRİM", 
      value: formatCurrency(data.discount), 
      icon: Percent,
      color: "bg-yellow-500 dark:bg-yellow-600",
      textColor: "text-yellow-600 dark:text-yellow-400"
    },
    { 
      label: "KİŞİ SAYISI", 
      value: data.peopleCount, 
      icon: Users,
      color: "bg-green-500 dark:bg-green-600",
      textColor: "text-green-600 dark:text-green-400"
    },
    { 
      label: "KİŞİ ORTALAMA", 
      value: formatCurrency(data.peopleAverage), 
      icon: TrendingUp,
      color: "bg-cyan-500 dark:bg-cyan-600",
      textColor: "text-cyan-600 dark:text-cyan-400"
    },
    { 
      label: "İPTAL", 
      value: data.canceled, 
      icon: Ban,
      color: "bg-red-500 dark:bg-red-600",
      textColor: "text-red-600 dark:text-red-400"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted ${stat.textColor}`}>
                  {stat.label}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  Son 24 saat
                </p>
              </div>
              <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${stat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}