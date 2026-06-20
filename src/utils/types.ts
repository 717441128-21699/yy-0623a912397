export type CargoType = '冷冻肉类' | '冷藏蔬果' | '乳制品' | '医药制品' | '速冻食品' | '其他'

export type PlanType = '干冰点' | '制冷剂补给点' | '合作冷库' | '安全停车区'

export type SupplementUnit = 'kg' | '瓶' | '罐'

export type DispatcherDecision = '继续运输' | '换车' | '转入临时冷库'

export interface DispatcherResult {
  decision: DispatcherDecision
  reasons: string[]
  temperatureOk: boolean
  supplementOk: boolean
  siteReliable: boolean
  distanceOk: boolean
  score: number
}

export interface HistoryRecord {
  id: string
  createdAt: string
  plateNumber: string
  cargoType: CargoType
  initialTemp: number
  remainingMileage: number
  reportPhotos: string[]
  planName: string
  planType: PlanType
  checklistCompleted: [boolean, boolean, boolean, boolean]
  supplementAmount: number
  supplementUnit: SupplementUnit
  retestTemp: number
  receiptPhotos: string[]
  dispatcherResult: DispatcherResult
}

export interface Vehicle {
  plateNumber: string
  cargoType: CargoType
}

export interface TemperatureAlert {
  id: string
  plateNumber: string
  cargoType: CargoType
  currentTemp: number
  remainingMileage: number
  photos: string[]
  createdAt: string
}

export interface SupplementPlan {
  id: string
  name: string
  type: PlanType
  address: string
  distance: number
  detourMinutes: number
  isOpen: boolean
  capacity: string
  contactPhone: string
  contactName: string
  businessHours: string
}

export interface Receipt {
  alertId: string
  planId: string
  checklistCompleted: [boolean, boolean, boolean, boolean]
  supplementAmount: number
  supplementUnit: SupplementUnit
  retestTemp: number
  photos: string[]
  submittedAt: string
  dispatcherDecision: DispatcherDecision | null
}

export const CHECKLIST_LABELS = ['停车检查', '联系站点', '补冷完成', '复测温度'] as const

export const CARGO_TYPES: CargoType[] = ['冷冻肉类', '冷藏蔬果', '乳制品', '医药制品', '速冻食品', '其他']

export const PLAN_TYPES: PlanType[] = ['干冰点', '制冷剂补给点', '合作冷库', '安全停车区']

export const SUPPLEMENT_UNITS: SupplementUnit[] = ['kg', '瓶', '罐']

export const SAFE_TEMPERATURES: Record<CargoType, number> = {
  '冷冻肉类': -18,
  '冷藏蔬果': 4,
  '乳制品': 6,
  '医药制品': 8,
  '速冻食品': -18,
  '其他': 10,
}

export const SITE_RELIABILITY_SCORE: Record<PlanType, number> = {
  '干冰点': 75,
  '制冷剂补给点': 65,
  '合作冷库': 90,
  '安全停车区': 40,
}
