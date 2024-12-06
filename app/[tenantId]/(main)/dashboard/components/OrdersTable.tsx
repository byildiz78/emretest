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
import { WebWidget, WebWidgetData } from "@/types/tables";

export default function OrdersTable() {
  const { selectedFilter } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<WebWidgetData[]>([]);
  const [tableWidget, setTableWidget] = useState<WebWidget | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableWidget = async () => {
      try {
        const response = await fetch('/api/datatablewidgets');
        const widgets = await response.json();
        const dataTableWidget = widgets.find((w: WebWidget) => w.ReportType === 'datatable');
        if (dataTableWidget) {
          setTableWidget(dataTableWidget);
        }
      } catch (error) {
        console.error('Error fetching table widget:', error);
        setError('Widget bilgisi alınamadı');
      }
    };

    fetchTableWidget();
  }, []);

  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedFilter?.branches?.length || !tableWidget?.ReportID) {
        setTableData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const today = new Date();
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
            reportId: tableWidget.ReportID,
            branches: branchIds
          })
        });

        if (!response.ok) {
          setTableData([]);
          return;
        }

        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error('Error fetching table data:', error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    // Sadece bir şube seçili olduğunda veriyi çek
    if (selectedFilter?.branches?.length === 1) {
      fetchTableData();
    }
  }, [selectedFilter?.branches, tableWidget]);

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(numValue);
  };

  const renderTable = () => (
    <div className="rounded-md border">
      {tableWidget && (
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">{tableWidget.ReportName}</h2>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sipariş No</TableHead>
            <TableHead>Tarih/Saat</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead>Sipariş Tipi</TableHead>
            <TableHead>Sipariş Durumu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : tableData.length > 0 ? (
            tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.reportValue1}</TableCell>
                <TableCell>{row.reportValue2}</TableCell>
                <TableCell>{row.reportValue3}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.reportValue4.toString())}</TableCell>
                <TableCell>{row.reportValue5}</TableCell>
                <TableCell>{row.reportValue6}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Satırlar yüklenemedi
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        {error}
      </div>
    );
  }

  return renderTable();
}