import { create } from 'zustand'
import type { CargoType, PlanType, SupplementUnit, DispatcherDecision, SupplementPlan, DispatcherResult, HistoryRecord } from '@/utils/types'
import { getDispatcherDecision } from '@/utils/dispatcher'

const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: 'history-mock-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    plateNumber: '京A·88562',
    cargoType: '冷冻肉类',
    initialTemp: 8.5,
    remainingMileage: 156,
    reportPhotos: ['#1a3a5c', '#2a4a6c'],
    planName: '京东冷链干冰站(亦庄)',
    planType: '干冰点',
    checklistCompleted: [true, true, true, true],
    supplementAmount: 25,
    supplementUnit: 'kg',
    retestTemp: -16.2,
    receiptPhotos: ['#1b2b3c', '#1a3a5c'],
    dispatcherResult: {
      decision: '继续运输',
      reasons: ['温度已恢复至安全范围', '补冷量充足', '站点距离适中'],
      temperatureOk: true,
      supplementOk: true,
      siteReliable: true,
      distanceOk: true,
      score: 92,
    },
  },
  {
    id: 'history-mock-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    plateNumber: '京B·33721',
    cargoType: '冷藏蔬果',
    initialTemp: 12.3,
    remainingMileage: 45,
    reportPhotos: ['#2a4a6c'],
    planName: '中冷物流合作冷库(通州)',
    planType: '合作冷库',
    checklistCompleted: [true, true, true, true],
    supplementAmount: 15,
    supplementUnit: 'kg',
    retestTemp: 3.8,
    receiptPhotos: ['#1a3a5c'],
    dispatcherResult: {
      decision: '转入临时冷库',
      reasons: ['初始温度过高', '剩余里程较短', '冷库容量充足'],
      temperatureOk: false,
      supplementOk: true,
      siteReliable: true,
      distanceOk: true,
      score: 65,
    },
  },
  {
    id: 'history-mock-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    plateNumber: '沪C·55019',
    cargoType: '乳制品',
    initialTemp: 15.8,
    remainingMileage: 220,
    reportPhotos: ['#1b2b3c', '#1a3a5c', '#2a4a6c'],
    planName: '顺丰冷运补给中心(大兴)',
    planType: '制冷剂补给点',
    checklistCompleted: [true, true, true, true],
    supplementAmount: 8,
    supplementUnit: '瓶',
    retestTemp: 5.2,
    receiptPhotos: ['#2a4a6c', '#1b2b3c'],
    dispatcherResult: {
      decision: '换车',
      reasons: ['制冷系统可能存在故障', '补冷后温度仍不稳定', '剩余里程较远'],
      temperatureOk: false,
      supplementOk: false,
      siteReliable: true,
      distanceOk: false,
      score: 45,
    },
  },
]

const loadHistoryFromStorage = (): HistoryRecord[] => {
  if (typeof window === 'undefined') return MOCK_HISTORY
  try {
    const stored = localStorage.getItem('cold-chain-history')
    return stored ? JSON.parse(stored) : MOCK_HISTORY
  } catch {
    return MOCK_HISTORY
  }
}

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
  dispatcherResult: DispatcherResult | null
  historyRecords: HistoryRecord[]
  navigationArrived: boolean

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

  setNavigationArrived: (v: boolean) => void
  addToHistory: () => void
  loadHistory: () => void

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
  dispatcherResult: null as DispatcherResult | null,
  historyRecords: [] as HistoryRecord[],
  navigationArrived: false,
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  historyRecords: loadHistoryFromStorage(),

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
  submitReceipt: () => {
    const state = get()
    const result = getDispatcherDecision(
      typeof state.retestTemp === 'number' ? state.retestTemp : 0,
      typeof state.currentTemp === 'number' ? state.currentTemp : 0,
      state.cargoType || '其他',
      typeof state.supplementAmount === 'number' ? state.supplementAmount : 0,
      state.supplementUnit,
      state.selectedPlan?.type || '安全停车区',
      typeof state.remainingMileage === 'number' ? state.remainingMileage : 0
    )
    set({
      dispatcherDecision: result.decision,
      dispatcherResult: result,
    })
    get().addToHistory()
    set({
      receiptSubmitted: true,
    })
  },

  setNavigationArrived: (v) => set({ navigationArrived: v }),
  addToHistory: () => {
    const state = get()
    if (!state.selectedPlan || !state.cargoType) return
    const record: HistoryRecord = {
      id: `history-${Date.now()}`,
      createdAt: new Date(Date.now()).toISOString(),
      plateNumber: state.plateNumber,
      cargoType: state.cargoType,
      initialTemp: typeof state.currentTemp === 'number' ? state.currentTemp : 0,
      remainingMileage: typeof state.remainingMileage === 'number' ? state.remainingMileage : 0,
      reportPhotos: state.reportPhotos,
      planName: state.selectedPlan.name,
      planType: state.selectedPlan.type,
      checklistCompleted: state.checklistCompleted,
      supplementAmount: typeof state.supplementAmount === 'number' ? state.supplementAmount : 0,
      supplementUnit: state.supplementUnit,
      retestTemp: typeof state.retestTemp === 'number' ? state.retestTemp : 0,
      receiptPhotos: state.receiptPhotos,
      dispatcherResult: state.dispatcherResult || {
        decision: '继续运输',
        reasons: [],
        temperatureOk: true,
        supplementOk: true,
        siteReliable: true,
        distanceOk: true,
        score: 0,
      },
    }
    const nextRecords = [record, ...state.historyRecords]
    set({ historyRecords: nextRecords })
    if (typeof window !== 'undefined') {
      localStorage.setItem('cold-chain-history', JSON.stringify(nextRecords))
    }
  },
  loadHistory: () => {
    set({ historyRecords: loadHistoryFromStorage() })
  },

  resetAll: () =>
    set({
      ...initialState,
      historyRecords: get().historyRecords,
    }),
}))
