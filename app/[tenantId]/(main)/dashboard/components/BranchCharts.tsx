"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LabelList
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
  '#0088FE',  // Mavi
  '#00C49F',  // Yeşil
  '#FFBB28',  // Sarı
  '#FF8042',  // Turuncu
  '#8884d8',  // Mor
  '#82ca9d',  // Açık Yeşil
  '#ffc658',  // Altın
  '#ff7300',  // Koyu Turuncu
];

export default function BranchCharts({ selectedBranch, startDate, endDate }: BranchChartsProps) {
  const [chartStates, setChartStates] = useState<ChartData[]>([]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          <p className="text-sm">%{payload[0].payload.percentage.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartState: ChartData) => {
    if (chartState.loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (chartState.widget.ReportID === 530) {
      console.log('Original Chart Data:', chartState.data);

      // API'den gelen veriyi doğru formata dönüştürüyoruz
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

      console.log('Transformed Data:', data);

      return (
        <div className="h-[300px] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value) => 
                  new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0
                  }).format(Number(value))
                }
              />
              <Bar dataKey="value" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value) => 
                    new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(Number(value))
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else {
      // Kategori dağılım grafiği (Pie Chart)
      return (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartState.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartState.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => 
                  new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(value)
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {chartStates.map((chartState, index) => (
        <Card key={index} className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{chartState.widget.ReportName}</h3>
            </div>
            {renderChart(chartState)}
          </div>
        </Card>
      ))}
    </div>
  );
}
