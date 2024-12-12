'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { themeQuartz } from '@ag-grid-community/theming';
import 'ag-grid-enterprise';
import axios from 'axios';
import { ReportPageProps } from './types';
import { useFilterStore } from '@/stores/filters-store';
import { useTheme } from '@/providers/theme-provider';
import type { SideBarDef } from 'ag-grid-community';

interface ColumnDef {
  field: string;
  headerName: string;
  filter: boolean;
  sortable: boolean;
  aggFunc?: string;
  valueFormatter?: (params: any) => string;
}

interface BranchItem {
  BranchID: string | number;
}

const ReportTable = ({ report }: ReportPageProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedFilter } = useFilterStore();
  const { theme } = useTheme();

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    aggFunc: 'sum',
    flex: 1  // Sadece bunu ekleyelim
  }), []);


  const autoGroupColumnDef = useMemo(() => ({
    minWidth: 200,
    // Grup başlığını özelleştir
    headerName: 'Grup',
    cellRendererParams: {
      suppressCount: false, // Grup içindeki kayıt sayısını göster
      suppressDoubleClickExpand: true, // Çift tıklama ile genişletmeyi kapat
    },
  }), []);

  const sideBar = useMemo((): SideBarDef => ({
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Sütunlar',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        minWidth: 225,
        maxWidth: 225,
        width: 225
      },
      {
        id: 'filters',
        labelDefault: 'Filtreler',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
        minWidth: 180,
        maxWidth: 225,
        width: 225
      },
    ],
    position: 'right' as const
  }), []);

  const chartThemeOverrides = useMemo(() => ({
    common: {
      title: {
        enabled: true,
        fontSize: 14,
      },
      legend: {
        position: 'bottom' as const,
        spacing: 40,
      },
    },
  }), []);

  const gridTheme = useMemo(() => 
    theme === 'dark' ? {
      accentColor: "#15BDE8",
      backgroundColor: "#0C0C0D",
      borderColor: "#ffffff00",
      borderRadius: 20,
      browserColorScheme: "dark",
      cellHorizontalPaddingScale: 1,
      chromeBackgroundColor: "#0C0C0D",
      columnBorder: false,
      fontFamily: "Roboto",
      fontSize: 16,
      foregroundColor: "#BBBEC9",
      headerBackgroundColor: "#182226",
      headerFontSize: 14,
      headerFontWeight: 500,
      headerTextColor: "#FFFFFF",
      headerVerticalPaddingScale: 0.9,
      iconSize: 20,
      rowBorder: false,
      rowVerticalPaddingScale: 1.2,
      sidePanelBorder: false,
      spacing: 8,
      wrapperBorder: false,
      wrapperBorderRadius: 0,
      rowHoverColor: "#1E2A30",
    } : {
      accentColor: "#15BDE8",
      borderRadius: 20,
      cellHorizontalPaddingScale: 1,
      columnBorder: false,
      fontFamily: "Roboto",
      fontSize: 16,
      headerFontSize: 14,
      headerFontWeight: 500,
      headerVerticalPaddingScale: 0.9,
      iconSize: 20,
      rowBorder: false,
      rowVerticalPaddingScale: 1.2,
      sidePanelBorder: false,
      spacing: 8,
      wrapperBorder: false,
      wrapperBorderRadius: 0,
      rowHoverColor: "#f5f5f5",
    },
  [theme]);

  const getRowClass = (params: any) => {
    if (params.node.rowPinned === 'bottom') return 'ag-row-total';
    return params.node.rowIndex % 2 === 0 ? 'ag-row-even' : 'ag-row-odd';
  };

  const isNumeric = (value: any) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const isDate = (value: any) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const hasTimeComponent = (dateStr: string) => {
    // Check if the date string includes time information
    return dateStr.includes(':') || dateStr.includes('T');
  };

  const formatDate = (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    
    // Determine if it's a date with time
    const isLongDate = hasTimeComponent(value.toString());
    
    if (isLongDate) {
      // Format with date and time
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
    } else {
      // Format date only
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  };

  // Alt toplam satırı için özel stil
  const pinnedBottomRowData = useMemo(() => {
    if (!rowData.length) return [];
    
    const totals: any = { field: 'Genel Toplam' };
    const firstRow = rowData[0];
    
    Object.keys(firstRow).forEach(key => {
      if (isNumeric(firstRow[key])) {
        totals[key] = rowData.reduce((sum, row) => {
          const value = parseFloat(row[key]) || 0;
          return sum + value;
        }, 0);
      }
    });
    
    return [totals];
  }, [rowData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const branchIds = selectedFilter.selectedBranches.length > 0
        ? selectedFilter.selectedBranches.map((item: BranchItem) => item.BranchID)
        : selectedFilter.branches.map((item: BranchItem) => item.BranchID);

      const response = await axios.post('/api/reports-table', {
        date1: selectedFilter.date.from,
        date2: selectedFilter.date.to,
        reportId: report.ReportID,
        branches: branchIds
      });

      if (response.data?.length > 0) {
        // İlk satırı kullanarak kolon tiplerini tespit et
        const firstRow = response.data[0];
        const cols = Object.keys(firstRow).map(key => {
          const value = firstRow[key];
          let colDef: ColumnDef = {
            field: key,
            headerName: key,
            filter: true,
            sortable: true
          };

          // Sayısal alan kontrolü
          if (isNumeric(value)) {
            colDef.aggFunc = 'sum';
            colDef.valueFormatter = (params: any) => {
              if (params.value === null || params.value === undefined) return '';
              return new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(params.value);
            };
          }
          // Tarih alanı kontrolü
          else if (isDate(value)) {
            colDef.valueFormatter = (params: any) => {
              if (params.value === null || params.value === undefined) return '';
              return formatDate(params.value);
            };
          }

          return colDef;
        });
        setColumnDefs(cols);
        setRowData(response.data);
        setError(null);
      } else {
        setRowData([]);
        setError('Veri bulunamadı');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report?.ReportID) {
      fetchData();
    }
  }, [report?.ReportID, selectedFilter.date.from, selectedFilter.date.to, selectedFilter.selectedBranches]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <span className="ml-3">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <style jsx global>{`
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-odd {
          background-color: ${theme === 'dark' ? '#141619' : '#ffffff'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-even {
          background-color: ${theme === 'dark' ? '#0C0C0D' : '#f8f8f8'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-hover {
          background-color: ${theme === 'dark' ? '#1E2A30' : '#f5f5f5'} !important;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-group {
          font-weight: bold;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-total {
          background-color: ${theme === 'dark' ? '#182226' : '#f0f0f0'};
          font-weight: bold;
          border-top: 2px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
        }
      `}</style>
      <div className={`ag-theme-quartz${theme === 'dark' ? '-dark' : ''} h-[calc(100vh-250px)] w-full`}>
        {error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : (
          <AgGridReact
            ref={gridRef}
            enableCharts={true}
            chartThemeOverrides={chartThemeOverrides}
            popupParent={document.body}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            animateRows={true}
            sideBar={sideBar}
            rowGroupPanelShow="always"
            pivotPanelShow="always"
            enableRangeSelection={true}
            enableRangeHandle={true}
            pagination={true}
            paginationPageSize={100}
            getRowClass={getRowClass}
            groupIncludeFooter={true}
            groupDefaultExpanded={1}
            suppressAggFuncInHeader={true}
            groupDisplayType="multipleColumns"
            pinnedBottomRowData={pinnedBottomRowData}
          />
        )}
      </div>
      <div id="myChart" className="w-full h-[400px]" />
    </div>
  );
};

export default ReportTable;
