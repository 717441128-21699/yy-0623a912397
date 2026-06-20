import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { CHECKLIST_LABELS, SUPPLEMENT_UNITS, type SupplementUnit, SAFE_TEMPERATURES } from '@/utils/types'
import PhotoUpload from '@/components/PhotoUpload'
import {
  Check,
  Car,
  Phone,
  Snowflake,
  Thermometer,
  Truck,
  RefreshCw,
  Warehouse,
  CircleCheckBig,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const STEP_ICONS = [Car, Phone, Snowflake, Thermometer]

const DECISIONS = [
  { value: '继续运输' as const, icon: Truck, bg: 'bg-ok-500', border: 'border-ok-500' },
  { value: '换车' as const, icon: RefreshCw, bg: 'bg-warn-500', border: 'border-warn-500' },
  { value: '转入临时冷库' as const, icon: Warehouse, bg: 'bg-ice-500', border: 'border-ice-500' },
]

export default function Receipt() {
  const navigate = useNavigate()
  const {
    selectedPlan,
    checklistCompleted,
    supplementAmount,
    setSupplementAmount,
    supplementUnit,
    setSupplementUnit,
    retestTemp,
    setRetestTemp,
    receiptPhotos,
    addReceiptPhoto,
    removeReceiptPhoto,
    submitReceipt,
    receiptSubmitted,
    dispatcherDecision,
    dispatcherResult,
    resetAll,
    currentTemp,
    toggleChecklist,
    cargoType,
  } = useAppStore()

  const allCompleted = checklistCompleted.every(Boolean)

  const handleStepClick = (index: number) => {
    if (checklistCompleted[index]) {
      const next = [...checklistCompleted] as [boolean, boolean, boolean, boolean]
      for (let i = index; i < 4; i++) {
        next[i] = false
      }
      useAppStore.setState({ checklistCompleted: next })
    } else {
      toggleChecklist(index)
    }
  }

  const currentStepIndex = checklistCompleted.findIndex((v) => !v)

  const retestTempNum = retestTemp !== '' ? Number(retestTemp) : null
  const currentTempNum = currentTemp !== '' ? Number(currentTemp) : null
  const safeTemp = cargoType ? SAFE_TEMPERATURES[cargoType] : 5
  const tempNormal =
    retestTempNum !== null &&
    retestTempNum <= safeTemp

  const canSubmit =
    allCompleted &&
    supplementAmount !== '' &&
    Number(supplementAmount) > 0 &&
    retestTemp !== '' &&
    receiptPhotos.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    submitReceipt()
  }

  const handleBackHome = () => {
    resetAll()
    navigate('/')
  }

  const isValidDataUrl = (url: string): boolean => {
    return url.startsWith('data:image/')
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-28">
      <div className="px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cool-50 mb-3 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <h1 className="text-2xl font-bold text-cool-50">处置回执</h1>
        {selectedPlan && (
          <p className="text-sm text-ice-400 mt-1">{selectedPlan.name}</p>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className="card-dark">
          <h2 className="text-lg font-semibold text-cool-50 mb-4">任务清单</h2>
          <div>
            {CHECKLIST_LABELS.map((label, i) => {
              const Icon = STEP_ICONS[i]
              const isCompleted = checklistCompleted[i]
              const isCurrent = i === currentStepIndex
              const isFuture = !isCompleted && !isCurrent

              let circleClass = ''
              let lineColor = ''
              if (isCompleted) {
                circleClass = 'bg-ok-500'
                lineColor = 'bg-ok-500'
              } else if (isCurrent) {
                circleClass = 'border-2 border-ice-500 bg-transparent'
                lineColor = 'bg-ice-500/40'
              } else {
                circleClass = 'bg-navy-600'
                lineColor = 'bg-navy-600'
              }

              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleStepClick(i)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isCurrent ? 'text-ice-400' : 'text-navy-700'}`} />
                      )}
                    </button>
                    {i < 3 && <div className={`w-0.5 h-8 ${lineColor}`} />}
                  </div>
                  <button
                    onClick={() => handleStepClick(i)}
                    className={`pt-2.5 text-base min-h-[44px] flex items-center ${
                      isCompleted ? 'text-cool-50' : isCurrent ? 'text-ice-400' : 'text-navy-600'
                    }`}
                  >
                    {label}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {allCompleted && (
        <>
          <div className="px-4 mb-4 animate-fade-in">
            <div className="card-dark">
              <h2 className="text-lg font-semibold text-cool-50 mb-4">补冷数据</h2>
              <div className="mb-5">
                <label className="text-sm text-cool-100 mb-2 block">补冷数量</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={supplementAmount}
                    onChange={(e) => setSupplementAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="input-field flex-1"
                    placeholder="请输入数量"
                    min={0}
                  />
                  <div className="flex rounded-lg overflow-hidden border border-navy-700/60">
                    {SUPPLEMENT_UNITS.map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setSupplementUnit(unit as SupplementUnit)}
                        className={`px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                          supplementUnit === unit
                            ? 'bg-ice-500 text-navy-900'
                            : 'bg-navy-900/60 text-cool-100'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-cool-100 mb-2 block">复测温度</label>
                <div className="relative">
                  <input
                    type="number"
                    value={retestTemp}
                    onChange={(e) => setRetestTemp(e.target.value === '' ? '' : Number(e.target.value))}
                    className="input-field pr-12"
                    placeholder="请输入复测温度"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-100">℃</span>
                </div>
                {retestTempNum !== null && (
                  <p className={`mt-2 text-sm font-medium ${tempNormal ? 'text-ok-400' : 'text-warn-500'}`}>
                    {tempNormal ? `温度已恢复至安全范围（≤${safeTemp}℃）` : `温度仍高于安全阈值（${safeTemp}℃）`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 mb-4 animate-fade-in">
            <div className="card-dark">
              <PhotoUpload
                photos={receiptPhotos}
                onAdd={addReceiptPhoto}
                onRemove={removeReceiptPhoto}
                maxPhotos={3}
                label="现场照片"
                hint="拍摄补冷后车厢/温控屏照片（最多3张）"
                capture={true}
              />
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-sm border-t border-navy-700/50">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-ok"
        >
          提交回执
        </button>
      </div>

      {receiptSubmitted && dispatcherResult && (
        <div className="fixed inset-0 z-50 bg-navy-900/98 flex flex-col items-center justify-center px-6 overflow-y-auto py-8">
          <div className="animate-bounce-in mb-4">
            <CircleCheckBig className="w-20 h-20 text-ok-400" />
          </div>
          <h2 className="text-2xl font-bold text-cool-50 mb-2">回执已提交</h2>
          <p className="text-cool-100 mb-6">调度员智能判断结果</p>

          <div className="w-full max-w-sm space-y-4 mb-6">
            <div className="card-dark">
              <div className="flex items-center justify-between mb-2">
                <span className="text-navy-600 text-sm">综合评分</span>
                <span className={`font-din font-bold text-2xl ${
                  dispatcherResult.score >= 80 ? 'text-ok-400' :
                  dispatcherResult.score >= 60 ? 'text-ice-400' : 'text-warn-400'
                }`}>
                  {dispatcherResult.score}<span className="text-sm text-navy-600 font-normal">/100</span>
                </span>
              </div>
              <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dispatcherResult.decision === '继续运输' ? 'bg-ok-500' :
                    dispatcherResult.decision === '换车' ? 'bg-warn-500' : 'bg-ice-500'
                  }`}
                  style={{ width: `${dispatcherResult.score}%` }}
                />
              </div>
            </div>

            <div className="card-dark">
              <h3 className="text-cool-100 text-sm font-medium mb-3">评估维度</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  {dispatcherResult.temperatureOk ? (
                    <CheckCircle className="w-4 h-4 text-ok-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-warn-400" />
                  )}
                  <span className="text-cool-100 text-sm">温度达标</span>
                </div>
                <div className="flex items-center gap-2">
                  {dispatcherResult.supplementOk ? (
                    <CheckCircle className="w-4 h-4 text-ok-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-warn-400" />
                  )}
                  <span className="text-cool-100 text-sm">补冷充足</span>
                </div>
                <div className="flex items-center gap-2">
                  {dispatcherResult.siteReliable ? (
                    <CheckCircle className="w-4 h-4 text-ok-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-warn-400" />
                  )}
                  <span className="text-cool-100 text-sm">站点可靠</span>
                </div>
                <div className="flex items-center gap-2">
                  {dispatcherResult.distanceOk ? (
                    <CheckCircle className="w-4 h-4 text-ok-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-warn-400" />
                  )}
                  <span className="text-cool-100 text-sm">距离合理</span>
                </div>
              </div>
            </div>

            <div className="card-dark">
              <h3 className="text-cool-100 text-sm font-medium mb-3">判断理由</h3>
              <ul className="space-y-2">
                {dispatcherResult.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-cool-100 text-sm">
                    <span className="text-ice-400 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              {DECISIONS.map((d) => {
                const isActive = dispatcherDecision === d.value
                const Icon = d.icon
                return (
                  <div
                    key={d.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? `${d.border} bg-navy-800/80`
                        : 'border-navy-700/30 bg-navy-800/30 opacity-40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${isActive ? d.bg : 'bg-navy-600'} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-navy-700'}`} />
                    </div>
                    <span className={`text-lg font-semibold ${isActive ? 'text-cool-50' : 'text-navy-600'}`}>
                      {d.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={handleBackHome} className="btn-ice max-w-sm w-full">
            返回首页
          </button>
        </div>
      )}
    </div>
  )
}
