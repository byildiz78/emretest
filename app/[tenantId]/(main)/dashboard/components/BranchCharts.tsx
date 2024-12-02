"use client";

import { Card } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { BranchModel } from "@/types/tables";

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function BranchCharts({ data }: { data: BranchModel }) {
    const chartData = [
        { name: "Cari Dönem", value: Number(data.reportValue2) || 0 },
        { name: "Geçen Hafta", value: Number(data.reportValue3) || 0 },
        { name: "Geçen Hafta (Tüm Gün)", value: Number(data.reportValue4) || 0 }
    ];

    // Grup satış dağılımı için örnek veri
    const salesDistribution = [
        { name: "Yemek", value: 60 },
        { name: "İçecek", value: 25 },
        { name: "Tatlı", value: 15 }
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `%${value}`;
    };

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 border border-border p-2 rounded-lg shadow-lg backdrop-blur-sm">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                        {label ? formatCurrency(payload[0].value) : formatPercentage(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">{data.reportValue1 || 'Şube'} - TOPLAM CİRO ANALİZİ</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={formatCurrency} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">{data.reportValue1 || 'Şube'} - GRUP SATIŞ DAĞILIMI</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={salesDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {salesDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
