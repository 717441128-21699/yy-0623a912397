import type { CargoType, SupplementUnit, PlanType, DispatcherResult } from './types'
import { SAFE_TEMPERATURES, SITE_RELIABILITY_SCORE } from './types'

export function getDispatcherDecision(
  retestTemp: number,
  initialTemp: number,
  cargoType: CargoType,
  supplementAmount: number,
  supplementUnit: SupplementUnit,
  planType: PlanType,
  remainingMileage: number
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

  const score = (temperatureOk ? 40 : 0) + (supplementOk ? 25 : 0) + (siteReliable ? 20 : 0) + (distanceOk ? 15 : 0)

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

  let decision: DispatcherResult['decision'] = '换车'

  if (score >= 85) {
    decision = '继续运输'
  } else if (score >= 60 && temperatureOk) {
    decision = '继续运输'
  } else if (score >= 50 && siteReliable && temperatureOk) {
    decision = '继续运输'
  } else if (temperatureOk && supplementOk) {
    decision = '继续运输'
  } else if (temperatureOk && !supplementOk && remainingMileage < 50) {
    decision = '继续运输'
  } else if (!temperatureOk && siteReliable && planType === '合作冷库') {
    decision = '转入临时冷库'
  } else if (!temperatureOk) {
    decision = '换车'
  }

  return {
    decision,
    score,
    reasons,
    temperatureOk,
    supplementOk,
    siteReliable,
    distanceOk,
  }
}
