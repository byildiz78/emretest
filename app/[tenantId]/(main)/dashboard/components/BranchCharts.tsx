"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
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

export default function BranchCharts() {
  const { selectedFilter } = useFilterStore();
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

    if (selectedFilter?.branches?.length) {
      fetchCharts();
    }
  }, [selectedFilter?.branches]);

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

  const renderChart = (chartState: ChartData, index: number) => {
    if (chartState.loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!chartState.data.length) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Veri bulunamadı
        </div>
      );
    }

    // ReportID 530 için özel pasta grafik
    if (chartState.widget.ReportID === 530) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartState.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (%${percentage.toFixed(1)})`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartState.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    switch (chartState.widget.ChartType?.toLowerCase()) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartState.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} name="Değer" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartState.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" fill={COLORS[0]} stroke={COLORS[0]} name="Değer" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartState.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} name="Değer" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {chartStates.map((chartState, index) => (
        <Card key={chartState.widget.AutoID} className="p-6">
          <div className="flex flex-col space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">{chartState.widget.ReportName}</h3>
            </div>
            {renderChart(chartState, index)}
          </div>
        </Card>
      ))}
    </div>
  );
}
