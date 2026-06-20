import type { CargoType, SupplementUnit, PlanType, DispatcherResult, MidRouteReading, PlanRecommendation, RiskLevel, TemperatureTrend, TemperatureSummary, DispatcherDecision } from './types'
import { SAFE_TEMPERATURES, SITE_RELIABILITY_SCORE } from './types'

export function getTemperatureSummary(readings: MidRouteReading[], initialTemp: number): TemperatureSummary {
  if (readings.length === 0) {
    return {
      initialTemp,
      minTemp: initialTemp,
      maxTemp: initialTemp,
      lastTemp: initialTemp,
      trend: '无变化',
      trendWorsening: false,
    }
  }

  const sorted = [...readings].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const temps = sorted.map((r) => r.temperature)
  const lastTemp = temps[temps.length - 1]
  const minTemp = Math.min(initialTemp, ...temps)
  const maxTemp = Math.max(initialTemp, ...temps)
  const trend = detectTemperatureTrend(readings, initialTemp)
  const trendWorsening =
    trend === '持续升高' ||
    trend === '先降后升' ||
    (trend === '波动' && lastTemp > initialTemp)

  return { initialTemp, minTemp, maxTemp, lastTemp, trend, trendWorsening }
}

function detectTemperatureTrend(readings: MidRouteReading[], initialTemp: number): TemperatureTrend {
  if (readings.length === 0) return '无变化'

  const sorted = [...readings].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const temps = sorted.map((r) => r.temperature)
  const allTemps = [initialTemp, ...temps]

  let alwaysUp = true
  let alwaysDown = true
  for (let i = 1; i < allTemps.length; i++) {
    if (allTemps[i] <= allTemps[i - 1]) alwaysUp = false
    if (allTemps[i] >= allTemps[i - 1]) alwaysDown = false
  }

  if (alwaysUp) return '持续升高'
  if (alwaysDown) return '持续下降'

  let wentUpFromInitial = false
  let wentDownFromInitial = false
  let minIdx = 0
  let maxIdx = 0
  let minVal = allTemps[0]
  let maxVal = allTemps[0]

  for (let i = 1; i < allTemps.length; i++) {
    if (allTemps[i] < allTemps[i - 1]) wentDownFromInitial = true
    if (allTemps[i] > allTemps[i - 1]) wentUpFromInitial = true
    if (allTemps[i] < minVal) {
      minVal = allTemps[i]
      minIdx = i
    }
    if (allTemps[i] > maxVal) {
      maxVal = allTemps[i]
      maxIdx = i
    }
  }

  if (wentDownFromInitial && wentUpFromInitial) {
    if (maxIdx > minIdx && maxVal > initialTemp && minVal < initialTemp) {
      return '先降后升'
    }
    if (minIdx > maxIdx && minVal < initialTemp && maxVal > initialTemp) {
      return '先升后降'
    }
    if (maxIdx > minIdx) {
      return '先降后升'
    }
    if (minIdx > maxIdx) {
      return '先升后降'
    }
    return '波动'
  }

  const lastTemp = temps[temps.length - 1]
  const firstReadingTemp = temps[0]

  if (wentUpFromInitial && !wentDownFromInitial) {
    if (lastTemp < firstReadingTemp) return '先升后降'
    return '持续升高'
  }

  if (wentDownFromInitial && !wentUpFromInitial) {
    if (lastTemp > firstReadingTemp) return '先降后升'
    return '持续下降'
  }

  if (lastTemp > initialTemp) return '先降后升'
  if (lastTemp < initialTemp) return '先升后降'

  return '波动'
}

function buildPlanWhyChosen(
  decision: DispatcherDecision,
  temperatureOk: boolean,
  supplementOk: boolean,
  siteReliable: boolean,
  distanceOk: boolean,
  temperatureTrend: TemperatureTrend,
  planType: PlanType,
  score: number
): string[] {
  const reasons: string[] = []

  if (decision === '继续运输') {
    if (temperatureOk) reasons.push('温度已恢复至安全范围')
    if (supplementOk) reasons.push('补冷量充足，可持续保冷')
    if (temperatureTrend === '持续下降' || temperatureTrend === '先升后降') reasons.push('温度趋势向好，持续回落')
    if (distanceOk) reasons.push('剩余里程较短，可在安全时间内到达')
    if (siteReliable) reasons.push('补冷质量有保障')
    if (score >= 80) reasons.push('综合评分高，风险可控')
  } else if (decision === '换车') {
    if (!temperatureOk) reasons.push('温度未恢复至安全范围，货物有变质风险')
    if (!supplementOk) reasons.push('补冷量不足，无法支撑后续路程')
    if (temperatureTrend === '持续升高' || temperatureTrend === '先降后升') reasons.push('温度趋势恶化，继续运输风险高')
    if (!distanceOk) reasons.push('剩余里程较长，当前状态难以支撑')
    if (score < 50) reasons.push('综合评分低，运输风险高')
    if (!siteReliable) reasons.push('当前站点保障能力有限')
  } else {
    if (!temperatureOk && planType === '合作冷库') reasons.push('附近有合作冷库，可快速入库')
    if (!temperatureOk) reasons.push('温度未达标，需立即转入冷库')
    if (planType === '合作冷库') reasons.push('冷库资源可靠，有合作协议')
    if (temperatureTrend === '持续升高') reasons.push('温度持续上升，必须紧急处置')
  }

  if (reasons.length === 0) reasons.push('综合风险评估结果')
  return reasons
}

function buildPlanWhyNotChosen(
  decision: DispatcherDecision,
  temperatureOk: boolean,
  supplementOk: boolean,
  siteReliable: boolean,
  distanceOk: boolean,
  temperatureTrend: TemperatureTrend,
  planType: PlanType,
  score: number
): string[] {
  const reasons: string[] = []

  if (decision === '继续运输') {
    if (!temperatureOk) reasons.push('温度尚未完全恢复至安全值')
    if (!supplementOk) reasons.push('补冷量可能不够支撑全程')
    if (temperatureTrend === '持续升高' || temperatureTrend === '先降后升') reasons.push('温度趋势不稳定，有反弹风险')
    if (!distanceOk) reasons.push('剩余里程较长，途中风险不可控')
  } else if (decision === '换车') {
    if (temperatureOk) reasons.push('温度已恢复，换车成本较高')
    if (supplementOk && temperatureOk) reasons.push('补冷后状态良好，换车非必要')
    if (distanceOk) reasons.push('距离目的地近，可直接送达')
    if (score >= 70) reasons.push('综合评分尚可，运输风险可接受')
  } else {
    if (planType !== '合作冷库') reasons.push('当前位置非合作冷库，转库不便')
    if (temperatureOk) reasons.push('温度已恢复，无需入库')
    if (supplementOk) reasons.push('补冷量充足，可继续运输')
    if (distanceOk) reasons.push('剩余里程短，入库意义不大')
  }

  if (reasons.length === 0) reasons.push('非最优选择')
  return reasons
}

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

  const summary = getTemperatureSummary(midRouteReadings, initialTemp)
  const temperatureTrend = summary.trend
  const temperatureTrendWorsening = summary.trendWorsening

  let score = (temperatureOk ? 40 : 0) + (supplementOk ? 25 : 0) + (siteReliable ? 20 : 0) + (distanceOk ? 15 : 0)

  if (temperatureTrend === '持续升高') {
    score -= 15
  } else if (temperatureTrend === '先降后升') {
    score -= 10
  } else if (temperatureTrend === '波动') {
    score -= 8
  } else if (temperatureTrend === '先升后降') {
    score += 5
  } else if (temperatureTrend === '持续下降') {
    score += 5
  }

  score = Math.max(0, Math.min(100, score))

  const maxTemp = summary.maxTemp
  const minTemp = summary.minTemp

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
    const trendReasonMap: Record<TemperatureTrend, string> = {
      '持续升高': `途中温度持续升高（最高${maxTemp}℃，最低${minTemp}℃），趋势不乐观`,
      '持续下降': `途中温度持续下降（最低${minTemp}℃），趋势向好`,
      '先降后升': `途中温度先降后升（最低${minTemp}℃，最高${maxTemp}℃，目前${summary.lastTemp}℃），需警惕回弹`,
      '先升后降': `途中温度先升后降（最高${maxTemp}℃，最低${minTemp}℃，目前${summary.lastTemp}℃），已出现回落趋势`,
      '波动': `途中温度波动（${minTemp}℃ ~ ${maxTemp}℃），情况不稳定`,
      '无变化': '途中温度相对稳定',
    }
    reasons.push(trendReasonMap[temperatureTrend])
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
  if (temperatureTrend === '持续下降' || temperatureTrend === '先升后降') continueNotes.push('温度趋势向好')
  if (distanceOk) continueNotes.push('剩余里程较短')
  if (temperatureTrend === '持续升高' || temperatureTrend === '先降后升') continueNotes.push('注意：温度趋势不佳')

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

  const buildWhyArgs = (dec: DispatcherDecision) => [
    dec,
    temperatureOk,
    supplementOk,
    siteReliable,
    distanceOk,
    temperatureTrend,
    planType,
    score,
  ] as const

  const plans: PlanRecommendation[] = [
    {
      decision: '继续运输',
      riskLevel: continueRiskLevel,
      riskScore: continueRiskScore,
      suggestedAction: continueSuggestedAction,
      contactPerson: '无需联系',
      contactPhone: '',
      notes: continueNotes,
      whyChosen: buildPlanWhyChosen(...buildWhyArgs('继续运输')),
      whyNotChosen: buildPlanWhyNotChosen(...buildWhyArgs('继续运输')),
    },
    {
      decision: '换车',
      riskLevel: switchRiskLevel,
      riskScore: switchRiskScore,
      suggestedAction: '联系调度中心安排换车，原地等待',
      contactPerson: '调度中心',
      contactPhone: '400-888-1234',
      notes: switchNotes,
      whyChosen: buildPlanWhyChosen(...buildWhyArgs('换车')),
      whyNotChosen: buildPlanWhyNotChosen(...buildWhyArgs('换车')),
    },
    {
      decision: '转入临时冷库',
      riskLevel: coldStorageRiskLevel,
      riskScore: coldStorageRiskScore,
      suggestedAction: '联系冷库办理入库，等待进一步指示',
      contactPerson: coldStorageContactPerson,
      contactPhone: coldStorageContactPhone,
      notes: coldStorageNotes,
      whyChosen: buildPlanWhyChosen(...buildWhyArgs('转入临时冷库')),
      whyNotChosen: buildPlanWhyNotChosen(...buildWhyArgs('转入临时冷库')),
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
    temperatureTrend,
    temperatureTrendWorsening,
    plans,
    needDispatcherConfirm,
  }
}
