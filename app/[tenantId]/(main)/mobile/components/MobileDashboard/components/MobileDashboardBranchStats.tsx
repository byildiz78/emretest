import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

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

interface BranchStatsProps {
  selectedBranch: {
    BranchID: number;
    BranchName: string;
  };
  startDate?: Date;
  endDate?: Date;
}

export default function BranchStats({ selectedBranch, startDate, endDate }: BranchStatsProps) {
  const [widgetStates, setWidgetStates] = useState<WidgetData[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  // ... [API fetching code remains the same]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('tr-TR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(numValue);
  };

  const getColorByIndex = (index: number): string => {
    const colors = ['violet', 'blue', 'emerald', 'rose'];
    return colors[index % colors.length];
  };

  return (
    <div className="p-4 space-y-6">
      {/* Branch Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedBranch.BranchName}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {widgetStates.map((widgetState, index) => {
            const Icon = LucideIcons[widgetState.widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
            const color = getColorByIndex(index);
            const isActive = hoveredIndex === index || selectedTab === index;
            const isSelected = selectedTab === index;
            
            return (
              <motion.div
                key={widgetState.widget.AutoID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isSelected ? 1.02 : 1,
                  zIndex: isSelected ? 20 : 1
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedTab(isSelected ? null : index)}
                className="cursor-pointer perspective transform-gpu"
              >
                <Card className={`relative overflow-hidden border-0 bg-white dark:bg-gray-900 
                  shadow-lg transition-all duration-300 ${isActive ? 'shadow-xl' : ''}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-400/20 
                      via-transparent to-${color}-400/10 dark:from-${color}-600/20 
                      dark:to-${color}-600/10`} />
                    <motion.div
                      className={`absolute top-0 left-0 w-full h-full bg-${color}-400/30 
                      dark:bg-${color}-600/30 blur-3xl rounded-full`}
                      animate={{
                        scale: isActive ? 1.2 : 0.8,
                        opacity: isActive ? 0.4 : 0.1,
                      }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        className={`flex items-center gap-3 ${isSelected ? 'scale-105' : ''}`}
                        animate={{ x: isSelected ? 10 : 0 }}
                      >
                        <motion.div
                          className={`p-3 rounded-2xl backdrop-blur-sm bg-${color}-100/80 
                            dark:bg-${color}-900/80`}
                          whileHover={{ rotate: 15 }}
                          animate={{ 
                            rotate: isActive ? [0, -10, 0] : 0,
                            scale: isActive ? 1.1 : 1
                          }}
                        >
                          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                        </motion.div>
                        <motion.h3 
                          className={`text-lg font-semibold text-gray-800 dark:text-gray-100 
                            ${isSelected ? 'text-xl' : ''}`}
                        >
                          {widgetState.widget.ReportName}
                        </motion.h3>
                      </motion.div>
                      <motion.div
                        animate={{ rotate: isSelected ? 90 : 0 }}
                        className="text-gray-400"
                      >
                        <ChevronRight />
                      </motion.div>
                    </div>

                    {/* Value Display */}
                    <motion.div
                      className="space-y-4"
                      animate={{ 
                        scale: isActive ? 1.05 : 1,
                        y: isActive ? -5 : 0
                      }}
                    >
                      {widgetState.loading ? (
                        <div className="flex items-center justify-center space-x-3 h-20">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="text-sm font-medium">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <motion.div
                            className="relative"
                            animate={{ scale: isSelected ? 1.1 : 1 }}
                          >
                            <motion.p
                              className={`text-4xl font-bold text-${color}-600 dark:text-${color}-400 
                                tracking-tight text-center`}
                            >
                              {widgetState.widget.V1Type === 'currency' && widgetState.value?.reportValue1
                                ? formatCurrency(Number(widgetState.value.reportValue1))
                                : widgetState.value?.reportValue1 
                                  ? formatNumber(widgetState.value.reportValue1)
                                  : '0'}
                            </motion.p>
                            <motion.div 
                              className={`absolute -right-2 -top-2 flex items-center gap-1 text-sm 
                                font-medium ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {Math.random() > 0.5 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span>{Math.floor(Math.random() * 30) + 5}%</span>
                            </motion.div>
                          </motion.div>

                          <div className="pt-4">
                            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className={`absolute left-0 top-0 h-full bg-${color}-500 dark:bg-${color}-400`}
                                initial={{ width: "0%" }}
                                animate={{ width: isSelected ? "85%" : "65%" }}
                                transition={{ duration: 1.5, type: "spring" }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/30`}>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Hedef</p>
                              <p className="text-lg font-semibold">₺120,000</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/30`}>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Gerçekleşen</p>
                              <p className="text-lg font-semibold">₺85,000</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/30`}>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Önceki Dönem</p>
                              <p className="text-lg font-semibold">₺75,000</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/30`}>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Büyüme</p>
                              <p className="text-lg font-semibold text-green-500">+13.3%</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}