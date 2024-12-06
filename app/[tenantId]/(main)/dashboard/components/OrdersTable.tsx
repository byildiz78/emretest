import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Utensils, User2, Package, ShoppingBag, Store, Phone } from "lucide-react";
import { WebWidget, WebWidgetData } from "@/types/tables";


interface OrdersTableProps {
  selectedBranch: {
    BranchID: number;
    BranchName: string;
  };
  startDate?: Date;
  endDate?: Date;
}

const getOrderTypeIcon = (orderType: string) => {
  switch (orderType) {
    case 'MASA SERVIS':
      return <Utensils className="h-4 w-4 text-blue-500" />;
    case 'İSME ÇEK':
      return <User2 className="h-4 w-4 text-purple-500" />;
    case 'AL GÖTÜR':
      return <ShoppingBag className="h-4 w-4 text-green-500" />;
    case 'TEZGAH':
      return <Store className="h-4 w-4 text-orange-500" />;
    case 'PAKET SERVIS':
      return <Package className="h-4 w-4 text-red-500" />;
    default:
      return <Package className="h-4 w-4 text-gray-500" />;
  }
};

export default function OrdersTable({ selectedBranch, startDate, endDate }: OrdersTableProps) {
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
      if (!selectedBranch || !tableWidget?.ReportID || !startDate || !endDate) {
        setTableData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/widgetreport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date1: startDate.toISOString(),
            date2: endDate.toISOString(),
            reportId: tableWidget.ReportID,
            branches: [selectedBranch.BranchID]
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

    if (selectedBranch && startDate && endDate) {
      fetchTableData();
    }
  }, [selectedBranch, startDate, endDate, tableWidget]);

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

  return (
    <div className="rounded-xl border shadow-sm">
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold">Siparişler</h2>
      </div>
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">Sipariş No</TableHead>
              <TableHead className="w-[200px]">Tarih/Saat</TableHead>
              <TableHead className="w-[200px]">Personel</TableHead>
              <TableHead className="w-[150px]">Tutar</TableHead>
              <TableHead className="w-[200px]">Sipariş Tipi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={row.reportValue1} className="hover:bg-muted/50">
                <TableCell className="font-medium">#{row.reportValue1}</TableCell>
                <TableCell>{row.reportValue2}</TableCell>
                <TableCell>{row.reportValue3}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(row.reportValue4)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getOrderTypeIcon(row.reportValue6)}
                    <span className="font-medium">{row.reportValue6}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tableData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-muted-foreground">Veri bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}