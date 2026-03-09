import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899']

export function MarketingTab({ conversions, campaigns }: { conversions: any[]; campaigns: any[] }) {
  const nonZero = conversions.filter((d: any) => d.conversions > 0)
  const top20 = nonZero.slice(0, 20).map((d: any) => ({
    ...d,
    short: d.asset.length > 30 ? d.asset.slice(0, 30) + '...' : d.asset,
  }))

  const totalConversions = nonZero.reduce((s: number, d: any) => s + d.conversions, 0)
  const totalVisits = nonZero.reduce((s: number, d: any) => s + (d.visits || 0), 0)

  const statusCount: any = {}
  const objectiveCount: any = {}
  campaigns.forEach((c: any) => {
    const st = c.status || 'UNKNOWN'
    statusCount[st] = (statusCount[st] || 0) + 1
    const obj = (c.objective || '').replace('OUTCOME_', '') || 'OTHER'
    objectiveCount[obj] = (objectiveCount[obj] || 0) + 1
  })
  const activeCount = statusCount['ACTIVE'] || 0
  const pausedCount = statusCount['PAUSED'] || 0

  const objectiveData = Object.entries(objectiveCount).map(([k, v]) => ({ name: k, value: v })).sort((a: any, b: any) => b.value - a.value)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Conversoes</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{totalConversions.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-cyan-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Visitas</div>
          <div className="text-lg sm:text-2xl font-bold text-cyan-400">{totalVisits.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Landing Pages</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{nonZero.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-green-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Campanhas Ativas</div>
          <div className="text-lg sm:text-2xl font-bold text-green-400">{activeCount}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Campanhas Pausadas</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{pausedCount}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Top 20 Landing Pages por Conversoes</h3>
        <div className="h-[450px] sm:h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="short" stroke="#64748b" tick={{ fontSize: 8 }} width={180} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="conversions" name="Conversoes" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Objective Distribution */}
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Campanhas por Objetivo</h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={objectiveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent*100).toFixed(0)}%` : ''} labelLine={false}>
                  {objectiveData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All conversions table */}
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Todas Landing Pages ({nonZero.length})</h3>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="w-full text-[10px] sm:text-xs">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">Asset</th>
                  <th className="text-right py-1.5 px-2">Conv</th>
                  <th className="text-right py-1.5 px-2">Visitas</th>
                </tr>
              </thead>
              <tbody>
                {nonZero.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[180px]" title={c.asset}>{c.asset}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">{c.conversions.toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-slate-400">{(c.visits || 0).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Campanhas Meta ({campaigns.length} total — {activeCount} ativas)</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0 max-h-[400px] overflow-y-auto">
          <table className="w-full text-[10px] sm:text-sm min-w-[500px]">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2">Campanha</th>
                <th className="text-left py-1.5 px-2">Objetivo</th>
                <th className="text-center py-1.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.filter((c: any) => c.status === 'ACTIVE').concat(campaigns.filter((c: any) => c.status !== 'ACTIVE')).slice(0, 100).map((c: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 text-slate-300 truncate max-w-[250px]" title={c.name}>{c.name}</td>
                  <td className="py-1 px-2 text-slate-400 text-[10px]">{(c.objective || '').replace('OUTCOME_', '')}</td>
                  <td className="py-1 px-2 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
