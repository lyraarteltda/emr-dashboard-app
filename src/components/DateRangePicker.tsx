import { useState, useRef, useEffect } from 'react'

interface DateRangePickerProps {
  value: { start: string; end: string } | null
  onChange: (range: { start: string; end: string } | null) => void
  minDate: string
  maxDate: string
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function monthStart(offset = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset, 1)
  return d.toISOString().slice(0, 10)
}

function monthEnd(offset = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() + 1 + offset, 0)
  return d.toISOString().slice(0, 10)
}

function yearStart() {
  return `${new Date().getFullYear()}-01-01`
}

export function DateRangePicker({ value, onChange, minDate, maxDate }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const presets: { label: string; range: { start: string; end: string } | null }[] = [
    { label: 'Ultimos 7 dias', range: { start: daysAgo(7), end: today() } },
    { label: 'Ultimos 30 dias', range: { start: daysAgo(30), end: today() } },
    { label: 'Ultimos 90 dias', range: { start: daysAgo(90), end: today() } },
    { label: 'Este mes', range: { start: monthStart(), end: today() } },
    { label: 'Mes anterior', range: { start: monthStart(-1), end: monthEnd(-1) } },
    { label: 'YTD', range: { start: yearStart(), end: today() } },
    { label: 'Todos', range: null },
  ]

  const yearPresets = ['2022', '2023', '2024', '2025', '2026']

  const label = value
    ? `${value.start.slice(5).replace('-', '/')} — ${value.end.slice(5).replace('-', '/')}`
    : 'Todos os Periodos'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-slate-700 border border-slate-600 text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer flex items-center gap-1.5 hover:bg-slate-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="truncate max-w-[120px] sm:max-w-[160px]">{label}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[280px] sm:w-[320px] bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-50 p-3 space-y-3">
          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">De</label>
              <input
                type="date"
                value={value?.start || ''}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  const start = e.target.value
                  const end = value?.end || maxDate
                  if (start && end) onChange({ start, end: end < start ? start : end })
                }}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Ate</label>
              <input
                type="date"
                value={value?.end || ''}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  const end = e.target.value
                  const start = value?.start || minDate
                  if (start && end) onChange({ start: start > end ? end : start, end })
                }}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5">Periodos rapidos</div>
            <div className="flex flex-wrap gap-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { onChange(p.range); setOpen(false) }}
                  className={`px-2 py-1 rounded text-[10px] sm:text-xs border transition-colors ${
                    (p.range === null && value === null) ||
                    (p.range && value && p.range.start === value.start && p.range.end === value.end)
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Presets */}
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5">Por ano</div>
            <div className="flex flex-wrap gap-1">
              {yearPresets.map((y) => {
                const range = { start: `${y}-01-01`, end: y === '2026' ? maxDate : `${y}-12-31` }
                const active = value && value.start === range.start && value.end === range.end
                return (
                  <button
                    key={y}
                    onClick={() => { onChange(range); setOpen(false) }}
                    className={`px-2.5 py-1 rounded text-[10px] sm:text-xs border transition-colors ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
