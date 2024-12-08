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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

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
    <div className="rounded-xl border shadow-sm bg-white dark:bg-gray-950 mx-4 sm:mx-6">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Siparişler
        </h2>
        <div className="text-sm text-muted-foreground">
          Toplam {tableData.length} sipariş
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[90px] sm:w-[100px] lg:w-[150px] xl:w-[180px]">Sipariş No</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] lg:w-[180px] xl:w-[200px]">Tarih/Saat</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] lg:w-[180px] xl:w-[200px]">Personel</TableHead>
              <TableHead className="w-[90px] sm:w-[100px] lg:w-[120px] xl:w-[150px]">Tutar</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] lg:w-[180px] xl:w-[200px]">Sipariş Tipi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow 
                key={row.reportValue1} 
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  <span className="text-primary">#{row.reportValue1}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{row.reportValue2}</TableCell>
                <TableCell className="truncate max-w-[200px]">{row.reportValue3}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatCurrency(row.reportValue4)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getOrderTypeIcon(row.reportValue6)}
                    <span className="font-medium truncate">{row.reportValue6}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tableData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <p className="text-muted-foreground">Veri bulunamadı</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {tableData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            {startIndex + 1} - {Math.min(endIndex, tableData.length)} / {tableData.length} sipariş
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Önceki
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 text-sm rounded-md flex items-center justify-center transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}