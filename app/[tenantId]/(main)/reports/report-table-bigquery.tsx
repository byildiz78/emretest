'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';
import axios from 'axios';
import { ReportPageProps } from './types';
import { useFilterStore } from '../../../../stores/filters-store';
import { useTheme } from '../../../../providers/theme-provider';
import type { SideBarDef } from 'ag-grid-community';
import { LoadingOverlay } from '../../../../components/loading-overlay';
import { useTabStore } from '../../../../stores/tab-store';
import { Card, CardContent } from '../../../../components/ui/card';
import { Calendar, Users } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { useParams } from 'next/navigation';
import { useSocket } from '../../../../hooks/use-socket';


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

/**
 * ReportTableBigQuery Component
 * 
 * Renders a data grid with server-side pagination that efficiently handles large datasets.
 * Supports filtering, sorting, and dynamic column configuration.
 */
const ReportTableBigQuery = ({ report, reportGroup }: ReportPageProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const params = useParams() || {};
  const tenantId = (params as any).tenantId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { selectedFilter } = useFilterStore();
  const { theme } = useTheme();
  const { activeTab } = useTabStore();
  const [currentFilter, setCurrentFilter] = useState(useTabStore.getState().getTabFilter(activeTab));
  const requestSentRef = useRef<boolean>(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { socket, isConnected } = useSocket();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

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
    headerName: 'Grup',
    cellRendererParams: {
      suppressCount: false,
      suppressDoubleClickExpand: true,
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
    position: 'right'
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
    return dateStr.includes(':') || dateStr.includes('T');
  };

  const formatDate = (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
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

  /**
   * Creates column definitions based on the first row of data.
   * Automatically detects data types and applies appropriate formatting.
   */
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

  /**
   * Fetches initial data and sets up the grid.
   * Handles error states and loading indicators.
   */
  const fetchData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (isRequestPending || (requestSentRef.current && rowData.length > 0)) {
      return;
    }

    const latestFilter = useTabStore.getState().getTabFilter(activeTab);
    
    if (activeTab !== report.ReportName) {
      return;
    }

    try {
      setIsRequestPending(true);
      setLoading(true);
      setError(null);
      setCurrentStep(1);

      const branchIds = latestFilter?.selectedBranches?.length > 0
        ? latestFilter.selectedBranches.map((item: BranchItem) => item.BranchID)
        : latestFilter?.branches?.map((item: BranchItem) => item.BranchID) || [];

      setCurrentStep(2);

      requestSentRef.current = true;
      await axios.post('/api/reports-table-bigquery', {
        date1: latestFilter?.date?.from,
        date2: latestFilter?.date?.to,
        reportId: report.ReportID,
        branches: branchIds
      }, { signal: abortControllerRef.current.signal });

      setCurrentStep(3);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      const dateRange = latestFilter?.date?.from && latestFilter?.date?.to 
        ? `${new Date(latestFilter.date.from).toLocaleDateString('tr-TR')} - ${new Date(latestFilter.date.to).toLocaleDateString('tr-TR')}`
        : 'Seçili tarih aralığı';
      const branchCount = latestFilter?.selectedBranches?.length === 0 ? latestFilter.branches?.length : (latestFilter?.selectedBranches?.length || 0);
      setError(`${dateRange} tarihleri arasında seçmiş olduğunuz ${branchCount} şubede veri bulunamadı.`);
      setRowData([]);
    } finally {
      setIsRequestPending(false);
      setLoading(false);
      requestSentRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Handles fetching data for a specific page when pagination changes.
   * Manages the grid's pagination state and data loading.
   * 
   * @param message - The message containing the job ID
   */
  const handleUserNotification = async (message: any) => {
    const latestFilter = useTabStore.getState().getTabFilter(activeTab);
    setCurrentJobId(message.jobId);
    setLoading(true);

    try {
      const response = await axios.get(`/api/bigquery-result?jobId=${message.jobId}`);
      
      if (response.status === 200) {
        const { data } = response.data;
        
        if (data?.length > 0) {
          const cols = createColumnDefs(data[0]);
          setColumnDefs(cols);
          setRowData(data);
          setTotalRows(data.length);
          setError(null);
        } else {
          setRowData([]);
          setTotalRows(0);
          setError(`${currentFilter?.date?.from && currentFilter?.date?.to ? 
            `${new Date(currentFilter.date.from).toLocaleDateString('tr-TR')} - ${new Date(currentFilter.date.to).toLocaleDateString('tr-TR')}` 
            : 'Seçili tarih aralığı'} ve ${currentFilter?.selectedBranches?.length ? 
            `${currentFilter.selectedBranches.length} şube` : 'seçili şubeler'} için veri bulunamadı.`);
        }
      }
    } catch (error) {
      console.error('Error fetching BigQuery results:', error);
      const dateRange = latestFilter?.date?.from && latestFilter?.date?.to 
        ? `${new Date(latestFilter.date.from).toLocaleDateString('tr-TR')} - ${new Date(latestFilter.date.to).toLocaleDateString('tr-TR')}`
        : 'Seçili tarih aralığı';
      const branchCount = latestFilter?.selectedBranches?.length === 0 ? latestFilter.branches?.length : (latestFilter?.selectedBranches?.length || 0);
      setError(`${dateRange} tarihleri arasında seçmiş olduğunuz ${branchCount} şubede veri bulunamadı.`);
    } finally {
      setLoading(false);
      requestSentRef.current = false;
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleBigQueryComplete = (data: any) => {
      if (data.reportId === report.ReportID.toString() || data.tabId === report.ReportID.toString()) {
        handleUserNotification(data);
      }
    };

    socket.on('bigquery-job-complete', handleBigQueryComplete);

    return () => {
      socket.off('bigquery-job-complete', handleBigQueryComplete);
    };
  }, [socket, isConnected, report.ReportID]);

  useEffect(() => {
    const newFilter = useTabStore.getState().getTabFilter(activeTab);
    if (activeTab === report.ReportName && newFilter) {
      setCurrentFilter(newFilter);
    }
  }, [activeTab, selectedFilter]);

  useEffect(() => {
    if (currentFilter && activeTab === report.ReportName && !isRequestPending) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedFilter.appliedAt]);

  return (
    <>
      {(loading || rowData.length === 0) && !error && (
        <LoadingOverlay 
          currentStep={currentStep} 
          message={currentStep === 3 ? "İsteğiniz işleme alınmıştır. Sonuçlar hazır olduğunda gösterilecektir." : undefined}
        />
      )}
      {loading && rowData.length > 0 && (
        <LoadingOverlay 
          currentStep={currentStep} 
          message={currentStep === 3 ? "İsteğiniz işleme alınmıştır. Sonuçlar hazır olduğunda gösterilecektir." : undefined}
        />
      )}
      {!loading && error ? (
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
            <path d="M12 3.13a4 4 0 0 1 0 7.75" />
            <path d="M7 8v8" />
          </svg>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Veri Bulunamadı</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : (!loading && rowData.length > 0) && (
        <div
          ref={gridContainerRef}
          className={`ag-theme-quartz w-full h-[calc(100vh-12rem)] ${theme === 'dark' && 'ag-theme-quartz-dark'} flex flex-col rounded-xl border bg-card shadow-md overflow-hidden`}
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
          <Card className="rounded-none border-0 border-b shadow-none bg-card/40 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Seçili Tarih Aralığı</span>
                  <span className="text-sm text-muted-foreground">
                    {useTabStore.getState().getTabFilter(useTabStore.getState().activeTab)?.date?.from
                      ? new Date(useTabStore.getState().getTabFilter(useTabStore.getState().activeTab).date.from).toLocaleDateString('tr-TR')
                      : '-'} - {useTabStore.getState().getTabFilter(useTabStore.getState().activeTab)?.date?.to
                        ? new Date(useTabStore.getState().getTabFilter(useTabStore.getState().activeTab).date.to).toLocaleDateString('tr-TR')
                        : '-'}</span>
                </div>
              </div>
              <Badge variant="secondary" className="h-8 px-3 text-sm gap-2">
                <Users className="h-4 w-4" />
                {rowData.length.toLocaleString('tr-TR')} Kayıt
              </Badge>
            </CardContent>
          </Card>
          <div className="flex-1 p-2">
            <AgGridReact
              ref={gridRef}
              popupParent={gridContainerRef.current}
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
              paginationPageSize={1000}
              getRowClass={getRowClass}
              groupIncludeFooter={true}
              groupDefaultExpanded={1}
              suppressAggFuncInHeader={true}
              groupDisplayType="multipleColumns"
              pinnedBottomRowData={pinnedBottomRowData}
              onGridReady={() => {
                if (gridRef.current && gridRef.current.api) {
                  gridRef.current.api.sizeColumnsToFit();
                }
              }}
              suppressLoadingOverlay={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReportTableBigQuery;
