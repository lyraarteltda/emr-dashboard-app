import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#f97316']

export function CRMTab({ daily, details }: { daily: any[]; details: any }) {
  const sorted = [...daily].sort((a: any, b: any) => a.date.localeCompare(b.date))
  const chartData = sorted.map((d: any) => ({ ...d, label: d.date.slice(5) }))

  const totalWon = daily.reduce((s: number, d: any) => s + (d.won_value || 0), 0)
  const totalDeals = daily.reduce((s: number, d: any) => s + (d.won_count || 0), 0)
  const totalNew = daily.reduce((s: number, d: any) => s + (d.new_deals || 0), 0)
  const totalLost = daily.reduce((s: number, d: any) => s + (d.lost_count || 0), 0)
  const avgTicket = totalDeals > 0 ? totalWon / totalDeals : 0

  const stageData = details?.by_stage || []
  const pipelineData = details?.by_pipeline || []
  const lossReasons = details?.loss_reasons || []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {[
          { label: 'Total Won', value: `R$${(totalWon/1e6).toFixed(2)}M`, color: 'border-emerald-500/30 text-emerald-400' },
          { label: 'Deals Won', value: totalDeals.toLocaleString('pt-BR'), color: 'border-blue-500/30 text-blue-400' },
          { label: 'Novos Deals', value: totalNew.toLocaleString('pt-BR'), color: 'border-purple-500/30 text-purple-400' },
          { label: 'Lost', value: totalLost.toLocaleString('pt-BR'), color: 'border-red-500/30 text-red-400' },
          { label: 'Ticket Medio', value: `R$${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'border-amber-500/30 text-amber-400' },
        ].map(c => (
          <div key={c.label} className={`bg-slate-800/50 rounded-lg border ${c.color} p-2.5 sm:p-4`}>
            <div className="text-[10px] sm:text-xs text-slate-400">{c.label}</div>
            <div className={`text-sm sm:text-xl font-bold`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Valor Won por Dia</h3>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 8 }} interval={4} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="won_value" name="Valor Won" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Novos vs Won vs Lost (Diario)</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 8 }} interval={4} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="new_deals" name="Novos" stroke="#8b5cf6" dot={false} />
              <Line type="monotone" dataKey="won_count" name="Won" stroke="#10b981" dot={false} />
              <Line type="monotone" dataKey="lost_count" name="Lost" stroke="#ef4444" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipelines and Loss Reasons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Deals por Pipeline</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pipelineData} dataKey="count" nameKey="pipeline" cx="50%" cy="50%" outerRadius="70%" label={({ pipeline, percent, x, y }: any) => percent > 0.03 ? <text x={x} y={y} fill="#e2e8f0" fontSize={10} textAnchor="middle" dominantBaseline="central">{`${(pipeline || 'N/A').slice(0, 15)} ${(percent*100).toFixed(0)}%`}</text> : null} labelLine={true}>
                  {pipelineData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Motivos de Perda</h3>
          <div className="overflow-y-auto max-h-[280px]">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">Motivo</th>
                  <th className="text-right py-1.5 px-2">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {lossReasons.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[180px]">{r.reason}</td>
                    <td className="py-1 px-2 text-right text-red-400">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stages Table */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Deals por Stage</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[400px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2 sm:px-3">Stage</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Deals</th>
              </tr>
            </thead>
            <tbody>
              {stageData.map((s: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 sm:px-3 text-slate-300 truncate max-w-[180px]">{s.stage}</td>
                  <td className="py-1 px-2 sm:px-3 text-right">{(s.count || 0).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
