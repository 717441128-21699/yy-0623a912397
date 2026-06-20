import { create } from 'zustand'
import type { CargoType, PlanType, SupplementUnit, DispatcherDecision, SupplementPlan } from '@/utils/types'

interface AppState {
  plateNumber: string
  cargoType: CargoType | ''
  currentTemp: number | ''
  remainingMileage: number | ''
  reportPhotos: string[]
  reportSubmitted: boolean

  selectedPlanType: PlanType | '全部'
  selectedPlan: SupplementPlan | null

  checklistCompleted: [boolean, boolean, boolean, boolean]
  supplementAmount: number | ''
  supplementUnit: SupplementUnit
  retestTemp: number | ''
  receiptPhotos: string[]
  receiptSubmitted: boolean
  dispatcherDecision: DispatcherDecision | null

  setPlateNumber: (v: string) => void
  setCargoType: (v: CargoType) => void
  setCurrentTemp: (v: number | '') => void
  setRemainingMileage: (v: number | '') => void
  addReportPhoto: (v: string) => void
  removeReportPhoto: (i: number) => void
  submitReport: () => void

  setSelectedPlanType: (v: PlanType | '全部') => void
  setSelectedPlan: (v: SupplementPlan) => void

  toggleChecklist: (i: number) => void
  setSupplementAmount: (v: number | '') => void
  setSupplementUnit: (v: SupplementUnit) => void
  setRetestTemp: (v: number | '') => void
  addReceiptPhoto: (v: string) => void
  removeReceiptPhoto: (i: number) => void
  submitReceipt: () => void

  resetAll: () => void
}

const initialState = {
  plateNumber: '',
  cargoType: '' as CargoType | '',
  currentTemp: '' as number | '',
  remainingMileage: '' as number | '',
  reportPhotos: [] as string[],
  reportSubmitted: false,
  selectedPlanType: '全部' as PlanType | '全部',
  selectedPlan: null as SupplementPlan | null,
  checklistCompleted: [false, false, false, false] as [boolean, boolean, boolean, boolean],
  supplementAmount: '' as number | '',
  supplementUnit: 'kg' as SupplementUnit,
  retestTemp: '' as number | '',
  receiptPhotos: [] as string[],
  receiptSubmitted: false,
  dispatcherDecision: null as DispatcherDecision | null,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setPlateNumber: (v) => set({ plateNumber: v }),
  setCargoType: (v) => set({ cargoType: v }),
  setCurrentTemp: (v) => set({ currentTemp: v }),
  setRemainingMileage: (v) => set({ remainingMileage: v }),
  addReportPhoto: (v) =>
    set((s) => ({
      reportPhotos: s.reportPhotos.length < 3 ? [...s.reportPhotos, v] : s.reportPhotos,
    })),
  removeReportPhoto: (i) =>
    set((s) => ({
      reportPhotos: s.reportPhotos.filter((_, idx) => idx !== i),
    })),
  submitReport: () => set({ reportSubmitted: true }),

  setSelectedPlanType: (v) => set({ selectedPlanType: v }),
  setSelectedPlan: (v) => set({ selectedPlan: v }),

  toggleChecklist: (i) =>
    set((s) => {
      const next = [...s.checklistCompleted] as [boolean, boolean, boolean, boolean]
      if (i > 0 && !next[i - 1]) return s
      next[i] = !next[i]
      return { checklistCompleted: next }
    }),
  setSupplementAmount: (v) => set({ supplementAmount: v }),
  setSupplementUnit: (v) => set({ supplementUnit: v }),
  setRetestTemp: (v) => set({ retestTemp: v }),
  addReceiptPhoto: (v) =>
    set((s) => ({
      receiptPhotos: s.receiptPhotos.length < 3 ? [...s.receiptPhotos, v] : s.receiptPhotos,
    })),
  removeReceiptPhoto: (i) =>
    set((s) => ({
      receiptPhotos: s.receiptPhotos.filter((_, idx) => idx !== i),
    })),
  submitReceipt: () =>
    set({
      receiptSubmitted: true,
      dispatcherDecision: '继续运输',
    }),

  resetAll: () => set({ ...initialState }),
}))
