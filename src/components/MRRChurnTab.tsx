import { useMemo } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

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

export function MRRChurnTab({ mrr, churn }: { mrr: any[]; churn: any[] }) {
  if ((!mrr || mrr.length === 0) && (!churn || churn.length === 0)) return <EmptyState />

  const mrrData = (mrr || []).map((d: any) => ({
    ...d,
    label: (d.month || '').slice(2),
    new_mrr: d.new_mrr || 0,
    expansion: d.expansion || 0,
    contraction: -(Math.abs(d.contraction || 0)),
    churned: -(Math.abs(d.churned || 0)),
  }))

  const churnData = (churn || []).map((d: any) => ({
    ...d,
    label: (d.month || '').slice(2),
    churn_rate: d.churn_rate || 0,
  }))

  const currentMRR = mrrData.length > 0 ? mrrData[mrrData.length - 1].mrr || 0 : 0
  const prevMRR = mrrData.length > 1 ? mrrData[mrrData.length - 2].mrr || 0 : 0
  const mrrGrowth = prevMRR > 0 ? ((currentMRR - prevMRR) / prevMRR) * 100 : 0

  const latestChurn = churnData.length > 0 ? churnData[churnData.length - 1].churn_rate : 0

  // Net Revenue Retention = (MRR + expansion - contraction - churned) / previous MRR
  const latestMRR = mrrData.length > 0 ? mrrData[mrrData.length - 1] : null
  const nrr = useMemo(() => {
    if (!latestMRR || prevMRR <= 0) return 0
    const retained = prevMRR + (latestMRR.expansion || 0) + (latestMRR.contraction || 0) + (latestMRR.churned || 0)
    return (retained / prevMRR) * 100
  }, [latestMRR, prevMRR])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-emerald-500/30 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">MRR Atual</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400">{fmt(currentMRR)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Crescimento MRR</p>
          <p className={`text-lg sm:text-2xl font-bold ${mrrGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}%
          </p>
          <p className="text-[9px] sm:text-[10px] text-slate-500">vs mes anterior</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Churn Rate</p>
          <p className={`text-lg sm:text-2xl font-bold ${latestChurn <= 3 ? 'text-emerald-400' : latestChurn <= 7 ? 'text-amber-400' : 'text-red-400'}`}>
            {latestChurn.toFixed(1)}%
          </p>
          <p className="text-[9px] sm:text-[10px] text-slate-500">ultimo mes</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-400">Net Revenue Retention</p>
          <p className={`text-lg sm:text-2xl font-bold ${nrr >= 100 ? 'text-emerald-400' : nrr >= 90 ? 'text-amber-400' : 'text-red-400'}`}>
            {nrr > 0 ? `${nrr.toFixed(1)}%` : '-'}
          </p>
        </div>
      </div>

      {/* MRR Waterfall Chart */}
      {mrrData.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-1">MRR Waterfall</h3>
          <p className="text-[9px] sm:text-xs text-slate-400 mb-3">Novo + Expansao (verde) | Contracao + Churn (vermelho) | Linha = MRR Total</p>
          <div className="h-[280px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mrrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any, name: string) => [fmt(Math.abs(Number(v))), name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="new_mrr" name="Novo MRR" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="left" dataKey="expansion" name="Expansao" stackId="a" fill="#34d399" />
                <Bar yAxisId="left" dataKey="contraction" name="Contracao" stackId="b" fill="#f59e0b" radius={[0, 0, 2, 2]} />
                <Bar yAxisId="left" dataKey="churned" name="Churn" stackId="b" fill="#ef4444" />
                <Line yAxisId="right" type="monotone" dataKey="mrr" name="MRR Total" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Churn Rate Over Time */}
      {churnData.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Churn Rate ao Longo do Tempo</h3>
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(1)}%`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => `${Number(v).toFixed(2)}%`}
                />
                <Area type="monotone" dataKey="churn_rate" name="Churn Rate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Churned customers info */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {churnData.slice(-4).map((d: any) => (
              <div key={d.month} className="bg-slate-900/50 rounded-lg p-2">
                <p className="text-[9px] text-slate-500">{d.label}</p>
                <p className="text-xs font-medium text-red-400">{d.churned_customers || 0} churned</p>
                <p className="text-[9px] text-slate-400">de {d.total_customers || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MRR Breakdown Table */}
      {mrrData.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">MRR Breakdown Mensal</h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-[10px] sm:text-xs min-w-[600px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 px-2">Mes</th>
                  <th className="text-right py-2 px-2">MRR Total</th>
                  <th className="text-right py-2 px-2 text-emerald-400">Novo</th>
                  <th className="text-right py-2 px-2 text-green-300">Expansao</th>
                  <th className="text-right py-2 px-2 text-amber-400">Contracao</th>
                  <th className="text-right py-2 px-2 text-red-400">Churn</th>
                  <th className="text-right py-2 px-2">Net Change</th>
                </tr>
              </thead>
              <tbody>
                {mrrData.map((d: any) => {
                  const netChange = (d.new_mrr || 0) + (d.expansion || 0) + (d.contraction || 0) + (d.churned || 0)
                  return (
                    <tr key={d.month} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-1.5 sm:py-2 px-2 text-white font-medium">{d.month}</td>
                      <td className="py-1.5 sm:py-2 px-2 text-right text-white font-bold">{fmt(d.mrr || 0)}</td>
                      <td className="py-1.5 sm:py-2 px-2 text-right text-emerald-400">{fmt(d.new_mrr || 0)}</td>
                      <td className="py-1.5 sm:py-2 px-2 text-right text-green-300">{fmt(d.expansion || 0)}</td>
                      <td className="py-1.5 sm:py-2 px-2 text-right text-amber-400">{fmt(Math.abs(d.contraction || 0))}</td>
                      <td className="py-1.5 sm:py-2 px-2 text-right text-red-400">{fmt(Math.abs(d.churned || 0))}</td>
                      <td className={`py-1.5 sm:py-2 px-2 text-right font-medium ${netChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {netChange >= 0 ? '+' : ''}{fmt(netChange)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
