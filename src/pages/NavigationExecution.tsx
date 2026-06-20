import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { CHECKLIST_LABELS, type PlanType } from '@/utils/types'
import {
  ArrowLeft,
  Phone,
  MapPin,
  Navigation,
  Clock,
  Car,
  Snowflake,
  Thermometer,
  CheckCircle,
  AlertCircle,
  Check,
  FlaskConical,
  Warehouse,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

const STEP_ICONS = [Car, Phone, Snowflake, Thermometer]

const TYPE_ICONS: Record<PlanType, React.ElementType> = {
  干冰点: Snowflake,
  制冷剂补给点: FlaskConical,
  合作冷库: Warehouse,
  安全停车区: ShieldCheck,
}

export default function NavigationExecution() {
  const navigate = useNavigate()
  const {
    selectedPlan,
    checklistCompleted,
    toggleChecklist,
    midRouteReadings,
    addMidRouteReading,
    currentTemp,
  } = useAppStore()

  const [remainingDistance, setRemainingDistance] = useState(
    selectedPlan?.distance ?? 0
  )
  const [arrived, setArrived] = useState(false)
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [showMidRouteModal, setShowMidRouteModal] = useState(false)
  const [tempInput, setTempInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  const etaMinutes = Math.ceil(remainingDistance / 0.06)

  const expectedArrival = useMemo(() => {
    const date = new Date(Date.now() + etaMinutes * 60000)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }, [etaMinutes])

  const progress = selectedPlan
    ? Math.max(0, Math.min(1, 1 - remainingDistance / selectedPlan.distance))
    : 0

  useEffect(() => {
    if (!selectedPlan || arrived) return

    const interval = setInterval(() => {
      setRemainingDistance((prev) => {
        const next = Math.max(0, prev - 0.1)
        if (next <= 0.05) {
          setArrived(true)
          setShowArrivalModal(true)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedPlan, arrived])

  const handleStepClick = (index: number) => {
    if (index > 0 && !arrived) return

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

  const handleSafePark = () => {
    if (!checklistCompleted[0]) {
      toggleChecklist(0)
    }
  }

  const formatDistance = (d: number) => {
    return d.toFixed(1)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const handleSaveReading = () => {
    const temp = parseFloat(tempInput)
    if (isNaN(temp)) return
    addMidRouteReading(temp, noteInput)
    setShowMidRouteModal(false)
    setTempInput('')
    setNoteInput('')
  }

  const initialTemp = typeof currentTemp === 'number' ? currentTemp : 0

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <p className="text-cool-100">未选择导航方案</p>
      </div>
    )
  }

  const SiteIcon = TYPE_ICONS[selectedPlan.type]

  return (
    <div className="min-h-screen bg-navy-900 pb-28">
      <div className="sticky top-0 z-30 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/navigate')}
            className="w-11 h-11 rounded-full bg-navy-800 flex items-center justify-center min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 text-cool-50" />
          </button>
          <div className="flex-1 px-4 text-center">
            <p className="text-sm text-cool-100">正在导航前往</p>
            <h1 className="text-lg font-bold text-cool-50 truncate">
              {selectedPlan.name}
            </h1>
          </div>
          <a
            href={`tel:${selectedPlan.contactPhone}`}
            className="w-11 h-11 rounded-full bg-ice-500 flex items-center justify-center min-h-[44px]"
          >
            <Phone className="w-5 h-5 text-navy-900" />
          </a>
        </div>
      </div>

      <div className="px-4 pt-4 mb-4">
        <div className="card-dark p-0 overflow-hidden relative">
          <div className="h-64 bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 400 256">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B3A5C" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256">
              <path
                d="M 60 230 Q 100 180, 150 170 T 250 120 T 320 60"
                fill="none"
                stroke="#1B3A5C"
                strokeWidth="6"
                strokeLinecap="round"
              />

              <path
                d="M 60 230 Q 100 180, 150 170 T 250 120 T 320 60"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="8 6"
                strokeDashoffset={50 - progress * 150}
                className="animate-pulse-slow"
              />

              <g
                style={{
                  transform: `translate(${60 + (320 - 60) * progress}px, ${230 - (230 - 60) * progress}px)`,
                }}
              >
                <circle cx="0" cy="0" r="12" fill="#00B4D8" opacity="0.3" className="animate-pulse-slow" />
                <circle cx="0" cy="0" r="8" fill="#00B4D8" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              </g>

              <g transform="translate(320, 60)">
                <MapPin className="w-8 h-8 text-warn-500 -translate-x-1/2 -translate-y-full" fill="#FF6B35" />
              </g>
            </svg>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-navy-900/80 backdrop-blur px-3 py-1.5 rounded-full">
              <Navigation className="w-4 h-4 text-ice-400" />
              <span className="text-sm text-ice-400 font-medium">导航中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="card-dark">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm text-cool-100 mb-1">剩余距离</p>
              <p className="text-4xl font-din font-bold text-ice-400">
                {formatDistance(remainingDistance)}
                <span className="text-xl text-cool-100 ml-1">km</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-cool-100 mb-1">预计到达</p>
              <p className="text-2xl font-din font-bold text-cool-50">{expectedArrival}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-navy-700/50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center">
                <Clock className="w-4 h-4 text-ice-400" />
              </div>
              <div>
                <p className="text-xs text-cool-100">预计用时</p>
                <p className="text-lg font-din font-bold text-cool-50">{etaMinutes}<span className="text-sm ml-0.5">分钟</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-warn-400" />
              </div>
              <div>
                <p className="text-xs text-cool-100">绕行时间</p>
                <p className="text-lg font-din font-bold text-warn-400">+{selectedPlan.detourMinutes}<span className="text-sm ml-0.5">分钟</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="card-dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
              <SiteIcon className="w-6 h-6 text-ice-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-ice-500/20 text-ice-400">
                  {selectedPlan.type}
                </span>
              </div>
              <p className="text-base font-semibold text-cool-50 mt-1">
                {selectedPlan.contactName}
              </p>
              <p className="text-sm text-cool-100">{selectedPlan.contactPhone}</p>
            </div>
          </div>
          <a
            href={`tel:${selectedPlan.contactPhone}`}
            className="w-full py-3.5 rounded-xl bg-ice-500 text-navy-900 font-bold text-base flex items-center justify-center gap-2 min-h-[44px] active:bg-ice-400 transition-colors"
          >
            <Phone className="w-5 h-5" />
            一键拨号
          </a>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-ice-400" />
              </div>
              <h2 className="text-lg font-semibold text-cool-50">途中温度记录</h2>
            </div>
            <button
              onClick={() => setShowMidRouteModal(true)}
              className="px-4 py-2 rounded-lg bg-ice-500/20 text-ice-400 text-sm font-medium flex items-center gap-1.5 min-h-[44px] active:bg-ice-500/30 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              记录温度
            </button>
          </div>

          {midRouteReadings.length === 0 ? (
            <div className="py-8 text-center">
              <Thermometer className="w-10 h-10 text-navy-600 mx-auto mb-3" />
              <p className="text-sm text-navy-600">暂无途中记录，温度异常时可随时记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {midRouteReadings.map((reading) => {
                const isHigher = reading.temperature > initialTemp
                const isLower = reading.temperature < initialTemp
                return (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-navy-900/40 border border-navy-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isHigher ? 'bg-warn-500/20' : isLower ? 'bg-ok-500/20' : 'bg-navy-700'
                      }`}>
                        {isHigher ? (
                          <TrendingUp className="w-4 h-4 text-warn-400" />
                        ) : isLower ? (
                          <TrendingDown className="w-4 h-4 text-ok-400" />
                        ) : (
                          <Thermometer className="w-4 h-4 text-cool-100" />
                        )}
                      </div>
                      <div>
                        <p className={`font-din font-bold text-lg ${
                          isHigher ? 'text-warn-400' : isLower ? 'text-ok-400' : 'text-cool-50'
                        }`}>
                          {reading.temperature.toFixed(1)}<span className="text-sm ml-0.5 font-normal">℃</span>
                        </p>
                        {reading.note && (
                          <p className="text-xs text-cool-100 mt-0.5">{reading.note}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-navy-500 font-din">{formatTime(reading.createdAt)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="card-dark">
          <h2 className="text-lg font-semibold text-cool-50 mb-4">任务清单</h2>
          <div>
            {CHECKLIST_LABELS.map((label, i) => {
              const Icon = STEP_ICONS[i]
              const isCompleted = checklistCompleted[i]
              const isLocked = i > 0 && !arrived
              const isCurrent = !isCompleted && !isLocked && (i === 0 || checklistCompleted[i - 1])

              let circleClass = ''
              let lineColor = ''
              if (isLocked) {
                circleClass = 'bg-navy-700 opacity-50'
                lineColor = 'bg-navy-700 opacity-50'
              } else if (isCompleted) {
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
                      disabled={isLocked}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${circleClass} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isCurrent ? 'text-ice-400' : isLocked ? 'text-navy-600' : 'text-navy-600'}`} />
                      )}
                    </button>
                    {i < 3 && <div className={`w-0.5 h-8 ${lineColor}`} />}
                  </div>
                  <button
                    onClick={() => handleStepClick(i)}
                    disabled={isLocked}
                    className={`pt-2.5 text-base min-h-[44px] flex items-center ${
                      isLocked
                        ? 'text-navy-600 cursor-not-allowed opacity-50'
                        : isCompleted
                        ? 'text-cool-50'
                        : isCurrent
                        ? 'text-ice-400'
                        : 'text-navy-600'
                    }`}
                  >
                    {label}
                    {isLocked && <span className="ml-2 text-xs text-navy-600">(到达后解锁)</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-sm border-t border-navy-700/50">
        {!arrived ? (
          <button
            onClick={handleSafePark}
            disabled={checklistCompleted[0]}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all min-h-[44px] ${
              checklistCompleted[0]
                ? 'bg-navy-700 text-navy-600 cursor-not-allowed'
                : 'btn-warn text-white'
            }`}
          >
            {checklistCompleted[0] ? '已安全停车' : '我已安全停车'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/receipt')}
            className="btn-ok w-full"
          >
            前往处置回执
          </button>
        )}
      </div>

      {showArrivalModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/98 flex flex-col items-center justify-center px-6">
          <div className="animate-bounce-in mb-6">
            <CheckCircle className="w-24 h-24 text-ok-400" />
          </div>
          <h2 className="text-3xl font-bold text-cool-50 mb-2">已到达目的地！</h2>
          <p className="text-cool-100 mb-8">请按步骤完成补冷处置</p>
          <button
            onClick={() => {
              setShowArrivalModal(false)
              navigate('/receipt')
            }}
            className="btn-ok w-full max-w-sm"
          >
            开始处置
          </button>
        </div>
      )}

      {showMidRouteModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-navy-800 rounded-t-2xl sm:rounded-2xl p-6 border border-navy-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-ice-500/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-ice-400" />
              </div>
              <h2 className="text-xl font-bold text-cool-50">途中复测</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-cool-100 mb-2">当前温度</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    placeholder="请输入温度"
                    className="input-field pr-12 text-lg font-din"
                    step="0.1"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-100">℃</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-cool-100 mb-2">备注</label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="备注：温度变化情况等"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMidRouteModal(false)
                  setTempInput('')
                  setNoteInput('')
                }}
                className="flex-1 py-3.5 rounded-xl bg-navy-700 text-cool-50 font-semibold min-h-[44px] active:bg-navy-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveReading}
                disabled={!tempInput || isNaN(parseFloat(tempInput))}
                className="flex-1 py-3.5 rounded-xl bg-ice-500 text-navy-900 font-semibold min-h-[44px] active:bg-ice-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
