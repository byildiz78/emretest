import { create } from 'zustand'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Efr_Branches } from '@/types/tables'

interface Filter {
    date: DateRange
    branches: Efr_Branches[]
    selectedBranches: Efr_Branches[]
}

interface FilterStore {
    selectedFilter: Filter
    setFilter: (filter: Filter) => void
    setBranchs: (branchs: Efr_Branches[]) => void
    setToDefaultFilters: () => void
    addBranch: (branch: Efr_Branches) => void
    handleDateRangeChange: (value: string) => void
    handleStartDateSelect: (date: Date | undefined) => void
    handleEndDateSelect: (date: Date | undefined) => void
}

export const useFilterStore = create<FilterStore>((set) => ({
    selectedFilter: {
        date: {
            from: new Date(new Date().setHours(0, 0, 0, 0)),
            to: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        branches: [],
        selectedBranches: []
    },

    setFilter: (filter: Filter) =>
        set(() => ({
            selectedFilter: filter
        })),
    setBranchs: (branchs: Efr_Branches[]) =>
        set((state) => ({
            selectedFilter: {
                ...state.selectedFilter,
                branches: branchs
            }
        })),
    setToDefaultFilters: () =>
        set(() => ({
            selectedFilter: {
                date: {
                    from: new Date(new Date().setHours(0, 0, 0, 0)),
                    to: new Date(new Date().setHours(23, 59, 59, 999))
                },
                branches: [],
                selectedBranches: []
            }
        })),

    addBranch: (branch: Efr_Branches) =>
        set((state) => ({
            selectedFilter: {
                ...state.selectedFilter,
                branches: [...state.selectedFilter.branches, branch]
            }
        })),

    handleStartDateSelect: (date: Date | undefined) =>
        set((state) => {
            if (!date) return state
            const endDate = state.selectedFilter.date.to && date > state.selectedFilter.date.to
                ? date
                : state.selectedFilter.date.to

            return {
                selectedFilter: {
                    ...state.selectedFilter,
                    date: {
                        from: date,
                        to: endDate
                    }
                }
            }
        }),

    handleEndDateSelect: (date: Date | undefined) =>
        set((state) => {
            if (!date) return state

            const startDate = state.selectedFilter.date.from && date < state.selectedFilter.date.from
                ? date
                : state.selectedFilter.date.from

            return {
                selectedFilter: {
                    ...state.selectedFilter,
                    date: {
                        from: startDate,
                        to: date
                    }
                }
            }
        }),

    handleDateRangeChange: (value: string) =>
        set((state) => {
            const today = new Date()
            let newDateRange: DateRange = { 
                from: today, 
                to: today
            }

            switch (value) {
                case 'today':
                    newDateRange = { 
                        from: new Date(new Date().setHours(0, 0, 0, 0)), 
                        to: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                    break
                case 'yesterday':
                    const yesterday = subDays(today, 1)
                    newDateRange = { 
                        from: new Date(yesterday.setHours(0, 0, 0, 0)), 
                        to: new Date(yesterday.setHours(23, 59, 59, 999))
                    }
                    break
                case 'thisWeek':
                    newDateRange = {
                        from: startOfWeek(today, { weekStartsOn: 1 }),
                        to: endOfWeek(today, { weekStartsOn: 1 })
                    }
                    break

                case 'lastWeek':
                    const lastWeek = subWeeks(today, 1)
                    newDateRange = {
                        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
                        to: endOfWeek(lastWeek, { weekStartsOn: 1 })
                    }
                    break
                case 'thisMonth':
                    newDateRange = {
                        from: startOfMonth(today),
                        to: endOfMonth(today)
                    }
                    break
                case 'lastMonth':
                    const lastMonth = subMonths(today, 1)
                    newDateRange = {
                        from: startOfMonth(lastMonth),
                        to: endOfMonth(lastMonth)
                    }
                    break
                case 'thisYear':
                    newDateRange = {
                        from: startOfYear(today),
                        to: endOfYear(today)
                    }
                    break
                case 'lastYear':
                    const lastYear = subYears(today, 1)
                    newDateRange = {
                        from: startOfYear(lastYear),
                        to: endOfYear(lastYear)
                    }
                    break
                case 'lastSevenDays':
                    newDateRange = {
                        from: subDays(today, 7),
                        to: today
                    }
                    break
                default:
                    break
            }

            return {
                selectedFilter: {
                    ...state.selectedFilter,
                    date: newDateRange
                }
            }
        })
}))
