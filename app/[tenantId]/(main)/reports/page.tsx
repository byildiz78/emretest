import ReportTable from "./report-table"
import { ReportPageProps } from "./types"


export const ReportPage = ({report, reportGroup}: ReportPageProps) => {
    return (
        <div>
            <ReportTable report={report} reportGroup={reportGroup} />
        </div>
    )
}