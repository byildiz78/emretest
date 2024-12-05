"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ChartWidget {
    AutoID: number;
    ReportName: string;
    ReportIcon: string;
    ReportIndex: number;
    V1Type: string;
    V2Type: string;
    V3Type: string;
}

export default function BranchCharts() {
    const [chartWidgets, setChartWidgets] = useState<ChartWidget[]>([]);

    useEffect(() => {
        const fetchChartWidgets = async () => {
            try {
                const response = await fetch('/api/chartwidgets');
                const data = await response.json();
                console.log('Chart Widgets:', data);
                setChartWidgets(data);
            } catch (error) {
                console.error('Error fetching chart widgets:', error);
            }
        };

        fetchChartWidgets();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const getColorByIndex = (index: number): string => {
        return COLORS[index % COLORS.length];
    };

    // Grup Satış Dağılımı için örnek veri
    const salesDistributionData = [
        { name: 'Grup A', value: 35 },
        { name: 'Grup B', value: 25 },
        { name: 'Grup C', value: 20 },
        { name: 'Grup D', value: 15 },
        { name: 'Diğer', value: 5 },
    ];

    // Diğer grafikler için geçici veri
    const tempBarData = [
        { name: 'A', value: 400 },
        { name: 'B', value: 300 },
        { name: 'C', value: 200 },
        { name: 'D', value: 100 },
    ];

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
                <div className="bg-white p-2 border rounded-lg shadow-lg">
                    <p className="text-sm">{`${label}: ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };

    const getChartTypeFromIcon = (iconName: string): 'bar' | 'pie' => {
        const pieChartIcons = ['PieChart', 'Circle', 'Donut'];
        return pieChartIcons.includes(iconName) ? 'pie' : 'bar';
    };

    const renderChart = (widget: ChartWidget, index: number) => {
        const color = getColorByIndex(index);
        
        // Özel olarak "Grup Satış Dağılımı" için pasta grafik
        if (widget.ReportName === "Grup Satış Dağılımı") {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={salesDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {salesDistributionData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            layout="vertical" 
                            align="right"
                            verticalAlign="middle"
                            formatter={(value, entry: any) => (
                                <span style={{ color: entry.color }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            );
        }

        // Diğer grafikler için varsayılan davranış
        const chartType = getChartTypeFromIcon(widget.ReportIcon);
        return (
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={tempBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <PieChart>
                        <Pie
                            data={tempBarData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill={color}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {tempBarData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={getColorByIndex(i)} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                )}
            </ResponsiveContainer>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartWidgets.map((widget, index) => {
                const Icon = LucideIcons[widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.BarChart;
                const color = getColorByIndex(index);

                return (
                    <Card key={widget.AutoID} className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: color }}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span>{widget.ReportName}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {renderChart(widget, index)}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
