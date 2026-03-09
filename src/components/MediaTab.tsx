import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

type MetaMonth = { month: string; spend: number; impressions: number; clicks: number; leads: number; purchases: number }
type GoogleMonth = { month: string; spend: number; impressions: number; clicks: number; conversions: number }

export function MediaTab({ meta, google }: { meta: MetaMonth[]; google: GoogleMonth[] }) {
  const combined = meta.map(m => {
    const g = google.find(g => g.month === m.month)
    return {
      month: m.month.slice(2),
      meta_spend: m.spend,
      google_spend: g?.spend || 0,
      meta_clicks: m.clicks,
      google_clicks: g?.clicks || 0,
      meta_impressions: m.impressions,
      google_impressions: g?.impressions || 0,
      meta_leads: m.leads,
      meta_purchases: m.purchases,
      google_conversions: g?.conversions || 0,
    }
  })

  const totalMeta = meta.reduce((s, m) => s + m.spend, 0)
  const totalGoogle = google.reduce((s, g) => s + g.spend, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-slate-400">Total Meta Ads</div>
          <div className="text-2xl font-bold text-blue-400">R${(totalMeta / 1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-slate-400">Total Google Ads</div>
          <div className="text-2xl font-bold text-amber-400">R${(totalGoogle / 1e6).toFixed(2)}M</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Investimento Mensal por Plataforma</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
            <Bar dataKey="meta_spend" name="Meta Ads" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="google_spend" name="Google Ads" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Clicks por Plataforma</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="meta_clicks" name="Meta Clicks" stroke="#3b82f6" dot={false} />
            <Line type="monotone" dataKey="google_clicks" name="Google Clicks" stroke="#f59e0b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Conversoes: Leads & Purchases (Meta) / Conversions (Google)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="meta_leads" name="Meta Leads" stroke="#8b5cf6" dot={false} />
            <Line type="monotone" dataKey="meta_purchases" name="Meta Purchases" stroke="#10b981" dot={false} />
            <Line type="monotone" dataKey="google_conversions" name="Google Conversions" stroke="#f59e0b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
