import { formatDateTimeDMYHI } from '@/lib/utils';
import { useFilterStore } from '@/stores/filters-store';
import { Building2, Calendar, PlayCircle } from 'lucide-react';


export function FilterInfo({ selectedMenu, isLoading, handleAnalyze }: any) {
    const { selectedFilter } = useFilterStore()

    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {formatDateTimeDMYHI(selectedFilter.date.from)} - {formatDateTimeDMYHI(selectedFilter.date.to)}
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full text-xs font-medium">
                            {selectedFilter.selectedBranches.length > 0
                                ? selectedFilter.selectedBranches.length
                                : selectedFilter.branches.length} şube
                        </span>
                    </div>
                    <span className="max-w-[300px] truncate">
                        {selectedFilter.selectedBranches.length > 0
                            ? selectedFilter.selectedBranches.map(branch => branch.BranchName).join(', ')
                            : selectedFilter.branches.map(branch => branch.BranchName).join(', ')}
                    </span>
                </div>

                {selectedMenu && !isLoading && (
                    <>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <button
                            onClick={() => handleAnalyze(selectedMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                            disabled={isLoading}
                        >
                            <PlayCircle className="w-4 h-4" />
                            Analizi Başlat
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
