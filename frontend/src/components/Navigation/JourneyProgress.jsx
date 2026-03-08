const STEP_ICONS = {
  checkin: 'C',
  security: 'S',
  passport: 'P',
  gate: 'G',
}

const STEP_LABELS = {
  checkin: 'Check-in',
  security: 'Security',
  passport: 'Passport',
  gate: 'Gate',
}

export default function JourneyProgress({ plan, currentIndex }) {
  if (!plan?.length) return null

  return (
    <div className="flex items-center justify-center gap-0 px-4">
      {plan.map((poi, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const cat = poi.category || 'gate'
        const icon = STEP_ICONS[cat] || '?'
        const label = poi.gate_number || STEP_LABELS[cat] || poi.name

        return (
          <div key={i} className="flex items-center">
            {/* Connector line */}
            {i > 0 && (
              <div className={`w-6 h-0.5 ${done ? 'bg-green-500/50' : 'bg-slate-700'}`} />
            )}

            {/* Step circle */}
            <div className="flex flex-col items-center gap-0.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                  : active
                    ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : icon}
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                active ? 'text-blue-400' : done ? 'text-green-400/60' : 'text-slate-600'
              }`}>{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
