import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'

type MetaMonth = { month: string; spend: number; impressions: number; clicks: number; leads: number; purchases: number }
type GoogleMonth = { month: string; spend: number; impressions: number; clicks: number; conversions: number }
type Revenue = { month: string; gross: number }

export function ROASTab({ meta, google, revenue }: { meta: MetaMonth[]; google: GoogleMonth[]; revenue: Revenue[] }) {
  const roasData = revenue.map(r => {
    const m = meta.find(m => m.month === r.month)
    const g = google.find(g => g.month === r.month)
    const totalSpend = (m?.spend || 0) + (g?.spend || 0)
    return {
      month: r.month.slice(2),
      roas: totalSpend > 0 ? r.gross / totalSpend : 0,
      meta_cpl: m && m.leads > 0 ? m.spend / m.leads : 0,
      meta_cpa: m && m.purchases > 0 ? m.spend / m.purchases : 0,
      google_cpc: g && g.clicks > 0 ? g.spend / g.clicks : 0,
      revenue: r.gross,
      spend: totalSpend,
    }
  }).filter(d => d.spend > 0)

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">ROAS Mensal (Receita / Investimento Total)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={roasData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toFixed(2)}x`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v: number, name: string) => [name === 'roas' ? `${v.toFixed(3)}x` : `R$${v.toFixed(2)}`, name]}
            />
            <Line type="monotone" dataKey="roas" name="ROAS" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">CPA Meta (Custo por Purchase)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roasData.filter(d => d.meta_cpa > 0 && d.meta_cpa < 5000)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `R$${v.toFixed(0)}`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toFixed(2)}`} />
            <Bar dataKey="meta_cpa" name="CPA Meta" fill="#f472b6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Receita vs Investimento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roasData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
            <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="spend" name="Investimento" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
