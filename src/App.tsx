import { useState, useMemo } from 'react'
import data from './data.json'
import { KPICards } from './components/KPICards'
import { RevenueTab } from './components/RevenueTab'
import { MediaTab } from './components/MediaTab'
import { ROASTab } from './components/ROASTab'
import { ProductsTab } from './components/ProductsTab'
import { GeoTab } from './components/GeoTab'
import { CRMTab } from './components/CRMTab'
import { CustomersTab } from './components/CustomersTab'
import { LeadsTab } from './components/LeadsTab'
import { SubscriptionsTab } from './components/SubscriptionsTab'
import { MarketingTab } from './components/MarketingTab'
import { PaymentsTab } from './components/PaymentsTab'
import { OverviewTab } from './components/OverviewTab'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'receita', label: 'Receita' },
  { id: 'midia', label: 'Midia Paga' },
  { id: 'roas', label: 'ROAS' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'geo', label: 'Geografia' },
  { id: 'crm', label: 'CRM' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'leads', label: 'Leads' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'pagamentos', label: 'Pagamentos' },
]

function filterByYear(arr: any[], year: string) {
  if (year === 'all') return arr
  return arr.filter((d: any) => d.year === year || d.month?.startsWith(year) || d.date?.startsWith(year))
}

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedYear, setSelectedYear] = useState('all')
  const years = ['all', ...(data.years || [])]

  const filtered = useMemo(() => ({
    monthly_revenue: filterByYear(data.monthly_revenue, selectedYear),
    monthly_combined: filterByYear(data.monthly_combined, selectedYear),
    daily_revenue: filterByYear(data.daily_revenue, selectedYear),
    meta_monthly: filterByYear(data.meta_monthly, selectedYear),
    google_monthly: filterByYear(data.google_monthly, selectedYear),
    crm_daily: filterByYear(data.crm_daily, selectedYear),
    crm_monthly_won: filterByYear(data.crm_monthly_won, selectedYear),
    refund_monthly: filterByYear(data.refund_details?.monthly || [], selectedYear),
    customers_monthly: filterByYear(data.customers?.monthly_new || [], selectedYear),
    leads_monthly: filterByYear(data.leads?.monthly_new || [], selectedYear),
    subs_monthly: filterByYear(data.subscriptions?.monthly_new || [], selectedYear),
    products: selectedYear === 'all' ? data.top_products : (data.products_by_year?.[selectedYear] || []),
    states: selectedYear === 'all' ? data.revenue_by_state : (data.state_by_year?.[selectedYear] || []),
    payments: selectedYear === 'all' ? data.payment_methods : (data.payments_by_year?.[selectedYear] || []),
  }), [selectedYear])

  const yearKPIs = useMemo(() => {
    if (selectedYear === 'all') return data.overview
    const ys = data.yearly_summary?.find((y: any) => y.year === selectedYear)
    if (!ys) return data.overview
    return {
      total_checkout_gross: ys.checkout_gross,
      total_checkout_net: ys.checkout_net,
      total_crm_won_value: ys.crm_won_value,
      total_crm_deals_won: ys.crm_deals_won,
      total_refunds: ys.refunds,
      total_chargebacks: ys.chargebacks,
      total_transactions: ys.txns,
      total_customers: ys.customers_new,
      total_leads: ys.leads_new,
      total_subscriptions: ys.subscriptions_new,
      total_meta_spend: ys.meta_spend,
      total_google_spend: ys.google_spend,
      total_ad_spend: ys.total_ad_spend,
      total_meta_campaigns: data.overview?.total_meta_campaigns || 0,
      total_google_campaigns: data.overview?.total_google_campaigns || 0,
      total_products: data.overview?.total_products || 0,
      data_range: data.overview?.data_range,
      roas_checkout: ys.roas_checkout,
      roas_crm: ys.roas_crm,
      cac_per_lead: ys.cac_per_lead,
      cac_per_deal: ys.cac_per_deal,
      avg_deal_value: ys.avg_deal_value,
      ltv_checkout: ys.ticket_checkout,
    }
  }, [selectedYear])

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                EMR Dashboard
                <span className="text-emerald-400 ml-1 sm:ml-2 text-sm sm:text-lg font-medium">Eu Medico Residente</span>
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-sm mt-0.5">
                5 fontes | 30 CSVs | ~2M registros | Hover nos KPIs para ver a fonte
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y === 'all' ? 'Todos os Anos' : y}</option>
                ))}
              </select>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {selectedYear !== 'all' && (
          <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs sm:text-sm">
            Filtrando: <strong>{selectedYear}</strong> — mostrando apenas dados deste ano
          </div>
        )}
        <KPICards kpis={yearKPIs} year={selectedYear} />
        <div className="mt-4 sm:mt-6">
          {activeTab === 'overview' && <OverviewTab yearlySummary={data.yearly_summary} overview={data.overview} selectedYear={selectedYear} monthlyCombined={filtered.monthly_combined} cohort={data.cohort} ltv={data.ltv} dataSources={data.data_sources} />}
          {activeTab === 'receita' && <RevenueTab monthly={filtered.monthly_revenue} daily={filtered.daily_revenue} crmMonthly={filtered.crm_monthly_won} />}
          {activeTab === 'midia' && <MediaTab meta={filtered.meta_monthly} google={filtered.google_monthly} metaStats={data.meta_campaigns} googleCampaigns={data.google_campaigns} />}
          {activeTab === 'roas' && <ROASTab meta={filtered.meta_monthly} google={filtered.google_monthly} revenue={filtered.monthly_revenue} crmMonthly={filtered.crm_monthly_won} monthlyCombined={filtered.monthly_combined} />}
          {activeTab === 'produtos' && <ProductsTab data={filtered.products} utmSources={data.utm_sources} utmCampaigns={data.utm_campaigns} />}
          {activeTab === 'geo' && <GeoTab data={filtered.states} />}
          {activeTab === 'crm' && <CRMTab daily={filtered.crm_daily} details={data.crm_details} />}
          {activeTab === 'clientes' && <CustomersTab data={{ ...data.customers, monthly_new: filtered.customers_monthly }} />}
          {activeTab === 'leads' && <LeadsTab data={{ ...data.leads, monthly_new: filtered.leads_monthly }} />}
          {activeTab === 'assinaturas' && <SubscriptionsTab data={{ ...data.subscriptions, monthly_new: filtered.subs_monthly }} refunds={{ ...data.refund_details, monthly: filtered.refund_monthly }} />}
          {activeTab === 'marketing' && <MarketingTab conversions={data.marketing_conversions} campaigns={data.meta_campaigns} />}
          {activeTab === 'pagamentos' && <PaymentsTab methods={filtered.payments} installments={data.installments} />}
        </div>
      </main>

      <footer className="text-center py-4 text-slate-600 text-[10px] sm:text-xs border-t border-slate-800 px-4">
        EMR Dashboard v5.0 | Maestros da IA | Dual-Revenue (CRM + Checkout) | Guru + Meta + Google + RD Station CRM + RD Station Marketing
      </footer>
    </div>
  )
}

export default App
