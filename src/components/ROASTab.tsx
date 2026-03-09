import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, Area } from 'recharts'

export function ROASTab({ meta, google, revenue }: { meta: any[]; google: any[]; revenue: any[] }) {
  const roasData = revenue.map((r: any) => {
    const m = meta.find((m: any) => m.month === r.month)
    const g = google.find((g: any) => g.month === r.month)
    const metaSpend = m?.spend || 0
    const googleSpend = g?.spend || 0
    const totalSpend = metaSpend + googleSpend
    return {
      month: r.month.slice(2),
      roas: totalSpend > 0 ? r.gross / totalSpend : 0,
      meta_roas: metaSpend > 0 ? r.gross / metaSpend : 0,
      meta_cpa: m && m.purchases > 0 ? metaSpend / m.purchases : 0,
      google_cpa: g && g.conversions > 0 ? googleSpend / g.conversions : 0,
      revenue: r.gross,
      spend: totalSpend,
      profit: r.gross - totalSpend,
      refund_rate: r.gross > 0 ? (r.refunds / r.gross * 100) : 0,
    }
  }).filter((d: any) => d.spend > 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">ROAS Mensal (Receita / Investimento)</h3>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(2)}x`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="roas" name="ROAS" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="refund_rate" name="Refund %" stroke="#ef4444" dot={false} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CPA: Meta vs Google</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roasData.filter((d: any) => d.meta_cpa > 0 && d.meta_cpa < 5000)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${v.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toFixed(2)}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="meta_cpa" name="Meta CPA" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="google_cpa" name="Google CPA" stroke="#f59e0b" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Receita vs Investimento vs Lucro/Prejuizo</h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="spend" name="Investimento" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Area type="monotone" dataKey="profit" name="Resultado" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
