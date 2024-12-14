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
import { LoadingOverlay } from '@/components/loading-overlay';

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
  const [currentStep, setCurrentStep] = useState(0);
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
    if (isNaN(date.getTime())) return value; // Return original value if invalid date
    
    const isLongDate = typeof value === 'string' && value.includes('T');
    
    if (isLongDate) {
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
      setError(null);
      
      // İlk üç adımı hızlıca geç
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentStep(3);

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
        const firstRow = response.data[0];
        const cols = createColumnDefs(firstRow);
        setColumnDefs(cols);
        setRowData(response.data);
      } else {
        setRowData([]);
        setError(`${selectedFilter.date.from && selectedFilter.date.to ? 
          `${new Date(selectedFilter.date.from).toLocaleDateString('tr-TR')} - ${new Date(selectedFilter.date.to).toLocaleDateString('tr-TR')}` 
          : 'Seçili tarih aralığı'} ve ${selectedFilter.selectedBranches.length ? 
          `${selectedFilter.selectedBranches.length} şube` : 'seçili şubeler'} için veri bulunamadı.`);
      }
    } catch (error: any) {
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

  return (
    <>
      {loading && <LoadingOverlay currentStep={currentStep} />}
      <div
  className={`ag-theme-quartz w-full h-[calc(100vh-12rem)] ${theme === 'dark' && 'ag-theme-quartz-dark'}`}
  style={{
    '--ag-background-color': theme === 'dark' ? '#1a1f2e' : '#ffffff',
    '--ag-odd-row-background-color': theme === 'dark' ? '#242837' : '#ffffff',
    '--ag-even-row-background-color': theme === 'dark' ? '#1a1f2e' : '#ffffff',
    '--ag-header-background-color': theme === 'dark' ? '#242837' : '#ffffff',
    '--ag-row-border-color': theme === 'dark' ? '#2d3344' : '#e6e6e6',
    '--ag-border-color': theme === 'dark' ? '#2d3344' : '#e6e6e6',
    '--ag-header-foreground-color': theme === 'dark' ? '#ffffff' : '#000000',
    '--ag-foreground-color': theme === 'dark' ? '#ffffff' : '#000000',
  } as React.CSSProperties}
>
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
            suppressLoadingOverlay={true}
          />
        )}
      </div>
      <div id="myChart" className="w-full h-[400px]" />
    </>
  );
};

export default ReportTable;