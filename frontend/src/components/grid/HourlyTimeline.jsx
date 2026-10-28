function HourlyTimeline({ items, scale, selected, onSelect }) {
  return (
    <div className="chart-container">
      <h3>🕐 Hourly power source</h3>
      <div className="grid-legend">
        <span><i className="dot main" /> Main Grid</span>
        <span><i className="dot renew" /> Renewable Storage</span>
        <span><i className="dot over" /> Overload</span>
      </div>
      <div className="grid-timeline">
        {items.map((it, idx) => {
          const renew = it.grid_mode === 'RENEWABLE_STORAGE'
          const cls = ['grid-slot', renew ? 'renew' : 'main', it.overload ? 'over' : '', idx === selected ? 'sel' : ''].join(' ')
          return (
            <button key={it.label} className={cls} onClick={() => onSelect(idx)}
              aria-label={`${it.label}, ${renew ? 'Renewable Storage' : 'Main Grid'}, ${(it.demand * scale).toFixed(1)} kW${it.overload ? ', overload' : ''}`}>
              <strong>{it.label.slice(0, 2)}</strong>
              <span>{(it.demand * scale).toFixed(scale < 1 ? 1 : 0)}</span>
            </button>
          )
        })}
      </div>
      <p className="grid-note">Tap an hour to see the battery level at that time.</p>
    </div>
  )
}

export default HourlyTimeline
