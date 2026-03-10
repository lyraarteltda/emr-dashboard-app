const fmt = (v: number) => {
  if (v >= 1e6) return `R$ ${(v/1e6).toFixed(2).replace('.', ',')}M`
  if (v >= 1e3) return `R$ ${(v/1e3).toFixed(1).replace('.', ',')}K`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
const fmtN = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1).replace('.', ',')}M` : v >= 1e3 ? `${(v/1e3).toFixed(1).replace('.', ',')}K` : v.toLocaleString('pt-BR')

export function KPICards({ kpis, year }: { kpis: any; year?: string }) {
  // REVENUE SOURCE OF TRUTH: Guru Manager (checkout) only — CRM tracks funnel, NOT payments
  const totalRevenue = kpis.total_checkout_gross || 0
  const netRevenue = kpis.total_checkout_net || 0
  const totalSpent = kpis.total_ad_spend || 0
  const roas = totalSpent > 0 ? (totalRevenue / totalSpent) : 0
  const roasNet = totalSpent > 0 ? (netRevenue / totalSpent) : 0
  const refundPct = totalRevenue > 0 ? (kpis.total_refunds / totalRevenue * 100) : 0
  const ticket = kpis.total_transactions > 0 ? totalRevenue / kpis.total_transactions : 0
  const cacLead = kpis.total_leads > 0 ? totalSpent / kpis.total_leads : 0
  const cacDeal = kpis.total_crm_deals_won > 0 ? totalSpent / kpis.total_crm_deals_won : 0
  const profitGross = totalRevenue - totalSpent
  const profitNet = netRevenue - totalSpent - (kpis.total_refunds || 0)

  const cards = [
    { label: 'RECEITA BRUTA', value: fmt(totalRevenue), sub: `Liquida: ${fmt(netRevenue)}`, color: 'bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border-emerald-400/50 text-emerald-300', source: 'Guru Digital (unica fonte de receita)' },
    { label: 'TOTAL INVESTIDO', value: fmt(totalSpent), sub: `Meta: ${fmt(kpis.total_meta_spend || 0)} | Google: ${fmt(kpis.total_google_spend || 0)}`, color: 'bg-gradient-to-br from-blue-500/20 to-red-500/20 border-blue-400/50 text-blue-300', source: 'Meta + Google Ads' },
    { label: 'LUCRO BRUTO', value: fmt(profitGross), sub: `Lucro liq: ${fmt(profitNet)}`, color: profitGross > 0 ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400', source: 'Receita - Investimento' },
    { label: 'ROAS (Bruto)', value: `${roas.toFixed(2)}x`, sub: `ROAS Liq: ${roasNet.toFixed(2)}x`, color: roas >= 5 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : roas >= 2 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400', source: 'Receita Guru / Investimento Ads' },
    { label: 'CRM Deals Won', value: fmtN(kpis.total_crm_deals_won || 0), sub: `${fmtN(kpis.total_leads || 0)} leads no funil`, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', source: 'RD Station CRM (somente funil)' },
    { label: 'CAC por Deal', value: fmt(cacDeal), sub: `CAC/Lead: ${fmt(cacLead)}`, color: 'bg-rose-500/10 border-rose-500/30 text-rose-400', source: 'Investimento / Deals CRM' },
    { label: 'Ticket Medio', value: fmt(ticket), sub: `LTV: ${fmt(kpis.avg_deal_value || ticket)}`, color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', source: 'Guru Digital' },
    { label: 'Transacoes', value: fmtN(kpis.total_transactions || 0), sub: `${fmtN(kpis.total_customers || 0)} clientes`, color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', source: 'Guru Digital' },
    { label: 'Leads', value: fmtN(kpis.total_leads || 0), sub: `${fmtN(kpis.total_subscriptions || 0)} assinaturas`, color: 'bg-pink-500/10 border-pink-500/30 text-pink-400', source: 'RD Marketing' },
    { label: 'Reembolsos', value: fmt(kpis.total_refunds || 0), sub: `${refundPct.toFixed(1)}% da receita bruta`, color: 'bg-red-500/10 border-red-500/30 text-red-400', source: 'Guru Digital' },
    { label: year && year !== 'all' ? `Periodo: ${year}` : 'Todos os Anos', value: kpis.data_range || '2021-2026', sub: 'Fonte unica: Guru Digital', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400', source: '' },
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
