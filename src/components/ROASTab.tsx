import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, Area } from 'recharts'

const SourceBadge = ({ src }: { src: string }) => <span className="text-[8px] sm:text-[9px] text-slate-500 bg-slate-800 px-1 rounded ml-1">{src}</span>

export function ROASTab({ meta, google, revenue, crmMonthly, monthlyCombined }: { meta: any[]; google: any[]; revenue: any[]; crmMonthly?: any[]; monthlyCombined?: any[] }) {
  // ROAS using monthly_combined (has both checkout and CRM)
  const roasData = (monthlyCombined || revenue).map((r: any) => {
    const totalSpend = r.total_ad_spend || ((meta.find((m: any) => m.month === (r.month?.length === 7 ? r.month : ''))?.spend || 0) + (google.find((g: any) => g.month === (r.month?.length === 7 ? r.month : ''))?.spend || 0))
    const m = meta.find((m: any) => m.month === r.month)
    const g = google.find((g: any) => g.month === r.month)
    const checkoutGross = r.checkout_gross ?? r.gross ?? 0
    const crmValue = r.crm_won_value ?? 0
    return {
      month: (r.month || '').slice(2),
      roas_checkout: totalSpend > 0 ? checkoutGross / totalSpend : 0,
      roas_crm: totalSpend > 0 ? crmValue / totalSpend : 0,
      meta_cpa: m && m.purchases > 0 ? (m.spend || 0) / m.purchases : 0,
      google_cpa: g && g.conversions > 0 ? (g.spend || 0) / g.conversions : 0,
      checkout: checkoutGross,
      crm_won: crmValue,
      spend: totalSpend,
      profit_checkout: checkoutGross - totalSpend,
      profit_crm: crmValue - totalSpend,
      refund_rate: checkoutGross > 0 ? ((r.refunds || 0) / checkoutGross * 100) : 0,
    }
  }).filter((d: any) => d.spend > 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ROAS Real: CRM vs Checkout */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-1">ROAS Real (Cross-Channel) <SourceBadge src="CRM + Guru / Meta + Google" /></h3>
        <p className="text-[9px] sm:text-xs text-slate-400 mb-3">ROAS CRM = CRM Won Value / Total Ad Spend | ROAS Checkout = Checkout Revenue / Total Ad Spend</p>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#8b5cf6" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(1)}x`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="roas_crm" name="ROAS CRM (Real)" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="roas_checkout" name="ROAS Checkout" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line yAxisId="right" type="monotone" dataKey="refund_rate" name="Refund %" stroke="#ef4444" dot={false} strokeDasharray="2 2" strokeWidth={1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CPA: Meta vs Google <SourceBadge src="Meta + Google" /></h3>
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

      {/* CRM Revenue vs Spend vs Profit */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CRM Won Value vs Investimento <SourceBadge src="RD CRM + Meta + Google" /></h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="crm_won" name="CRM Won Value" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="spend" name="Ad Spend" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Area type="monotone" dataKey="profit_crm" name="Resultado CRM" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Checkout Revenue vs Spend (original view) */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Checkout Revenue vs Investimento <SourceBadge src="Guru + Meta + Google" /></h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="checkout" name="Checkout Revenue" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="spend" name="Ad Spend" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Area type="monotone" dataKey="profit_checkout" name="Resultado Checkout" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
