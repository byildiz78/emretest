'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import axios from 'axios';
import { ReportPageProps } from './types';
import { useFilterStore } from '@/stores/filters-store';

interface ColumnDef {
field: string;
headerName: string;
filter: boolean;
sortable: boolean;
}

const ReportTable = ({ report }: ReportPageProps) => {
    const gridRef = useRef<AgGridReact>(null);
    const [columnDefs, setColumnDefs] = useState<ColumnDef[]>([]);
    const [rowData, setRowData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedFilter } = useFilterStore();

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        flex: 1,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
    }), []);

    const autoGroupColumnDef = useMemo(() => ({
        minWidth: 200,
    }), []);

    const sideBar = useMemo(() => ({
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

    const chartThemeOverrides = useMemo(() => ({
        common: {
            title: {
                enabled: true,
                fontSize: 14,
            },
            legend: {
                position: 'bottom',
                spacing: 40,
            },
        },
    }), []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchIds = selectedFilter.selectedBranches.length > 0
                ? selectedFilter.selectedBranches.map(item => item.BranchID)
                : selectedFilter.branches.map(item => item.BranchID);

            const response = await axios.post('/api/reports-table', {
                date1: selectedFilter.date.from,
                date2: selectedFilter.date.to,
                reportId: report.ReportID,
                branches: branchIds
            });

            if (response.data?.length > 0) {
                const cols = Object.keys(response.data[0]).map(key => ({
                    field: key,
                    headerName: key,
                    filter: true,
                    sortable: true
                }));
                setColumnDefs(cols);
                setRowData(response.data);
                setError(null);
            } else {
                setRowData([]);
                setError('Veri bulunamadı');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
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
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="ag-theme-alpine h-[calc(100vh-250px)] w-full">
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
                    />
                )}
            </div>
            <div id="myChart" className="w-full h-[400px]" />
        </div>
    );
};

export default ReportTable;