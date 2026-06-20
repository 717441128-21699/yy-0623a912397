import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Thermometer, Truck, Package, MapPin, ChevronDown, History } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { VEHICLES } from '@/utils/mockData'
import { CARGO_TYPES } from '@/utils/types'
import PhotoUpload from '@/components/PhotoUpload'

export default function Report() {
  const navigate = useNavigate()
  const {
    plateNumber, setPlateNumber,
    cargoType, setCargoType,
    currentTemp, setCurrentTemp,
    remainingMileage, setRemainingMileage,
    reportPhotos, addReportPhoto, removeReportPhoto,
    submitReport,
  } = useAppStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isValid = plateNumber && cargoType && currentTemp !== '' && remainingMileage !== '' && reportPhotos.length > 0

  const handleSubmit = () => {
    if (!isValid) return
    submitReport()
    navigate('/navigate')
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-28">
      <div className="px-4 py-3 flex items-center justify-between bg-navy-900">
        <h1 className="text-xl font-bold text-cool-50">冷链应急补冷</h1>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 rounded-lg text-cool-100 text-sm font-medium min-h-[44px] active:scale-[0.97] transition-transform"
        >
          <History className="w-4 h-4" />
          历史记录
        </button>
      </div>

      <div className="bg-red-600/90 animate-pulse-slow px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-white shrink-0" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">⚠ 车厢温度超限警告</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Thermometer className="w-5 h-5 text-white" />
          <span className="text-white font-din font-bold text-2xl">8.5℃</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="card-dark">
          <label className="flex items-center gap-2 text-cool-100 text-sm font-medium mb-2">
            <Truck className="w-4 h-4 text-ice-500" />
            车牌选择
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="input-field flex items-center justify-between text-left min-h-[44px]"
            >
              <span className={plateNumber ? 'text-cool-50' : 'text-navy-600'}>
                {plateNumber || '请选择车牌号'}
              </span>
              <ChevronDown className={`w-5 h-5 text-navy-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-700/60 rounded-lg overflow-hidden shadow-lg">
                {VEHICLES.map((v) => (
                  <button
                    key={v.plateNumber}
                    type="button"
                    onClick={() => {
                      setPlateNumber(v.plateNumber)
                      setDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors min-h-[44px] flex items-center justify-between ${
                      plateNumber === v.plateNumber
                        ? 'bg-ice-500/20 text-ice-400'
                        : 'text-cool-100 hover:bg-navy-700/60'
                    }`}
                  >
                    <span className="font-medium">{v.plateNumber}</span>
                    <span className="text-xs text-navy-600">{v.cargoType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card-dark">
          <label className="flex items-center gap-2 text-cool-100 text-sm font-medium mb-3">
            <Package className="w-4 h-4 text-ice-500" />
            货品类型
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CARGO_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCargoType(type)}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                  cargoType === type
                    ? 'bg-ice-500 text-navy-900 shadow-[0_0_12px_rgba(0,180,216,0.3)]'
                    : 'bg-navy-900/60 border border-navy-700/60 text-cool-100 active:scale-[0.97]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="card-dark">
          <label className="flex items-center gap-2 text-cool-100 text-sm font-medium mb-2">
            <Thermometer className="w-4 h-4 text-ice-500" />
            当前箱温
          </label>
          <div className="relative">
            <input
              type="number"
              value={currentTemp === '' ? '' : currentTemp}
              onChange={(e) => setCurrentTemp(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="输入当前温度"
              className="input-field pr-10 min-h-[44px]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-100 font-medium">℃</span>
          </div>
          <p className="text-navy-600 text-xs mt-1.5">温度范围: -25℃ ~ 15℃</p>
        </div>

        <div className="card-dark">
          <label className="flex items-center gap-2 text-cool-100 text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 text-ice-500" />
            预计剩余里程
          </label>
          <div className="relative">
            <input
              type="number"
              value={remainingMileage === '' ? '' : remainingMileage}
              onChange={(e) => setRemainingMileage(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="输入剩余里程"
              className="input-field pr-10 min-h-[44px]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-100 font-medium">km</span>
          </div>
        </div>

        <div className="card-dark">
          <PhotoUpload
            photos={reportPhotos}
            onAdd={addReportPhoto}
            onRemove={removeReportPhoto}
            maxPhotos={3}
            label="现场照片"
            hint="拍摄温控屏或封签照片（最多3张）"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="btn-warn"
        >
          提交异常上报
        </button>
      </div>
    </div>
  )
}
