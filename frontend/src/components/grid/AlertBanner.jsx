import { OVERLOAD_KW } from '../../grid/controller'

function AlertBanner({ items }) {
  const hot = items.filter((i) => i.overload)
  if (hot.length === 0) return null
  const peak = Math.max(...hot.map((i) => i.demand))
  return (
    <div className="grid-alert" role="alert">
      🚨 Critical overload predicted at {hot.map((i) => i.label).join(', ')}. Demand peaks at{' '}
      {peak.toFixed(1)} kW (limit {OVERLOAD_KW} kW).
    </div>
  )
}

export default AlertBanner
