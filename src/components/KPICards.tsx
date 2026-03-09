const fmt = (v: number) => {
  if (v >= 1e6) return `R$ ${(v/1e6).toFixed(2).replace('.', ',')}M`
  if (v >= 1e3) return `R$ ${(v/1e3).toFixed(1).replace('.', ',')}K`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
const fmtN = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1).replace('.', ',')}M` : v >= 1e3 ? `${(v/1e3).toFixed(1).replace('.', ',')}K` : v.toLocaleString('pt-BR')

export function KPICards({ kpis, year }: { kpis: any; year?: string }) {
  const roasCRM = kpis.total_ad_spend > 0 ? (kpis.total_crm_won_value / kpis.total_ad_spend) : 0
  const roasCheckout = kpis.total_ad_spend > 0 ? (kpis.total_checkout_gross / kpis.total_ad_spend) : 0
  const refundPct = kpis.total_checkout_gross > 0 ? (kpis.total_refunds / kpis.total_checkout_gross * 100) : 0
  const ticket = kpis.total_transactions > 0 ? kpis.total_checkout_gross / kpis.total_transactions : 0
  const cacLead = kpis.total_leads > 0 ? kpis.total_ad_spend / kpis.total_leads : 0
  const cacDeal = kpis.total_crm_deals_won > 0 ? kpis.total_ad_spend / kpis.total_crm_deals_won : 0

  const totalRevenue = (kpis.total_checkout_gross || 0) + (kpis.total_crm_won_value || 0)
  const totalSpent = kpis.total_ad_spend || 0

  const cards = [
    { label: 'RECEITA TOTAL', value: fmt(totalRevenue), sub: `Checkout + CRM Won`, color: 'bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border-emerald-400/50 text-emerald-300', source: 'Guru + CRM' },
    { label: 'TOTAL INVESTIDO', value: fmt(totalSpent), sub: `Meta + Google Ads`, color: 'bg-gradient-to-br from-blue-500/20 to-red-500/20 border-blue-400/50 text-blue-300', source: 'Meta + Google' },
    { label: 'CRM Won Value', value: fmt(kpis.total_crm_won_value || 0), sub: `${fmtN(kpis.total_crm_deals_won || 0)} deals fechados`, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', source: 'RD Station CRM' },
    { label: 'Checkout Revenue', value: fmt(kpis.total_checkout_gross || 0), sub: `Liq: ${fmt(kpis.total_checkout_net || 0)}`, color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', source: 'Guru Digital' },
    { label: 'Investimento Ads', value: fmt(kpis.total_ad_spend || 0), sub: `Meta: ${fmt(kpis.total_meta_spend || 0)} | Google: ${fmt(kpis.total_google_spend || 0)}`, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', source: 'Meta + Google' },
    { label: 'ROAS Real (CRM)', value: `${roasCRM.toFixed(2)}x`, sub: `Checkout: ${roasCheckout.toFixed(3)}x`, color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', source: 'CRM / Ads' },
    { label: 'CAC por Deal', value: fmt(cacDeal), sub: `CAC/Lead: ${fmt(cacLead)}`, color: 'bg-rose-500/10 border-rose-500/30 text-rose-400', source: 'Ads / CRM+RD' },
    { label: 'LTV (Avg Deal)', value: fmt(kpis.avg_deal_value || kpis.ltv_checkout || 0), sub: `Ticket checkout: ${fmt(ticket)}`, color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', source: 'CRM + Guru' },
    { label: 'Transacoes', value: fmtN(kpis.total_transactions || 0), sub: `${fmtN(kpis.total_customers || 0)} clientes`, color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', source: 'Guru Digital' },
    { label: 'Leads', value: fmtN(kpis.total_leads || 0), sub: `${fmtN(kpis.total_subscriptions || 0)} assinaturas`, color: 'bg-pink-500/10 border-pink-500/30 text-pink-400', source: 'RD Marketing' },
    { label: 'Reembolsos', value: fmt(kpis.total_refunds || 0), sub: `${refundPct.toFixed(1)}% do checkout`, color: 'bg-red-500/10 border-red-500/30 text-red-400', source: 'Guru Digital' },
    { label: year && year !== 'all' ? `Periodo: ${year}` : 'Todos os Anos', value: kpis.data_range || '2021-2026', sub: '5 fontes de dados', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400', source: '' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {cards.map(c => (
        <div key={c.label} className={`${c.color} border rounded-lg sm:rounded-xl p-2.5 sm:p-4 relative group`}>
          <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 truncate">{c.label}</div>
          <div className="text-base sm:text-xl font-bold truncate">{c.value}</div>
          <div className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 truncate">{c.sub}</div>
          {c.source && (
            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-[8px] sm:text-[9px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap z-10">
              {c.source}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
