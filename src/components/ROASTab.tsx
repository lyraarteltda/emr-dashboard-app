import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Area } from 'recharts'

const VerifiedBadge = () => <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-2">Verified by BigQuery</span>
const SourceBadge = ({ src }: { src: string }) => <span className="text-[8px] sm:text-[9px] text-slate-500 bg-slate-800 px-1 rounded ml-1">{src}</span>

export function ROASTab({ meta, google, revenue, monthlyCombined }: { meta: any[]; google: any[]; revenue: any[]; crmMonthly?: any[]; monthlyCombined?: any[] }) {
  // UNIFIED ROAS: Revenue from Guru ONLY / Ad Spend from Meta+Google
  const roasData = (monthlyCombined || revenue).map((r: any) => {
    const totalSpend = r.total_ad_spend || ((meta.find((m: any) => m.month === (r.month?.length === 7 ? r.month : ''))?.spend || 0) + (google.find((g: any) => g.month === (r.month?.length === 7 ? r.month : ''))?.spend || 0))
    const m = meta.find((m: any) => m.month === r.month)
    const g = google.find((g: any) => g.month === r.month)
    const checkoutGross = r.checkout_gross ?? r.gross ?? 0
    const checkoutNet = r.checkout_net ?? r.net ?? checkoutGross
    const refunds = r.refunds || 0
    return {
      month: (r.month || '').slice(2),
      fullMonth: r.month || '',
      roas_gross: totalSpend > 0 ? checkoutGross / totalSpend : 0,
      roas_net: totalSpend > 0 ? (checkoutNet - refunds) / totalSpend : 0,
      meta_cpa: m && m.purchases > 0 ? (m.spend || 0) / m.purchases : 0,
      google_cpa: g && g.conversions > 0 ? (g.spend || 0) / g.conversions : 0,
      revenue_gross: checkoutGross,
      revenue_net: checkoutNet,
      spend: totalSpend,
      profit: checkoutGross - totalSpend,
      profit_net: checkoutNet - refunds - totalSpend,
      refunds,
      refund_rate: checkoutGross > 0 ? (refunds / checkoutGross * 100) : 0,
    }
  }).filter((d: any) => d.spend > 0)

  // 2024 vs 2025 comparison
  const y2024 = roasData.filter(d => d.fullMonth.startsWith('2024'))
  const y2025 = roasData.filter(d => d.fullMonth.startsWith('2025'))
  const comparisonData = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, '0')
    const d24 = y2024.find(d => d.fullMonth.endsWith(`-${mm}`))
    const d25 = y2025.find(d => d.fullMonth.endsWith(`-${mm}`))
    return {
      month: mm,
      roas_2024: d24?.roas_gross || 0,
      roas_2025: d25?.roas_gross || 0,
      revenue_2024: d24?.revenue_gross || 0,
      revenue_2025: d25?.revenue_gross || 0,
      spend_2024: d24?.spend || 0,
      spend_2025: d25?.spend || 0,
    }
  }).filter(d => d.roas_2024 > 0 || d.roas_2025 > 0)

  const totalRevenue = roasData.reduce((s, d) => s + d.revenue_gross, 0)
  const totalSpend = roasData.reduce((s, d) => s + d.spend, 0)
  const unifiedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Unified ROAS KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400 flex items-center">ROAS Unificado<VerifiedBadge /></div>
          <div className={`text-lg sm:text-2xl font-bold ${unifiedROAS >= 5 ? 'text-emerald-400' : unifiedROAS >= 2 ? 'text-amber-400' : 'text-red-400'}`}>{unifiedROAS.toFixed(2)}x</div>
          <div className="text-[9px] text-slate-500">Receita Guru / (Meta + Google)</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Receita Verificada</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">R$ {(totalRevenue / 1e6).toFixed(2).replace('.', ',')}M</div>
          <div className="text-[9px] text-slate-500">Guru Digital (unica fonte)</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Investido</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">R$ {(totalSpend / 1e6).toFixed(2).replace('.', ',')}M</div>
          <div className="text-[9px] text-slate-500">Meta + Google Ads</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Lucro (Receita - Ads)</div>
          <div className={`text-lg sm:text-2xl font-bold ${totalRevenue - totalSpend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {((totalRevenue - totalSpend) / 1e6).toFixed(2).replace('.', ',')}M</div>
          <div className="text-[9px] text-slate-500">Antes de reembolsos</div>
        </div>
      </div>

      {/* Verified ROAS: Gross vs Net */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 flex items-center">ROAS Mensal — Bruto vs Liquido<VerifiedBadge /><SourceBadge src="Guru / Meta+Google" /></h3>
        <p className="text-[9px] sm:text-xs text-slate-400 mb-3">ROAS Bruto = Checkout Gross / Ad Spend | ROAS Liquido = (Net - Reembolsos) / Ad Spend</p>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(1)}x`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="roas_gross" name="ROAS Bruto (Guru)" stroke="#10b981" strokeWidth={3} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="roas_net" name="ROAS Liquido" stroke="#06b6d4" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line yAxisId="right" type="monotone" dataKey="refund_rate" name="% Reembolso" stroke="#ef4444" dot={false} strokeDasharray="2 2" strokeWidth={1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CPA Comparison */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CPA: Meta vs Google<SourceBadge src="Meta + Google" /></h3>
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

      {/* Verified Revenue vs Spend (single chart, no CRM) */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 flex items-center">Receita vs Investimento Mensal<VerifiedBadge /></h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue_gross" name="Receita Bruta (Guru)" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="spend" name="Investimento Ads" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Area type="monotone" dataKey="profit" name="Lucro Bruto" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2024 vs 2025 Side-by-Side */}
      {comparisonData.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-indigo-500/30 p-3 sm:p-5">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 flex items-center">2024 vs 2025 — ROAS Comparativo<VerifiedBadge /></h3>
          <p className="text-[9px] sm:text-xs text-slate-400 mb-3">Mesmo dataset BigQuery, mesmo calculo: Receita Guru / Investimento Ads</p>
          <div className="h-[220px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(1)}x`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="roas_2024" name="ROAS 2024" fill="#8b5cf6" radius={[2, 2, 0, 0]} opacity={0.7} />
                <Bar dataKey="roas_2025" name="ROAS 2025" fill="#10b981" radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto mt-3 -mx-3 sm:mx-0">
            <table className="w-full text-[10px] sm:text-xs min-w-[500px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">Mes</th>
                  <th className="text-right py-1.5 px-2">Receita 2024</th>
                  <th className="text-right py-1.5 px-2">Receita 2025</th>
                  <th className="text-right py-1.5 px-2">Spend 2024</th>
                  <th className="text-right py-1.5 px-2">Spend 2025</th>
                  <th className="text-right py-1.5 px-2">ROAS 2024</th>
                  <th className="text-right py-1.5 px-2">ROAS 2025</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(d => (
                  <tr key={d.month} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-white">{d.month}</td>
                    <td className="py-1 px-2 text-right text-purple-300">{d.revenue_2024 > 0 ? `R$${(d.revenue_2024/1e3).toFixed(0)}K` : '-'}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">{d.revenue_2025 > 0 ? `R$${(d.revenue_2025/1e3).toFixed(0)}K` : '-'}</td>
                    <td className="py-1 px-2 text-right text-purple-300/60">{d.spend_2024 > 0 ? `R$${(d.spend_2024/1e3).toFixed(0)}K` : '-'}</td>
                    <td className="py-1 px-2 text-right text-red-400">{d.spend_2025 > 0 ? `R$${(d.spend_2025/1e3).toFixed(0)}K` : '-'}</td>
                    <td className="py-1 px-2 text-right text-purple-400 font-bold">{d.roas_2024 > 0 ? `${d.roas_2024.toFixed(1)}x` : '-'}</td>
                    <td className={`py-1 px-2 text-right font-bold ${d.roas_2025 > d.roas_2024 ? 'text-emerald-400' : 'text-amber-400'}`}>{d.roas_2025 > 0 ? `${d.roas_2025.toFixed(1)}x` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
