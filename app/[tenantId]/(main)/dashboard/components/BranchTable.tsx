"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFilterStore } from "@/stores/filters-store";
import { Loader2 } from "lucide-react";
import { WebWidgetData } from "@/types/tables";

export default function BranchTable() {
  const { selectedFilter } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<WebWidgetData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedFilter?.branches?.length) {
        setTableData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const date1 = new Date(today);
        date1.setHours(6, 0, 0, 0);
        
        const date2 = new Date(today);
        date2.setDate(date2.getDate() + 1);
        date2.setHours(6, 0, 0, 0);

        const branchIds = selectedFilter.branches.map(b => b.BranchID);

        const response = await fetch('/api/widgetreport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date1: date1.toISOString(),
            date2: date2.toISOString(),
            reportId: 532, // DataTable tipi rapor ID'si
            branches: branchIds
          })
        });

        if (!response.ok) {
          throw new Error('Veri getirme hatası');
        }

        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error('Error fetching table data:', error);
        setError(error instanceof Error ? error.message : 'Veri getirme hatası');
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [selectedFilter?.branches]);

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(numValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        {error}
      </div>
    );
  }

  if (!tableData.length) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sipariş No</TableHead>
            <TableHead>Tarih/Saat</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead>Sipariş Tipi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.reportValue1}</TableCell>
              <TableCell>{row.reportValue2}</TableCell>
              <TableCell>{row.reportValue3}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.reportValue4.toString())}</TableCell>
              <TableCell>{row.reportValue5}</TableCell>
              <TableCell>{row.reportValue6}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}