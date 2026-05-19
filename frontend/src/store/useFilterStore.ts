import { create } from 'zustand'

export interface FilterState {
  district: string
  panchayat: string
  department: string
  severity: string
  status: string
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'resetFilters'>, value: string) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  district: 'All',
  panchayat: 'All',
  department: 'All',
  severity: 'All',
  status: 'All',
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  resetFilters: () => set({
    district: 'All',
    panchayat: 'All',
    department: 'All',
    severity: 'All',
    status: 'All',
  }),
}))
