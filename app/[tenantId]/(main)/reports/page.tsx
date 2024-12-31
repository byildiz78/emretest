"use client"
import ReportTableBigQuery from "./report-table-bigquery"
import { ReportPageProps } from "./types"

export const ReportPage = ({report, reportGroup}: ReportPageProps) => {
    return (
        <div>
            <ReportTableBigQuery report={report} reportGroup={reportGroup}/>
        </div>
    )
}