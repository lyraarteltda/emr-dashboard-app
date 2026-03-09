import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'

type CRMDay = { date: string; new: number; won: number; lost: number; value_won: number }

export function CRMTab({ data }: { data: CRMDay[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const chartData = sorted.map(d => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }))

  const totalWon = data.reduce((s, d) => s + d.value_won, 0)
  const totalDeals = data.reduce((s, d) => s + d.won, 0)
  const totalNew = data.reduce((s, d) => s + d.new, 0)
  const totalLost = data.reduce((s, d) => s + d.lost, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-4">
          <div className="text-xs text-slate-400">Total Won Value</div>
          <div className="text-xl font-bold text-emerald-400">R${(totalWon / 1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-blue-500/30 p-4">
          <div className="text-xs text-slate-400">Deals Won</div>
          <div className="text-xl font-bold text-blue-400">{totalDeals.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-purple-500/30 p-4">
          <div className="text-xs text-slate-400">Novos Deals</div>
          <div className="text-xl font-bold text-purple-400">{totalNew.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-4">
          <div className="text-xs text-slate-400">Lost</div>
          <div className="text-xl font-bold text-red-400">{totalLost.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Valor Won por Dia</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval={4} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Bar dataKey="value_won" name="Valor Won" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Novos vs Won vs Lost</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval={4} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="new" name="Novos" stroke="#8b5cf6" dot={false} />
            <Line type="monotone" dataKey="won" name="Won" stroke="#10b981" dot={false} />
            <Line type="monotone" dataKey="lost" name="Lost" stroke="#ef4444" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
