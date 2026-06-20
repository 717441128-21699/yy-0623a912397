import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Snowflake,
  FlaskConical,
  Warehouse,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  X,
  Navigation,
  CheckCircle,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SUPPLEMENT_PLANS } from '@/utils/mockData'
import { PLAN_TYPES } from '@/utils/types'
import type { PlanType, SupplementPlan } from '@/utils/types'

const TYPE_ICONS: Record<PlanType, React.ElementType> = {
  干冰点: Snowflake,
  制冷剂补给点: FlaskConical,
  合作冷库: Warehouse,
  安全停车区: ShieldCheck,
}

const TABS: (PlanType | '全部')[] = ['全部', ...PLAN_TYPES]

export default function Navigate() {
  const navigate = useNavigate()
  const selectedPlanType = useAppStore((s) => s.selectedPlanType)
  const setSelectedPlanType = useAppStore((s) => s.setSelectedPlanType)
  const selectedPlan = useAppStore((s) => s.selectedPlan)
  const setSelectedPlan = useAppStore((s) => s.setSelectedPlan)
  const [detailPlan, setDetailPlan] = useState<SupplementPlan | null>(null)

  const filteredPlans =
    selectedPlanType === '全部'
      ? SUPPLEMENT_PLANS
      : SUPPLEMENT_PLANS.filter((p) => p.type === selectedPlanType)

  const handleCardClick = (plan: SupplementPlan) => {
    setSelectedPlan(plan)
    setDetailPlan(plan)
  }

  const handleConfirm = () => {
    if (selectedPlan) {
      navigate('/receipt')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white pb-28">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold">选择补冷方案</h1>
        <p className="text-sm text-gray-400 mt-1">根据您的位置推荐以下补冷方案</p>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedPlanType(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPlanType === tab
                ? 'bg-ice-500 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {filteredPlans.map((plan) => {
          const Icon = TYPE_ICONS[plan.type]
          const isSelected = selectedPlan?.id === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => handleCardClick(plan)}
              className={`card-dark rounded-xl p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-ice-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-700 shrink-0">
                    <Icon className="w-5 h-5 text-ice-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{plan.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-ice-500 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {plan.distance}km
                      </span>
                      <span className="flex items-center gap-1 text-ice-500 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        绕行{plan.detourMinutes}分钟
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plan.isOpen ? 'bg-ok-500' : 'bg-warn-500'
                    }`}
                  />
                  <span className={`text-xs ${plan.isOpen ? 'text-ok-500' : 'text-warn-500'}`}>
                    {plan.isOpen ? '营业中' : '已关闭'}
                  </span>
                </div>
              </div>

              {plan.capacity && plan.capacity !== '-' && (
                <p className="text-xs text-gray-400 mt-2 ml-[52px]">
                  容量：{plan.capacity}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-1.5 ml-[52px]">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a
                  href={`tel:${plan.contactPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-ice-400 hover:text-ice-300"
                >
                  {plan.contactPhone}
                </a>
                <span className="text-xs text-gray-500">({plan.contactName})</span>
              </div>
            </div>
          )
        })}
      </div>

      {detailPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setDetailPlan(null)}
        >
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="relative w-full bg-navy-800 rounded-t-2xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetailPlan(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-navy-700 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-700">
                {(() => {
                  const Icon = TYPE_ICONS[detailPlan.type]
                  return <Icon className="w-5 h-5 text-ice-400" />
                })()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{detailPlan.name}</h2>
                <p className="text-sm text-gray-400">{detailPlan.type}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-ice-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300">{detailPlan.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ice-500 shrink-0" />
                <span className="text-sm text-gray-300">营业时间：{detailPlan.businessHours}</span>
              </div>
              {detailPlan.capacity && detailPlan.capacity !== '-' && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-ice-500 shrink-0" />
                  <span className="text-sm text-gray-300">容量：{detailPlan.capacity}</span>
                </div>
              )}
            </div>

            <a
              href={`tel:${detailPlan.contactPhone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy-700 text-ice-400 text-lg font-medium mb-3 active:bg-navy-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              拨打电话 {detailPlan.contactPhone}
            </a>

            <button
              onClick={() => {
                setSelectedPlan(detailPlan)
                setDetailPlan(null)
              }}
              className="btn-ice w-full py-3 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              选择此方案
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur z-40">
        <button
          onClick={handleConfirm}
          disabled={!selectedPlan}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors ${
            selectedPlan
              ? 'btn-ice text-white'
              : 'bg-navy-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          确认选择
        </button>
      </div>
    </div>
  )
}
