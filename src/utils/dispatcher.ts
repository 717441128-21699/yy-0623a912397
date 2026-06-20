import type { CargoType, SupplementUnit, PlanType, DispatcherResult, MidRouteReading, PlanRecommendation, RiskLevel, DispatcherDecision } from './types'
import { SAFE_TEMPERATURES, SITE_RELIABILITY_SCORE } from './types'

export function getDispatcherDecision(
  retestTemp: number,
  initialTemp: number,
  cargoType: CargoType,
  supplementAmount: number,
  supplementUnit: SupplementUnit,
  planType: PlanType,
  remainingMileage: number,
  midRouteReadings: MidRouteReading[] = []
): DispatcherResult {
  const safeTemp = SAFE_TEMPERATURES[cargoType]
  const temperatureOk = retestTemp <= safeTemp

  let supplementKg: number
  if (supplementUnit === 'kg') {
    supplementKg = supplementAmount
  } else if (supplementUnit === '瓶') {
    supplementKg = supplementAmount * 2
  } else {
    supplementKg = supplementAmount * 5
  }

  const expectedSupplementKg = Math.max(0, (initialTemp - safeTemp) * 15)
  const supplementOk = supplementKg >= expectedSupplementKg * 0.8

  const siteScore = SITE_RELIABILITY_SCORE[planType]
  const siteReliable = siteScore >= 60

  const distanceOk = remainingMileage < 100

  let temperatureTrendWorsening = false
  let maxTemp = initialTemp
  if (midRouteReadings.length > 0) {
    const latestReading = midRouteReadings[midRouteReadings.length - 1]
    maxTemp = Math.max(...midRouteReadings.map(r => r.temperature))
    temperatureTrendWorsening = latestReading.temperature > initialTemp
  }

  let score = (temperatureOk ? 40 : 0) + (supplementOk ? 25 : 0) + (siteReliable ? 20 : 0) + (distanceOk ? 15 : 0)
  if (temperatureTrendWorsening) {
    score -= 10
  }

  const reasons: string[] = []

  if (temperatureOk) {
    reasons.push(`温度已恢复至安全范围（${retestTemp}℃）`)
  } else {
    reasons.push(`温度仍高于安全阈值（${safeTemp}℃）`)
  }

  if (supplementOk) {
    reasons.push(`补冷量充足（${supplementKg}kg）`)
  } else {
    reasons.push(`补冷量可能不足（建议${Math.ceil(expectedSupplementKg)}kg）`)
  }

  if (siteReliable) {
    reasons.push(`补冷站点可靠（${planType}）`)
  } else {
    reasons.push('补冷站点保障能力一般')
  }

  if (distanceOk) {
    reasons.push(`剩余里程较短（${remainingMileage}km）`)
  } else {
    reasons.push('剩余里程较长，建议谨慎驾驶')
  }

  if (midRouteReadings.length > 0) {
    if (temperatureTrendWorsening) {
      reasons.push(`途中温度持续升高（最高${maxTemp}℃），趋势不乐观`)
    } else {
      reasons.push('途中温度相对稳定')
    }
  }

  const continueRiskScore = 100 - score
  let continueRiskLevel: RiskLevel
  let continueSuggestedAction: string
  if (score >= 80) {
    continueRiskLevel = '低风险'
    continueSuggestedAction = '按原计划继续行驶，注意观察温度'
  } else if (score >= 60) {
    continueRiskLevel = '中风险'
    continueSuggestedAction = '按原计划继续行驶，注意观察温度'
  } else {
    continueRiskLevel = '高风险'
    continueSuggestedAction = '谨慎驾驶，每30分钟复测一次'
  }
  const continueNotes: string[] = []
  if (temperatureOk) continueNotes.push('温度在安全范围内')
  if (supplementOk) continueNotes.push('补冷量充足')
  if (midRouteReadings.length > 0 && !temperatureTrendWorsening) continueNotes.push('温度趋势稳定')
  if (distanceOk) continueNotes.push('剩余里程较短')

  const switchRiskScore = score
  let switchRiskLevel: RiskLevel
  if (score < 50) {
    switchRiskLevel = '低风险'
  } else if (score <= 70) {
    switchRiskLevel = '中风险'
  } else {
    switchRiskLevel = '高风险'
  }
  const switchNotes: string[] = []
  if (!temperatureOk) switchNotes.push('温度未恢复安全范围')
  if (!supplementOk) switchNotes.push('补冷量不足')
  if (temperatureTrendWorsening) switchNotes.push('温度趋势恶化')
  if (!distanceOk) switchNotes.push('剩余里程较长')

  let coldStorageRiskScore: number
  let coldStorageRiskLevel: RiskLevel
  let coldStorageContactPerson: string
  let coldStorageContactPhone: string
  const coldStorageNotes: string[] = []
  if (planType === '合作冷库' && !temperatureOk) {
    coldStorageRiskScore = 30
    coldStorageRiskLevel = '低风险'
    coldStorageContactPerson = '冷库管理员'
    coldStorageContactPhone = '010-12345678'
    coldStorageNotes.push('附近有合作冷库')
    coldStorageNotes.push('可快速入库保障货物安全')
  } else {
    coldStorageRiskScore = 60
    coldStorageRiskLevel = '中风险'
    coldStorageContactPerson = '附近合作冷库'
    coldStorageContactPhone = '400-888-1234'
    if (planType !== '合作冷库') {
      coldStorageNotes.push('当前站点非合作冷库')
    }
    if (temperatureOk) {
      coldStorageNotes.push('温度已恢复，可考虑继续运输')
    }
  }

  const plans: PlanRecommendation[] = [
    {
      decision: '继续运输',
      riskLevel: continueRiskLevel,
      riskScore: continueRiskScore,
      suggestedAction: continueSuggestedAction,
      contactPerson: '无需联系',
      contactPhone: '',
      notes: continueNotes,
    },
    {
      decision: '换车',
      riskLevel: switchRiskLevel,
      riskScore: switchRiskScore,
      suggestedAction: '联系调度中心安排换车，原地等待',
      contactPerson: '调度中心',
      contactPhone: '400-888-1234',
      notes: switchNotes,
    },
    {
      decision: '转入临时冷库',
      riskLevel: coldStorageRiskLevel,
      riskScore: coldStorageRiskScore,
      suggestedAction: '联系冷库办理入库，等待进一步指示',
      contactPerson: coldStorageContactPerson,
      contactPhone: coldStorageContactPhone,
      notes: coldStorageNotes,
    },
  ]

  let needDispatcherConfirm = false
  if (continueRiskLevel === '高风险') {
    needDispatcherConfirm = true
  } else if (continueRiskLevel === '中风险' && remainingMileage > 200) {
    needDispatcherConfirm = true
  }

  const sortedPlans = [...plans].sort((a, b) => a.riskScore - b.riskScore)
  const decision = sortedPlans[0].decision

  return {
    decision,
    score,
    reasons,
    temperatureOk,
    supplementOk,
    siteReliable,
    distanceOk,
    temperatureTrendWorsening,
    plans,
    needDispatcherConfirm,
  }
}
