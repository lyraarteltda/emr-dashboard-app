const fmt = (v: number) => v >= 1e6 ? `R$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `R$${(v/1e3).toFixed(1)}K` : `R$${v.toFixed(0)}`
const fmtN = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toLocaleString('pt-BR')

export function KPICards({ kpis }: { kpis: any }) {
  const cards = [
    { label: 'Receita Bruta', value: fmt(kpis.total_gross_revenue), sub: `Liq: ${fmt(kpis.total_net_revenue)}`, color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    { label: 'Investimento Ads', value: fmt(kpis.total_ad_spend), sub: `Meta: ${fmt(kpis.total_meta_spend)} | Google: ${fmt(kpis.total_google_spend)}`, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    { label: 'CRM Won', value: fmt(kpis.total_crm_won_value), sub: `${fmtN(kpis.total_crm_deals_won)} deals`, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
    { label: 'Transacoes', value: fmtN(kpis.total_transactions), sub: `Ticket: ${fmt(kpis.total_gross_revenue / kpis.total_transactions)}`, color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
    { label: 'Clientes', value: fmtN(kpis.total_customers || 0), sub: `${fmtN(kpis.total_products)} produtos`, color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
    { label: 'Leads', value: fmtN(kpis.total_leads || 0), sub: 'RD Station Marketing', color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
    { label: 'Assinaturas', value: fmtN(kpis.total_subscriptions || 0), sub: 'Guru Digital', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    { label: 'Reembolsos', value: fmt(kpis.total_refunds), sub: `${(kpis.total_refunds / kpis.total_gross_revenue * 100).toFixed(1)}% da receita`, color: 'bg-red-500/10 border-red-500/30 text-red-400' },
    { label: 'Campanhas Meta', value: fmtN(kpis.total_meta_campaigns), sub: `ROAS geral: ${kpis.roas.toFixed(2)}x`, color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
    { label: 'Emails Enviados', value: fmtN(kpis.total_emails_sent || 0), sub: 'RD Station', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {cards.map(c => (
        <div key={c.label} className={`${c.color} border rounded-lg sm:rounded-xl p-2.5 sm:p-4`}>
          <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 truncate">{c.label}</div>
          <div className="text-base sm:text-xl font-bold truncate">{c.value}</div>
          <div className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 truncate">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
