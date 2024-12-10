"use client";

import React from "react";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import PulseLoader from "react-spinners/PulseLoader";
import BranchCard from "./BranchCard";
import { WebWidgetData } from "@/types/tables";

// Transform BranchModel to BranchData
const transformBranchData = (data: WebWidgetData) => {
    const currentValue = data.reportValue2 || 0;
    const previousValue = data.reportValue3 || 0;
    const difference = currentValue - previousValue;
    const percentageChange = previousValue !== 0 ? data.reportValue9 : null;

    return {
        id: (data.BranchID || '').toString(),
        name: data.reportValue1 || '',
        currentValue: currentValue.toString(),
        previousValue: previousValue.toString(),
        difference: difference.toString(),
        totalDaily: (data.reportValue4 || 0).toString(),
        dailyCustomers: (data.reportValue5 || 0).toString(),
        peopleCount: (data.reportValue5 || 0).toString(),
        percentageChange: percentageChange?.toString() ?? null
    };
};

export default function BranchList() {
    const { branchDatas } = useWidgetDataStore();

    if (!branchDatas || branchDatas.length === 0) {
        return (
            <div className="col-span-full flex items-center justify-center py-8">
                <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />

            </div>
        );
    }

    // En yüksek ciro değerini bul
    const maxValue = Math.max(...branchDatas.map(data => data?.reportValue2 || 0));

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {branchDatas.map((branchData, index) => {
                    if (!branchData) return null;
                    const transformedData = transformBranchData(branchData);
                    return (
                        <BranchCard key={branchData.BranchID} data={transformedData} index={index} maxValue={maxValue} />
                    );
                })}
            </div>
        </div>
    );
}
