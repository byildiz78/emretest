import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await fetch('/api/branchdetailwidgets');
        const data: WebWidget[] = await response.json();
        
        const initialStates: WidgetData[] = data.map(widget => ({
          widget,
          loading: true,
          value: null
        }));
        setWidgetStates(initialStates);

        data.forEach(async (widget, index) => {
          if (widget.ReportID && startDate && endDate) {
            try {
              const params = {
                date1: startDate.toISOString(),
                date2: endDate.toISOString(),
                reportId: widget.ReportID,
                branches: [selectedBranch.BranchID]
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
                  value: null
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

    if (selectedBranch && startDate && endDate) {
      fetchWidgets();
    }
  }, [selectedBranch, startDate, endDate]);

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
    const colors = [
      'blue',
      'emerald',
      'violet',
      'rose',
      'amber',
      'cyan',
      'indigo',
      'green'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 p-4 sm:p-6">
      {widgetStates.map((widgetState, index) => {
        const Icon = LucideIcons[widgetState.widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
        const color = getColorByIndex(index);
        const isHovered = hoveredIndex === index;
        
        return (
          <motion.div
            key={widgetState.widget.AutoID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              rotateY: 5,
              z: 50
            }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative perspective"
          >
            <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
              {/* Animated Background Patterns */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-transparent dark:from-gray-800 dark:via-gray-900 dark:to-transparent" />
                <motion.div
                  className={`absolute top-0 left-0 w-32 h-32 bg-${color}-200 dark:bg-${color}-800 rounded-full blur-3xl`}
                  animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                    opacity: isHovered ? [0.3, 0.5, 0.3] : 0.3,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className={`absolute bottom-0 right-0 w-32 h-32 bg-${color}-300 dark:bg-${color}-700 rounded-full blur-3xl`}
                  animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                    opacity: isHovered ? [0.3, 0.5, 0.3] : 0.3,
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>

              {/* Card Content */}
              <div className="relative p-6 z-10">
                <motion.div
                  className="flex justify-between items-start mb-6"
                  animate={{ y: isHovered ? -5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="relative text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-current after:to-transparent">
                    {widgetState.widget.ReportName}
                  </h3>
                  <motion.div
                    className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30 
                      shadow-lg backdrop-blur-sm`}
                    whileHover={{ rotate: 15 }}
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? [0, -10, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                  </motion.div>
                </motion.div>

                {/* Value Display */}
                <motion.div
                  className="space-y-4"
                  animate={{ 
                    scale: isHovered ? 1.05 : 1,
                    y: isHovered ? -5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {widgetState.loading ? (
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Yükleniyor...</span>
                    </div>
                  ) : (
                    <motion.p
                      className={`text-3xl font-semibold tracking-tight text-${color}-600 dark:text-${color}-400`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {widgetState.widget.V1Type === 'currency' && widgetState.value?.reportValue1
                        ? formatCurrency(Number(widgetState.value.reportValue1))
                        : widgetState.value?.reportValue1 
                          ? formatNumber(widgetState.value.reportValue1)
                          : '0'}
                    </motion.p>
                  )}
                </motion.div>

                {/* Progress Indicator */}
                <motion.div 
                  className="mt-6"
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-${color}-500 dark:bg-${color}-400`}
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: "100%",
                        transition: { 
                          duration: 1.5,
                          delay: index * 0.2,
                          ease: "easeOut"
                        }
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}