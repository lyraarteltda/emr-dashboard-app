import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type StateData = { state: string; txns: number; revenue: number }

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16']

export function GeoTab({ data }: { data: StateData[] }) {
  const top10 = data.slice(0, 10)
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const pieData = top10.map(d => ({ name: d.state, value: d.revenue, pct: (d.revenue / totalRevenue * 100).toFixed(1) }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Estado (Top 10)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={top10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="state" stroke="#64748b" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuicao Receita</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Todos os Estados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Estado</th>
                <th className="text-right py-2 px-3">Transacoes</th>
                <th className="text-right py-2 px-3">Receita</th>
                <th className="text-right py-2 px-3">% Total</th>
                <th className="text-right py-2 px-3">Ticket Medio</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.state} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 font-medium text-white">{d.state}</td>
                  <td className="py-2 px-3 text-right">{d.txns.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">R${d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{(d.revenue / totalRevenue * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-amber-400">R${(d.txns > 0 ? d.revenue / d.txns : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
