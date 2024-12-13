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
  minWidth?: number;
  flex?: number;
  suppressSizeToFit?: boolean;
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
    minWidth: 200,
    flex: 1
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
      accentColor: "#032B44",
      backgroundColor: "#030F1E",
      borderColor: "#020B1A",
      borderRadius: 20,
      browserColorScheme: "dark",
      cellHorizontalPaddingScale: 1,
      chromeBackgroundColor: "#030F1E",
      columnBorder: false,
      fontFamily: "Roboto",
      fontSize: 16,
      foregroundColor: "#BBBEC9",
      headerBackgroundColor: "#020B1A",
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
      rowHoverColor: "#0D2344",
      chipBackgroundColor: "#030F1E",
      menuBackgroundColor: "#030F1E",
      popupBackgroundColor: "#030F1E",
      toolPanelBackgroundColor: "#030F1E",
      selectedRowBackgroundColor: "#0D2344"
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

  const createColumnDefs = (firstRow: any) => {
    const keys = Object.keys(firstRow);
    const baseWidth = Math.max(250, Math.floor(window.innerWidth / (keys.length + 1)));
    
    return keys.map(key => {
      const value = firstRow[key];
      let colDef: ColumnDef = {
        field: key,
        headerName: key,
        filter: true,
        sortable: true,
        minWidth: 200,
        flex: 1
      };

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
      else if (isDate(value)) {
        colDef.valueFormatter = (params: any) => {
          if (params.value === null || params.value === undefined) return '';
          return formatDate(params.value);
        };
      }

      return colDef;
    });
  };

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
        const cols = createColumnDefs(firstRow);
        setColumnDefs(cols);
        setRowData(response.data);
        setError(null);
      } else {
        setRowData([]);
        setError(`${selectedFilter.date.from && selectedFilter.date.to ? 
          `${new Date(selectedFilter.date.from).toLocaleDateString('tr-TR')} - ${new Date(selectedFilter.date.to).toLocaleDateString('tr-TR')}` 
          : 'Seçili tarih aralığı'} ve ${selectedFilter.selectedBranches.length ? 
          `${selectedFilter.selectedBranches.length} şube` : 'seçili şubeler'} için veri bulunamadı.`);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  const onGridReady = (params: any) => {
    if (params.columnApi && columnDefs.length > 0) {
      params.api.sizeColumnsToFit();
    }
  };

  // Window resize event'ini dinleyelim
  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.sizeColumnsToFit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-even {
          background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-hover {
          background-color: ${theme === 'dark' ? '#0D2344' : '#f8f8f8'} !important;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-group {
          font-weight: bold;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-row-total {
          background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          font-weight: bold;
          border-top: 2px solid ${theme === 'dark' ? '#020B1A' : '#e6e6e6'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} {
          --ag-background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          --ag-odd-row-background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          --ag-header-background-color: ${theme === 'dark' ? '#020B1A' : '#ffffff'};
          --ag-row-border-color: ${theme === 'dark' ? '#020B1A' : '#e6e6e6'};
          --ag-border-color: ${theme === 'dark' ? '#020B1A' : '#e6e6e6'};
          --ag-side-bar-background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          --ag-control-panel-background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          --ag-range-selection-background-color: ${theme === 'dark' ? '#0D2344' : '#f8f8f8'};
          --ag-selected-row-background-color: ${theme === 'dark' ? '#0D2344' : '#f8f8f8'};
          --ag-row-hover-color: ${theme === 'dark' ? '#0D2344' : '#f8f8f8'};
          --ag-column-hover-color: ${theme === 'dark' ? '#0D2344' : '#f8f8f8'};
          --ag-input-focus-box-shadow: none;
          --ag-input-focus-border-color: #15BDE8;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-side-bar {
          background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          border-left: 1px solid ${theme === 'dark' ? '#020B1A' : '#e6e6e6'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-tool-panel-wrapper,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-header,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-group,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-group-level-0,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-group-level-1,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-ltr .ag-filter-toolpanel-group-level-1,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-instance-filter,
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-filter-toolpanel-group-title-bar {
          background-color: ${theme === 'dark' ? '#030F1E' : '#ffffff'};
          border-color: ${theme === 'dark' ? '#020B1A' : '#e6e6e6'};
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-header-cell {
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
        .ag-theme-quartz${theme === 'dark' ? '-dark' : ''} .ag-header-cell-text {
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: nowrap !important;
        }
      `}</style>
      <div className={`ag-theme-quartz${theme === 'dark' ? '-dark' : ''} h-[calc(100vh-250px)] w-full`}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50"
            >
              <path d="M17.2 5H2.8a1.8 1.8 0 0 0-1.8 1.8v10.4a1.8 1.8 0 0 0 1.8 1.8h14.4a1.8 1.8 0 0 0 1.8-1.8V6.8A1.8 1.8 0 0 0 17.2 5Z" />
              <path d="M23 7v10" />
              <path d="M12 12H2" />
              <path d="M7 8v8" />
            </svg>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Veri Bulunamadı</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
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
            onGridReady={onGridReady}
          />
        )}
      </div>
      <div id="myChart" className="w-full h-[400px]" />
    </div>
  );
};

export default ReportTable;