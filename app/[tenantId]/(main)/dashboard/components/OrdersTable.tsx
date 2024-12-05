"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TableWidget {
    AutoID: number;
    ReportName: string;
    ReportIcon: string;
    ReportIndex: number;
}

export default function OrdersTable() {
    const [tableWidgets, setTableWidgets] = useState<TableWidget[]>([]);

    useEffect(() => {
        const fetchTableWidgets = async () => {
            try {
                const response = await fetch('/api/datatablewidgets');
                const data = await response.json();
                console.log('Table Widgets:', data);
                setTableWidgets(data);
            } catch (error) {
                console.error('Error fetching table widgets:', error);
            }
        };

        fetchTableWidgets();
    }, []);

    const getColorByIndex = (index: number): string => {
        const colors = ['blue', 'purple', 'yellow', 'green', 'cyan', 'red', 'indigo', 'emerald', 'orange', 'pink', 'teal', 'amber'];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-4">
            {tableWidgets.map((widget, index) => {
                const Icon = LucideIcons[widget.ReportIcon as keyof typeof LucideIcons] || LucideIcons.Table;
                const color = getColorByIndex(index);

                return (
                    <Card key={widget.AutoID}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg bg-${color}-500 dark:bg-${color}-600`}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span>{widget.ReportName}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Adisyon No</TableHead>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Personel</TableHead>
                                        <TableHead className="text-right">Tutar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Value'lar daha sonra eklenecek */}
                                    <TableRow>
                                        <TableCell className="font-medium">Loading...</TableCell>
                                        <TableCell>Loading...</TableCell>
                                        <TableCell>Loading...</TableCell>
                                        <TableCell className="text-right">Loading...</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}