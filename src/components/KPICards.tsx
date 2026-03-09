const fmt = (v: number) => v >= 1e6 ? `R$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `R$${(v/1e3).toFixed(1)}K` : `R$${v.toFixed(0)}`
const fmtN = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toFixed(0)

type KPIs = {
  total_gross_revenue: number
  total_ad_spend: number
  total_transactions: number
  total_crm_won_value: number
  total_crm_deals_won: number
  roas: number
  total_meta_campaigns: number
  total_products: number
  total_refunds: number
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  const cards = [
    { label: 'Receita Bruta', value: fmt(kpis.total_gross_revenue), color: 'emerald' },
    { label: 'Investimento Ads', value: fmt(kpis.total_ad_spend), color: 'blue' },
    { label: 'CRM Won', value: fmt(kpis.total_crm_won_value), color: 'purple' },
    { label: 'Transacoes', value: fmtN(kpis.total_transactions), color: 'amber' },
    { label: 'Deals Won', value: fmtN(kpis.total_crm_deals_won), color: 'cyan' },
    { label: 'Campanhas Meta', value: fmtN(kpis.total_meta_campaigns), color: 'pink' },
    { label: 'Produtos', value: fmtN(kpis.total_products), color: 'orange' },
    { label: 'Reembolsos', value: fmt(kpis.total_refunds), color: 'red' },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/20 border-amber-500/30 text-amber-400',
    cyan: 'from-cyan-500/20 border-cyan-500/30 text-cyan-400',
    pink: 'from-pink-500/20 border-pink-500/30 text-pink-400',
    orange: 'from-orange-500/20 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 border-red-500/30 text-red-400',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`bg-gradient-to-br ${colorMap[c.color]} to-transparent border rounded-xl p-4`}>
          <div className="text-xs text-slate-400 mb-1">{c.label}</div>
          <div className={`text-xl font-bold ${colorMap[c.color].split(' ').pop()}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
