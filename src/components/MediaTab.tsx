import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899']

export function MediaTab({ meta, google, metaStats, googleCampaigns }: { meta: any[]; google: any[]; metaStats: any; googleCampaigns: any }) {
  const combined = meta.map((m: any) => {
    const g = google.find((g: any) => g.month === m.month)
    return {
      month: m.month.slice(2),
      meta_spend: m.spend, google_spend: g?.spend || 0,
      meta_clicks: m.clicks, google_clicks: g?.clicks || 0,
      meta_impressions: m.impressions, google_impressions: g?.impressions || 0,
      meta_leads: m.leads, meta_purchases: m.purchases,
      google_conversions: g?.conversions || 0,
      meta_cpm: m.impressions > 0 ? (m.spend / m.impressions * 1000) : 0,
      meta_cpc: m.clicks > 0 ? m.spend / m.clicks : 0,
      google_cpc: g && g.clicks > 0 ? g.spend / g.clicks : 0,
    }
  })

  const totalMeta = meta.reduce((s: number, m: any) => s + m.spend, 0)
  const totalGoogle = google.reduce((s: number, g: any) => s + g.spend, 0)
  const totalMetaClicks = meta.reduce((s: number, m: any) => s + m.clicks, 0)
  const totalGoogleClicks = google.reduce((s: number, g: any) => s + g.clicks, 0)
  const totalMetaImpr = meta.reduce((s: number, m: any) => s + m.impressions, 0)
  const totalGoogleImpr = google.reduce((s: number, g: any) => s + g.impressions, 0)

  // Derive objective/channel distributions from campaign arrays
  const metaObjMap: any = {}
  const metaCampaigns = Array.isArray(metaStats) ? metaStats : []
  metaCampaigns.forEach((c: any) => {
    const obj = (c.objective || 'UNKNOWN').replace('OUTCOME_', '')
    metaObjMap[obj] = (metaObjMap[obj] || 0) + 1
  })
  const metaObjData = Object.entries(metaObjMap).map(([k, v]: any) => ({ name: k, value: v }))

  const googleChannelMap: any = {}
  const googleCampaignList = Array.isArray(googleCampaigns) ? googleCampaigns : []
  googleCampaignList.forEach((c: any) => {
    const ch = c.channel || c.type || 'UNKNOWN'
    googleChannelMap[ch] = (googleChannelMap[ch] || 0) + 1
  })
  const googleChannelData = Object.entries(googleChannelMap).map(([k, v]: any) => ({ name: k, value: v }))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[
          { label: 'Meta Spend', value: `R$${(totalMeta/1e6).toFixed(2)}M`, color: 'text-blue-400' },
          { label: 'Google Spend', value: `R$${(totalGoogle/1e6).toFixed(2)}M`, color: 'text-amber-400' },
          { label: 'Meta Clicks', value: `${(totalMetaClicks/1e6).toFixed(1)}M`, color: 'text-blue-300' },
          { label: 'Google Clicks', value: `${(totalGoogleClicks/1e3).toFixed(0)}K`, color: 'text-amber-300' },
          { label: 'Meta Impressoes', value: `${(totalMetaImpr/1e9).toFixed(2)}B`, color: 'text-blue-200' },
          { label: 'Google Impressoes', value: `${(totalGoogleImpr/1e6).toFixed(0)}M`, color: 'text-amber-200' },
        ].map(c => (
          <div key={c.label} className="bg-slate-800/50 rounded-lg border border-slate-700 p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-slate-400 truncate">{c.label}</div>
            <div className={`text-sm sm:text-lg font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Spend Chart */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Investimento Mensal por Plataforma</h3>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="meta_spend" name="Meta Ads" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="google_spend" name="Google Ads" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CPC Trends */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CPC e CPM Meta (Mensal)</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${v.toFixed(1)}`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toFixed(2)}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="meta_cpc" name="Meta CPC" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="google_cpc" name="Google CPC" stroke="#f59e0b" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="meta_cpm" name="Meta CPM" stroke="#8b5cf6" dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversions */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Leads, Purchases & Conversions</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="meta_leads" name="Meta Leads" stroke="#8b5cf6" dot={false} />
              <Line type="monotone" dataKey="meta_purchases" name="Meta Purchases" stroke="#10b981" dot={false} />
              <Line type="monotone" dataKey="google_conversions" name="Google Conv" stroke="#f59e0b" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Meta Campaigns por Objetivo</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metaObjData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {metaObjData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Google Campaigns por Canal ({googleCampaignList.length} total)</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={googleChannelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {googleChannelData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
