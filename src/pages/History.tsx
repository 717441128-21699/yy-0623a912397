import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Thermometer,
  MapPin,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Camera,
  Filter,
  List,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { HistoryRecord, DispatcherDecision } from '@/utils/types'

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const getDecisionBadgeClass = (decision: DispatcherDecision): string => {
  switch (decision) {
    case '继续运输':
      return 'bg-ok-500/20 text-ok-400 border border-ok-500/30'
    case '换车':
      return 'bg-warn-500/20 text-warn-400 border border-warn-500/30'
    case '转入临时冷库':
      return 'bg-ice-500/20 text-ice-400 border border-ice-500/30'
    default:
      return 'bg-navy-700/50 text-cool-100 border border-navy-600/50'
  }
}

const getScoreBarColor = (decision: DispatcherDecision): string => {
  switch (decision) {
    case '继续运输':
      return 'bg-ok-500'
    case '换车':
      return 'bg-warn-500'
    case '转入临时冷库':
      return 'bg-ice-500'
    default:
      return 'bg-navy-600'
  }
}

export default function History() {
  const navigate = useNavigate()
  const { historyRecords } = useAppStore()

  const isValidDataUrl = (url: string): boolean => {
    return url.startsWith('data:image/')
  }

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [filterPlate, setFilterPlate] = useState<string>('')
  const [filterDecision, setFilterDecision] = useState<string>('')

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openPreview = (photos: string[], index: number) => {
    setPreviewPhotos(photos)
    setPreviewIndex(index)
    setPreviewPhoto(photos[index])
  }

  const closePreview = () => {
    setPreviewPhoto(null)
    setPreviewPhotos([])
    setPreviewIndex(0)
  }

  const prevPhoto = () => {
    const newIndex = (previewIndex - 1 + previewPhotos.length) % previewPhotos.length
    setPreviewIndex(newIndex)
    setPreviewPhoto(previewPhotos[newIndex])
  }

  const nextPhoto = () => {
    const newIndex = (previewIndex + 1) % previewPhotos.length
    setPreviewIndex(newIndex)
    setPreviewPhoto(previewPhotos[newIndex])
  }

  const uniquePlates = [...new Set(historyRecords.map((r) => r.plateNumber))]

  const filteredRecords = historyRecords.filter((record) => {
    const plateMatch = filterPlate === '' || record.plateNumber === filterPlate
    const decisionMatch =
      filterDecision === '' || record.dispatcherResult.decision === filterDecision
    return plateMatch && decisionMatch
  })

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const renderRecordCard = (record: HistoryRecord) => {
    const isExpanded = expandedId === record.id

    return (
      <div key={record.id} className="card-dark">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-navy-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDate(record.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-ice-500" />
            <span className="text-cool-50 font-medium">{record.plateNumber}</span>
          </div>
          <div className="w-px h-4 bg-navy-700" />
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-ice-500" />
            <span className="text-cool-100 text-sm">{record.cargoType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4 text-warn-400" />
          <span className="text-cool-100 text-sm">初始温度:</span>
          <span className="text-warn-400 font-din font-semibold">{record.initialTemp}℃</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-ice-400" />
          <span className="text-cool-100 text-sm">{record.planName}</span>
          <span className="text-xs text-navy-600 bg-navy-700/50 px-2 py-0.5 rounded">
            {record.planType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getDecisionBadgeClass(
              record.dispatcherResult.decision
            )}`}
          >
            {record.dispatcherResult.decision}
          </span>
          <button
            type="button"
            onClick={() => toggleExpand(record.id)}
            className="flex items-center gap-1 text-ice-400 text-sm font-medium min-h-[44px] px-3 rounded-lg hover:bg-ice-500/10 transition-colors"
          >
            {isExpanded ? (
              <>
                收起详情
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                查看详情
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-navy-700/50 pt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-cool-100 text-sm font-medium">初始上报数据</h4>
              <div className="bg-navy-900/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-navy-600 text-sm">剩余里程</span>
                  <span className="text-cool-50 font-din">{record.remainingMileage} km</span>
                </div>
                <div>
                  <span className="text-navy-600 text-sm">现场照片</span>
                  <div className="flex gap-2 mt-2">
                    {record.reportPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openPreview(record.reportPhotos, idx)}
                        className="w-16 h-16 rounded-lg overflow-hidden min-h-[44px] hover:ring-2 hover:ring-ice-500/50 transition-all"
                      >
                        {isValidDataUrl(photo) ? (
                          <img
                            src={photo}
                            alt={`照片 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: photo.startsWith('#') ? photo : '#1B3A5C' }}
                          >
                            <Camera className="w-5 h-5 text-navy-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {record.midRouteReadings && record.midRouteReadings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-cool-100 text-sm font-medium">途中温度记录</h4>
                <div className="bg-navy-900/50 rounded-lg p-3 space-y-2">
                  {record.midRouteReadings.map((reading) => {
                    const isHigher = reading.temperature > record.initialTemp
                    const isLower = reading.temperature < record.initialTemp
                    return (
                      <div key={reading.id} className="flex items-start justify-between py-1">
                        <div className="flex items-center gap-2">
                          {isHigher ? (
                            <TrendingUp className="w-4 h-4 text-warn-400" />
                          ) : isLower ? (
                            <TrendingDown className="w-4 h-4 text-ok-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-navy-500" />
                          )}
                          <span className={`font-din font-semibold ${
                            isHigher ? 'text-warn-400' : isLower ? 'text-ok-400' : 'text-cool-100'
                          }`}>
                            {reading.temperature}℃
                          </span>
                          {reading.note && (
                            <span className="text-navy-600 text-sm ml-2">{reading.note}</span>
                          )}
                        </div>
                        <span className="text-navy-600 text-xs">{formatTime(reading.createdAt)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-cool-100 text-sm font-medium">补冷数据</h4>
              <div className="bg-navy-900/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-navy-600 text-sm">补冷量</span>
                  <span className="text-cool-50 font-din">
                    {record.supplementAmount} {record.supplementUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-600 text-sm">复测温度</span>
                  <span className="text-ok-400 font-din">{record.retestTemp}℃</span>
                </div>
                <div>
                  <span className="text-navy-600 text-sm">回执照片</span>
                  <div className="flex gap-2 mt-2">
                    {record.receiptPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openPreview(record.receiptPhotos, idx)}
                        className="w-16 h-16 rounded-lg overflow-hidden min-h-[44px] hover:ring-2 hover:ring-ice-500/50 transition-all"
                      >
                        {isValidDataUrl(photo) ? (
                          <img
                            src={photo}
                            alt={`照片 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: photo.startsWith('#') ? photo : '#1B3A5C' }}
                          >
                            <Camera className="w-5 h-5 text-navy-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-cool-100 text-sm font-medium">调度员评估结果</h4>
              <div className="bg-navy-900/50 rounded-lg p-3 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-600 text-sm">综合评分</span>
                    <span
                      className={`font-din font-bold text-xl ${
                        record.dispatcherResult.score >= 80
                          ? 'text-ok-400'
                          : record.dispatcherResult.score >= 60
                          ? 'text-ice-400'
                          : 'text-warn-400'
                      }`}
                    >
                      {record.dispatcherResult.score}
                      <span className="text-sm text-navy-600 font-normal">/100</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(
                        record.dispatcherResult.decision
                      )}`}
                      style={{ width: `${record.dispatcherResult.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {record.dispatcherResult.temperatureOk ? (
                      <CheckCircle className="w-4 h-4 text-ok-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warn-400" />
                    )}
                    <span className="text-cool-100 text-sm">温度达标</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.dispatcherResult.supplementOk ? (
                      <CheckCircle className="w-4 h-4 text-ok-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warn-400" />
                    )}
                    <span className="text-cool-100 text-sm">补冷充足</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.dispatcherResult.siteReliable ? (
                      <CheckCircle className="w-4 h-4 text-ok-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warn-400" />
                    )}
                    <span className="text-cool-100 text-sm">站点可靠</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.dispatcherResult.distanceOk ? (
                      <CheckCircle className="w-4 h-4 text-ok-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warn-400" />
                    )}
                    <span className="text-cool-100 text-sm">距离合理</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-navy-600 text-sm">评估理由</span>
                  <ul className="space-y-1">
                    {record.dispatcherResult.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-cool-100 text-sm">
                        <span className="text-ice-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-navy-800/80 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-600 text-sm">最终决策</span>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getDecisionBadgeClass(
                        record.dispatcherResult.decision
                      )}`}
                    >
                      {record.dispatcherResult.decision}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="sticky top-0 z-10 bg-navy-900/95 backdrop-blur border-b border-navy-700/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/report')}
            className="w-10 h-10 rounded-lg bg-navy-800/80 flex items-center justify-center text-cool-100 hover:bg-navy-700/80 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-cool-50 text-lg font-semibold">应急处置记录</h1>
        </div>
      </div>

      <div className="sticky top-[57px] z-10 bg-navy-900/95 backdrop-blur border-b border-navy-700/50 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-ice-400" />
          <span className="text-cool-100 text-sm font-medium">筛选</span>
          <div className="flex-1" />
          <List className="w-4 h-4 text-navy-600" />
          <span className="text-navy-600 text-sm">共 {sortedRecords.length} 条记录</span>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={filterPlate}
              onChange={(e) => setFilterPlate(e.target.value)}
              className="input-field min-h-[44px] appearance-none cursor-pointer pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
              }}
            >
              <option value="">全部车牌</option>
              {uniquePlates.map((plate) => (
                <option key={plate} value={plate}>
                  {plate}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="input-field min-h-[44px] appearance-none cursor-pointer pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
              }}
            >
              <option value="">全部结论</option>
              <option value="继续运输">继续运输</option>
              <option value="换车">换车</option>
              <option value="转入临时冷库">转入临时冷库</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {sortedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-navy-600 mb-4" />
            <p className="text-navy-600 text-lg font-medium mb-2">暂无处置记录</p>
            <p className="text-navy-700 text-sm">完成应急处置后，记录将显示在这里</p>
          </div>
        ) : (
          sortedRecords.map(renderRecordCard)
        )}
      </div>

      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            type="button"
            onClick={closePreview}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center text-white min-h-[44px] z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {previewPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center text-white min-h-[44px]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center text-white min-h-[44px]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {isValidDataUrl(previewPhoto || '') ? (
            <img
              src={previewPhoto || ''}
              alt="预览"
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          ) : (
            <div
              className="w-64 h-64 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: (previewPhoto || '').startsWith('#') ? previewPhoto : '#1B3A5C' }}
            >
              <Camera className="w-10 h-10 text-navy-600" />
            </div>
          )}

          {previewPhotos.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {previewPhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === previewIndex ? 'bg-ice-500' : 'bg-navy-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
