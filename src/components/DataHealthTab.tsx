import { useState } from 'react'

const PLATFORMS = [
  { key: 'guru_digital', label: 'Guru Digital', color: 'emerald' },
  { key: 'meta_ads', label: 'Meta Ads', color: 'blue' },
  { key: 'google_ads', label: 'Google Ads', color: 'amber' },
  { key: 'rd_station', label: 'RD Station', color: 'purple' },
]

function hoursAgo(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
}

function statusBadge(hours: number, hasError?: boolean) {
  if (hasError || hours > 168) return { label: 'Error', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', dot: 'bg-red-500' }
  if (hours > 24) return { label: 'Stale', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-500' }
  return { label: 'OK', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-500' }
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Nunca'
  const h = hoursAgo(dateStr)
  if (h < 1) return `${Math.round(h * 60)}min atras`
  if (h < 24) return `${Math.round(h)}h atras`
  return `${Math.round(h / 24)}d atras`
}

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

export function DataHealthTab({ health, syncStatus, validation }: { health: any; syncStatus: any; validation: any }) {
  if (!health && !syncStatus && !validation) return <EmptyState />

  const bqConnected = health?.connected ?? false
  const guruRevenue = validation?.guru_revenue ?? 0
  const dashboardRevenue = validation?.dashboard_total_revenue ?? 0
  const delta = Math.abs(guruRevenue - dashboardRevenue)
  const deltaPercent = dashboardRevenue > 0 ? (delta / dashboardRevenue) * 100 : 0
  const revenueMatch = delta < 1 || deltaPercent < 0.01

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Connection Status */}
      <div className={`bg-slate-800/50 rounded-lg sm:rounded-xl border p-3 sm:p-5 ${bqConnected ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">BigQuery Connection</h3>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${bqConnected ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'bg-red-500 shadow-red-500/50 shadow-lg'}`} />
          <span className={`text-sm font-medium ${bqConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {bqConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        {health && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400">Project ID</p>
              <p className="text-xs sm:text-sm text-white font-mono">{health.project_id || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400">Dataset</p>
              <p className="text-xs sm:text-sm text-white font-mono">{health.dataset || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400">Ultima Query</p>
              <p className="text-xs sm:text-sm text-white">{health.last_query ? timeAgo(health.last_query) : '-'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Platform Sync Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {PLATFORMS.map(p => {
          const sync = syncStatus?.[p.key]
          const h = hoursAgo(sync?.last_sync)
          const s = statusBadge(h, sync?.error)
          return (
            <div key={p.key} className={`bg-slate-800/50 rounded-lg sm:rounded-xl border ${s.border} p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] sm:text-xs font-medium text-slate-300">{p.label}</h4>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${s.bg} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {sync?.row_count != null ? sync.row_count.toLocaleString('pt-BR') : '-'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">registros</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                Sync: {sync?.last_sync ? timeAgo(sync.last_sync) : 'Nunca'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Revenue Validation */}
      <div className={`bg-slate-800/50 rounded-lg sm:rounded-xl border p-3 sm:p-5 ${revenueMatch ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Validacao de Receita</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">SUM(guru_revenue)</p>
            <p className="text-lg sm:text-2xl font-bold text-emerald-400">
              R${guruRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex justify-center">
            {revenueMatch ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm font-medium">Match</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-red-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-medium mt-1">Delta: R${delta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({deltaPercent.toFixed(2)}%)</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">dashboard_total_revenue</p>
            <p className="text-lg sm:text-2xl font-bold text-cyan-400">
              R${dashboardRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Data Freshness Timeline */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Frescor dos Dados</h3>
        <div className="space-y-3">
          {PLATFORMS.map(p => {
            const sync = syncStatus?.[p.key]
            const h = hoursAgo(sync?.last_sync)
            const maxHours = 168 // 7 days
            const pct = Math.min((h / maxHours) * 100, 100)
            const s = statusBadge(h, sync?.error)
            return (
              <div key={p.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs text-slate-300">{p.label}</span>
                  <span className={`text-[10px] sm:text-xs ${s.text}`}>{sync?.last_sync ? timeAgo(sync.last_sync) : 'Sem dados'}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${h <= 24 ? 'bg-emerald-500' : h <= 168 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${100 - pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>Agora</span>
            <span>7 dias atras</span>
          </div>
        </div>
      </div>
    </div>
  )
}
