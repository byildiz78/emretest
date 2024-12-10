interface RawTableProps {
    data: Record<string, any>[];
}

export function RawTable({ data }: RawTableProps) {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);

    return (
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                    {columns.map((column, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        {columns.map((column, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {typeof row[column] === 'object' ? JSON.stringify(row[column]) : row[column]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
}
