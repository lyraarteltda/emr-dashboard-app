import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS_FIRST = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#065f46', '#047857', '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4', '#5eead4', '#0f766e', '#115e59', '#134e4a']
const COLORS_LAST = ['#3b82f6', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e40af', '#1d4ed8', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#164e63']
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const fmt = (v: number) => v >= 1e6 ? `R$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `R$${(v / 1e3).toFixed(1)}K` : `R$${v.toFixed(0)}`

function PulsingDot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <PulsingDot />
      <p className="mt-3 text-sm">Aguardando conexao BigQuery...</p>
    </div>
  )
}

export function AttributionTab({ attribution }: { attribution: any }) {
  const [model, setModel] = useState<'first_touch' | 'last_touch'>('first_touch')

  if (!attribution || (!attribution.first_touch?.length && !attribution.last_touch?.length)) return <EmptyState />

  const firstTouch: any[] = attribution.first_touch || []
  const lastTouch: any[] = attribution.last_touch || []
  const activeData = model === 'first_touch' ? firstTouch : lastTouch
  const colors = model === 'first_touch' ? COLORS_FIRST : COLORS_LAST

  const totalConversions = activeData.reduce((s: number, d: any) => s + (d.conversions || 0), 0)
  const totalRevenue = activeData.reduce((s: number, d: any) => s + (d.revenue || 0), 0)
  const topSource = activeData.length > 0
    ? [...activeData].sort((a: any, b: any) => (b.conversions || 0) - (a.conversions || 0))[0]?.source || '-'
    : '-'

  const barData = [...activeData]
    .sort((a: any, b: any) => (b.conversions || 0) - (a.conversions || 0))
    .slice(0, 15)

  // Build comparison table: merge both models by source
  const comparisonMap = useMemo(() => {
    const map: Record<string, any> = {}
    firstTouch.forEach((d: any) => {
      const k = d.source || 'unknown'
      if (!map[k]) map[k] = { source: k }
      map[k].ft_conv = d.conversions || 0
      map[k].ft_rev = d.revenue || 0
    })
    lastTouch.forEach((d: any) => {
      const k = d.source || 'unknown'
      if (!map[k]) map[k] = { source: k }
      map[k].lt_conv = d.conversions || 0
      map[k].lt_rev = d.revenue || 0
    })
    return Object.values(map)
      .map((r: any) => ({
        ...r,
        ft_conv: r.ft_conv || 0,
        ft_rev: r.ft_rev || 0,
        lt_conv: r.lt_conv || 0,
        lt_rev: r.lt_rev || 0,
        delta_conv: (r.ft_conv || 0) - (r.lt_conv || 0),
      }))
      .sort((a: any, b: any) => Math.max(b.ft_conv, b.lt_conv) - Math.max(a.ft_conv, a.lt_conv))
  }, [firstTouch, lastTouch])

  // Channel mix by medium
  const channelMix = useMemo(() => {
    const map: Record<string, number> = {}
    activeData.forEach((d: any) => {
      const medium = (d.medium || 'direct').toLowerCase()
      map[medium] = (map[medium] || 0) + (d.conversions || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [activeData])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModel('first_touch')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${model === 'first_touch' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
        >
          First Touch
        </button>
        <button
          onClick={() => setModel('last_touch')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${model === 'last_touch' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
        >
          Last Touch
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Conversoes Atribuidas</p>
          <p className="text-lg sm:text-2xl font-bold text-white">{totalConversions.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Receita Atribuida</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400">{fmt(totalRevenue)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Top Source</p>
          <p className="text-lg sm:text-2xl font-bold text-cyan-400 truncate">{topSource}</p>
        </div>
      </div>

      {/* Horizontal Bar Chart - Top 15 Sources */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">
          Top 15 Sources por Conversoes ({model === 'first_touch' ? 'First Touch' : 'Last Touch'})
        </h3>
        <div className="h-[400px] sm:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis
                type="category"
                dataKey="source"
                stroke="#64748b"
                tick={{ fontSize: 9 }}
                width={75}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any, name: string) => name === 'revenue' ? fmt(Number(v)) : Number(v).toLocaleString('pt-BR')}
              />
              <Bar dataKey="conversions" name="Conversoes" fill={model === 'first_touch' ? '#10b981' : '#3b82f6'} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attribution Comparison Table */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Comparacao First Touch vs Last Touch</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-[10px] sm:text-xs min-w-[600px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Source</th>
                <th className="text-right py-2 px-2 text-emerald-400">FT Conv</th>
                <th className="text-right py-2 px-2 text-emerald-400">FT Rev</th>
                <th className="text-right py-2 px-2 text-blue-400">LT Conv</th>
                <th className="text-right py-2 px-2 text-blue-400">LT Rev</th>
                <th className="text-right py-2 px-2">Delta Conv</th>
              </tr>
            </thead>
            <tbody>
              {comparisonMap.slice(0, 25).map((r: any) => (
                <tr key={r.source} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1.5 sm:py-2 px-2 text-white font-medium truncate max-w-[120px]">{r.source}</td>
                  <td className="py-1.5 sm:py-2 px-2 text-right text-emerald-400">{r.ft_conv.toLocaleString('pt-BR')}</td>
                  <td className="py-1.5 sm:py-2 px-2 text-right text-emerald-300">{fmt(r.ft_rev)}</td>
                  <td className="py-1.5 sm:py-2 px-2 text-right text-blue-400">{r.lt_conv.toLocaleString('pt-BR')}</td>
                  <td className="py-1.5 sm:py-2 px-2 text-right text-blue-300">{fmt(r.lt_rev)}</td>
                  <td className={`py-1.5 sm:py-2 px-2 text-right font-medium ${r.delta_conv > 0 ? 'text-emerald-400' : r.delta_conv < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {r.delta_conv > 0 ? '+' : ''}{r.delta_conv.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channel Mix Pie Chart */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">
          Channel Mix ({model === 'first_touch' ? 'First Touch' : 'Last Touch'})
        </h3>
        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelMix}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                innerRadius="40%"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#64748b' }}
              >
                {channelMix.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => Number(v).toLocaleString('pt-BR')}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
