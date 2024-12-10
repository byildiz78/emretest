import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis,
  YAxis, PieChart, Pie, Cell, LabelList
} from "recharts";

interface ChartWidget {
  AutoID: number;
  ReportName: string;
  ReportIcon: string;
  ReportID?: number;
  ChartType?: string;
}

interface ChartData {
  widget: ChartWidget;
  loading: boolean;
  data: any[];
}

interface BranchChartsProps {
  selectedBranch: {
    BranchID: number;
    BranchName: string;
  };
  startDate?: Date;
  endDate?: Date;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#22C55E'  // Green
];

export default function BranchCharts({ selectedBranch, startDate, endDate }: BranchChartsProps) {
  const [chartStates, setChartStates] = useState<ChartData[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await fetch('/api/chartwidgets');
        const data: ChartWidget[] = await response.json();
        
        const initialStates: ChartData[] = data.map(widget => ({
          widget,
          loading: true,
          data: []
        }));
        setChartStates(initialStates);

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
              
              setChartStates(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = {
                  ...newStates[index],
                  loading: false,
                  data: reportData.map((item: any) => ({
                    name: item.reportValue1,
                    value: parseFloat(item.reportValue2),
                    percentage: parseFloat(item.reportValue3)
                  }))
                };
                return newStates;
              });
            } catch (error) {
              console.error(`Error fetching data for chart ${widget.ReportName}:`, error);
              setChartStates(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = {
                  ...newStates[index],
                  loading: false,
                  data: []
                };
                return newStates;
              });
            }
          }
        });
      } catch (error) {
        console.error('Error fetching charts:', error);
      }
    };

    if (selectedBranch && startDate && endDate) {
      fetchCharts();
    }
  }, [selectedBranch, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderCompactValue = (value: number) => 
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);

  const renderPercentage = (value: number) => 
    `%${value.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(payload[0].value)}</p>
          {payload[0].payload?.percentage && (
            <p className="text-sm text-gray-600 dark:text-gray-300">%{payload[0].payload.percentage.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartState: ChartData, index: number) => {
    if (chartState.loading) {
      return (
        <div className="flex items-center justify-center h-[200px] sm:h-[250px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </motion.div>
        </div>
      );
    }

    // ReportID 530 - Günlük/Haftalık/Aylık Karşılaştırma
    if (chartState.widget.ReportID === 530) {
      const data = [
        {
          name: "Bugün",
          value: Number(chartState.data[0]?.name) || 0,
        },
        {
          name: "Geçen Hafta",
          value: Number(chartState.data[0]?.value) || 0,
        },
        {
          name: "Geçen Ay",
          value: Number(chartState.data[0]?.percentage) || 0,
        }
      ];

      return (
        <motion.div 
          className="h-[200px] sm:h-[250px] w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
              barSize={35}
            >
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={renderCompactValue}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                  />
                ))}
                <LabelList 
                  dataKey="value"
                  position="top"
                  formatter={renderCompactValue}
                  style={{ 
                    fill: '#6b7280',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      );
    }

    // ReportID 531 - Kategori Dağılımı
    if (chartState.widget.ReportID === 531) {
      const isMobile = window.innerWidth <= 768;
      const chartHeight = isMobile ? 300 : 250;
      const outerRadius = isMobile ? 80 : 100;
      const innerRadius = isMobile ? 40 : 60;
      
      return (
        <motion.div 
          className="h-[300px] sm:h-[250px] w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pie-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartState.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                labelLine={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '2 2' }}
                label={({ name, value, percent }) => {
                  const formattedValue = renderCompactValue(value);
                  const formattedPercent = renderPercentage(percent * 100);
                  const label = isMobile ? `${formattedPercent}` : `${name}\n${formattedValue}\n${formattedPercent}`;
                  return label;
                }}
              >
                {chartState.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pie-gradient-${index})`}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {chartStates.map((chartState, index) => (
        <motion.div
          key={chartState.widget.AutoID}
          onHoverStart={() => setHoveredCard(index)}
          onHoverEnd={() => setHoveredCard(null)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-transparent dark:from-gray-800 dark:via-gray-900 dark:to-transparent" />
              <motion.div
                className={`absolute -top-20 -right-20 w-40 h-40 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl`}
                animate={{
                  scale: hoveredCard === index ? [1, 1.2, 1] : 1,
                  opacity: hoveredCard === index ? [0.3, 0.5, 0.3] : 0.3,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="relative p-4">
              <motion.div 
                className="flex items-center justify-between mb-4"
                animate={{ y: hoveredCard === index ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-blue-500 after:to-transparent">
                  {chartState.widget.ReportName}
                </h3>
              </motion.div>
              <div className="max-w-full overflow-hidden">
                {renderChart(chartState, index)}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}