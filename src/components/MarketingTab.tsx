import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Conversion = { asset: string; conversions: number; visits: number; rate: number }

export function MarketingTab({ data }: { data: Conversion[] }) {
  const top20 = data.slice(0, 20).map(d => ({
    ...d,
    short: d.asset.length > 35 ? d.asset.slice(0, 35) + '...' : d.asset,
  }))

  const totalConversions = data.reduce((s, d) => s + d.conversions, 0)
  const totalVisits = data.reduce((s, d) => s + d.visits, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-4">
          <div className="text-xs text-slate-400">Total Conversoes</div>
          <div className="text-2xl font-bold text-emerald-400">{totalConversions.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-blue-500/30 p-4">
          <div className="text-xs text-slate-400">Total Visitas</div>
          <div className="text-2xl font-bold text-blue-400">{totalVisits.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-purple-500/30 p-4">
          <div className="text-xs text-slate-400">Landing Pages</div>
          <div className="text-2xl font-bold text-purple-400">{data.length}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top 20 Landing Pages por Conversoes</h3>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart data={top20} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="short" stroke="#64748b" tick={{ fontSize: 9 }} width={220} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="conversions" name="Conversoes" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Detalhes das Landing Pages</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Asset</th>
                <th className="text-right py-2 px-3">Conversoes</th>
                <th className="text-right py-2 px-3">Visitas</th>
                <th className="text-right py-2 px-3">Taxa %</th>
              </tr>
            </thead>
            <tbody>
              {top20.map((d, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-slate-300 max-w-xs truncate" title={d.asset}>{d.short}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{d.conversions.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right">{d.visits.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right text-amber-400">{d.rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
