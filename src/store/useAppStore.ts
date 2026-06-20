import { create } from 'zustand'
import type { CargoType, PlanType, SupplementUnit, DispatcherDecision, SupplementPlan, DispatcherResult, HistoryRecord, MidRouteReading, ConfirmStatusEntry, DispatchConfirmStatus, TemperatureTrend } from '@/utils/types'
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
      reasons: ['温度已恢复至安全范围', '补冷量充足', '站点距离适中', '途中温度相对稳定'],
      temperatureOk: true,
      supplementOk: true,
      siteReliable: true,
      distanceOk: true,
      temperatureTrend: '持续下降',
      temperatureTrendWorsening: false,
      score: 92,
      plans: [
        {
          decision: '继续运输',
          riskLevel: '低风险',
          riskScore: 8,
          suggestedAction: '按原计划继续行驶，注意观察温度',
          contactPerson: '无需联系',
          contactPhone: '',
          notes: ['温度在安全范围内', '补冷量充足', '温度趋势稳定', '剩余里程较短'],
        },
        {
          decision: '换车',
          riskLevel: '高风险',
          riskScore: 92,
          suggestedAction: '联系调度中心安排换车，原地等待',
          contactPerson: '调度中心',
          contactPhone: '400-888-1234',
          notes: [],
        },
        {
          decision: '转入临时冷库',
          riskLevel: '中风险',
          riskScore: 60,
          suggestedAction: '联系冷库办理入库，等待进一步指示',
          contactPerson: '附近合作冷库',
          contactPhone: '400-888-1234',
          notes: ['当前站点非合作冷库', '温度已恢复，可考虑继续运输'],
        },
      ],
      needDispatcherConfirm: false,
    },
    midRouteReadings: [
      {
        id: 'reading-mock-1-1',
        temperature: -12.5,
        note: '行驶30分钟后测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'reading-mock-1-2',
        temperature: -14.8,
        note: '行驶1小时后测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
    confirmStatus: [{ status: '已获准执行', updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() }],
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
      reasons: ['温度仍高于安全阈值', '补冷量充足', '补冷站点可靠', '剩余里程较短', '途中温度相对稳定'],
      temperatureOk: false,
      supplementOk: true,
      siteReliable: true,
      distanceOk: true,
      temperatureTrend: '持续下降',
      temperatureTrendWorsening: false,
      score: 65,
      plans: [
        {
          decision: '继续运输',
          riskLevel: '中风险',
          riskScore: 35,
          suggestedAction: '按原计划继续行驶，注意观察温度',
          contactPerson: '无需联系',
          contactPhone: '',
          notes: ['补冷量充足', '剩余里程较短'],
        },
        {
          decision: '换车',
          riskLevel: '中风险',
          riskScore: 65,
          suggestedAction: '联系调度中心安排换车，原地等待',
          contactPerson: '调度中心',
          contactPhone: '400-888-1234',
          notes: ['温度未恢复安全范围'],
        },
        {
          decision: '转入临时冷库',
          riskLevel: '低风险',
          riskScore: 30,
          suggestedAction: '联系冷库办理入库，等待进一步指示',
          contactPerson: '冷库管理员',
          contactPhone: '010-12345678',
          notes: ['附近有合作冷库', '可快速入库保障货物安全'],
        },
      ],
      needDispatcherConfirm: false,
    },
    midRouteReadings: [
      {
        id: 'reading-mock-2-1',
        temperature: 8.2,
        note: '行驶20分钟后测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 - 1000 * 60 * 40).toISOString(),
      },
    ],
    confirmStatus: [{ status: '待确认', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }],
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
      reasons: ['温度仍高于安全阈值', '补冷量可能不足', '补冷站点保障能力一般', '剩余里程较长，建议谨慎驾驶', '途中温度持续升高（最高13.2℃），趋势不乐观'],
      temperatureOk: false,
      supplementOk: false,
      siteReliable: false,
      distanceOk: false,
      temperatureTrend: '先降后升',
      temperatureTrendWorsening: true,
      score: 35,
      plans: [
        {
          decision: '继续运输',
          riskLevel: '高风险',
          riskScore: 65,
          suggestedAction: '谨慎驾驶，每30分钟复测一次',
          contactPerson: '无需联系',
          contactPhone: '',
          notes: [],
        },
        {
          decision: '换车',
          riskLevel: '低风险',
          riskScore: 35,
          suggestedAction: '联系调度中心安排换车，原地等待',
          contactPerson: '调度中心',
          contactPhone: '400-888-1234',
          notes: ['温度未恢复安全范围', '补冷量不足', '温度趋势恶化', '剩余里程较长'],
        },
        {
          decision: '转入临时冷库',
          riskLevel: '中风险',
          riskScore: 60,
          suggestedAction: '联系冷库办理入库，等待进一步指示',
          contactPerson: '附近合作冷库',
          contactPhone: '400-888-1234',
          notes: ['当前站点非合作冷库'],
        },
      ],
      needDispatcherConfirm: true,
    },
    midRouteReadings: [
      {
        id: 'reading-mock-3-1',
        temperature: 12.1,
        note: '行驶15分钟后测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7 - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'reading-mock-3-2',
        temperature: 10.5,
        note: '补冷后30分钟测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7 - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'reading-mock-3-3',
        temperature: 13.2,
        note: '行驶1小时后测温',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
      },
    ],
    confirmStatus: [
      { status: '已联系', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { status: '等待回复', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    ],
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
  midRouteReadings: MidRouteReading[]
  confirmStatus: ConfirmStatusEntry[]

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
  addMidRouteReading: (temp: number, note: string) => void
  updateConfirmStatus: (status: DispatchConfirmStatus) => void

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
  midRouteReadings: [] as MidRouteReading[],
  confirmStatus: [] as ConfirmStatusEntry[],
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
      typeof state.remainingMileage === 'number' ? state.remainingMileage : 0,
      state.midRouteReadings
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
        temperatureTrend: '无变化' as TemperatureTrend,
        temperatureTrendWorsening: false,
        score: 0,
        plans: [],
        needDispatcherConfirm: false,
      },
      midRouteReadings: state.midRouteReadings,
      confirmStatus: state.confirmStatus,
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
  addMidRouteReading: (temp, note) =>
    set((s) => {
      const reading: MidRouteReading = {
        id: `reading-${Date.now()}`,
        temperature: temp,
        note,
        createdAt: new Date().toISOString(),
      }
      return { midRouteReadings: [reading, ...s.midRouteReadings] }
    }),
  updateConfirmStatus: (status) => {
    const state = get()
    const entry: ConfirmStatusEntry = { status, updatedAt: new Date().toISOString() }
    const nextConfirmStatus = [...state.confirmStatus, entry]
    const nextRecords = state.historyRecords.length > 0
      ? state.historyRecords.map((r, i) =>
          i === 0 ? { ...r, confirmStatus: nextConfirmStatus } : r
        )
      : state.historyRecords
    set({ confirmStatus: nextConfirmStatus, historyRecords: nextRecords })
    if (typeof window !== 'undefined') {
      localStorage.setItem('cold-chain-history', JSON.stringify(nextRecords))
    }
  },

  resetAll: () =>
    set({
      ...initialState,
      historyRecords: get().historyRecords,
    }),
}))
