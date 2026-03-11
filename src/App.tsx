import { useState, useMemo, useEffect } from 'react'
import data from './data.json'
import { DateRangePicker } from './components/DateRangePicker'
import { KPICards } from './components/KPICards'
import { RevenueTab } from './components/RevenueTab'
import { MediaTab } from './components/MediaTab'
import { ROASTab } from './components/ROASTab'
import { ProductsTab } from './components/ProductsTab'
import { GeoTab } from './components/GeoTab'
import { CRMTab } from './components/CRMTab'
import { CustomersTab } from './components/CustomersTab'
import { LeadsTab } from './components/LeadsTab'
import { MarketingTab } from './components/MarketingTab'
import { PaymentsTab } from './components/PaymentsTab'
import { OverviewTab } from './components/OverviewTab'
import { DataHealthTab } from './components/DataHealthTab'
import { AttributionTab } from './components/AttributionTab'
import { MRRChurnTab } from './components/MRRChurnTab'
import { DebugTab } from './components/DebugTab'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'receita', label: 'Receita' },
  { id: 'midia', label: 'Midia Paga' },
  { id: 'roas', label: 'ROAS' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'geo', label: 'Geografia' },
  { id: 'crm', label: 'CRM (Funil)' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'leads', label: 'Leads' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'attribution', label: 'Atribuicao' },
  { id: 'mrr', label: 'MRR & Churn' },
  { id: 'datahealth', label: 'Data Health' },
  { id: 'debug', label: 'Debug' },
]

function filterByDateRange(arr: any[], range: { start: string; end: string } | null) {
  if (!range) return arr
  return arr.filter((d: any) => {
    const key = d.date || d.month
    if (!key) return false
    // For monthly keys (YYYY-MM), compare against YYYY-MM portion of range
    if (key.length === 7) {
      const startMonth = range.start.slice(0, 7)
      const endMonth = range.end.slice(0, 7)
      return key >= startMonth && key <= endMonth
    }
    return key >= range.start && key <= range.end
  })
}

// Aggregate daily_revenue into monthly buckets on-the-fly for charts
function groupDailyByMonth(daily: any[]) {
  const months: Record<string, { month: string; gross: number; net: number; refunds: number; chargebacks: number; txns: number }> = {}
  for (const d of daily) {
    const m = d.date.slice(0, 7)
    if (!months[m]) months[m] = { month: m, gross: 0, net: 0, refunds: 0, chargebacks: 0, txns: 0 }
    months[m].gross += d.gross || 0
    months[m].net += d.net || 0
    months[m].refunds += d.refunds || 0
    months[m].chargebacks += d.chargebacks || 0
    months[m].txns += d.txns || 0
  }
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month))
}

async function fetchAPI(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`)
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(() => {
    const today = new Date().toISOString().slice(0, 10)
    const d30 = new Date(); d30.setDate(d30.getDate() - 30)
    return { start: d30.toISOString().slice(0, 10), end: today }
  })
  const minDate = data.daily_revenue?.[0]?.date || '2022-01-01'
  const maxDate = data.daily_revenue?.[data.daily_revenue.length - 1]?.date || '2026-12-31'

  // BigQuery API state
  const [bqHealth, setBqHealth] = useState<any>(null)
  const [bqSyncStatus, setBqSyncStatus] = useState<any>(null)
  const [bqValidation, setBqValidation] = useState<any>(null)
  const [bqAttribution, setBqAttribution] = useState<any>(null)
  const [bqMrr, setBqMrr] = useState<any>(null)
  const [bqChurn, setBqChurn] = useState<any>(null)

  // Fetch BigQuery data on mount
  useEffect(() => {
    fetchAPI('/api/health').then(setBqHealth)
    fetchAPI('/api/sync-status').then(setBqSyncStatus)
    fetchAPI('/api/revenue/validate').then(setBqValidation)
    fetchAPI('/api/attribution').then(setBqAttribution)
    fetchAPI('/api/mrr').then(d => { setBqMrr(d?.mrr || null); setBqChurn(d?.churn || null) })
  }, [])

  const selectedYear = dateRange ? 'all' : 'all'

  const filtered = useMemo(() => ({
    monthly_revenue: filterByDateRange(data.monthly_revenue, dateRange),
    monthly_combined: filterByDateRange(data.monthly_combined, dateRange),
    daily_revenue: filterByDateRange(data.daily_revenue, dateRange),
    meta_monthly: filterByDateRange(data.meta_monthly, dateRange),
    google_monthly: filterByDateRange(data.google_monthly, dateRange),
    crm_daily: filterByDateRange(data.crm_daily, dateRange),
    crm_monthly_won: filterByDateRange(data.crm_monthly_won, dateRange),
    refund_monthly: filterByDateRange(data.refund_details?.monthly || [], dateRange),
    customers_monthly: filterByDateRange(data.customers?.monthly_new || [], dateRange),
    leads_monthly: filterByDateRange(data.leads?.monthly_new || [], dateRange),
    products: !dateRange ? data.top_products : data.top_products,
    states: !dateRange ? data.revenue_by_state : data.revenue_by_state,
    payments: !dateRange ? data.payment_methods : data.payment_methods,
  }), [dateRange])

  // Daily-derived monthly data for charts (only when date range is active)
  const dailyMonthly = useMemo(() => {
    if (!dateRange) return null
    return groupDailyByMonth(filtered.daily_revenue)
  }, [dateRange, filtered.daily_revenue])

  const yearKPIs = useMemo(() => {
    if (!dateRange) return data.overview
    // ALWAYS compute revenue KPIs from daily_revenue for accurate day-level filtering
    const daily = filtered.daily_revenue
    const meta = filtered.meta_monthly
    const google = filtered.google_monthly
    const gross = daily.reduce((s: number, d: any) => s + (d.gross || 0), 0)
    const net = daily.reduce((s: number, d: any) => s + (d.net || 0), 0)
    const refunds = daily.reduce((s: number, d: any) => s + (d.refunds || 0), 0)
    const chargebacks = daily.reduce((s: number, d: any) => s + (d.chargebacks || 0), 0)
    const txns = daily.reduce((s: number, d: any) => s + (d.txns || 0), 0)
    const metaSpend = meta.reduce((s: number, d: any) => s + (d.spend || 0), 0)
    const googleSpend = google.reduce((s: number, d: any) => s + (d.spend || 0), 0)
    const totalSpend = metaSpend + googleSpend
    const customers = filtered.customers_monthly.reduce((s: number, d: any) => s + (d.count || d.new_customers || 0), 0)
    const leads = filtered.leads_monthly.reduce((s: number, d: any) => s + (d.count || d.new_leads || 0), 0)
    return {
      total_checkout_gross: gross,
      total_checkout_net: net,
      total_crm_deals_won: data.overview?.total_crm_deals_won || 0,
      total_refunds: refunds,
      total_chargebacks: chargebacks,
      total_transactions: txns,
      total_customers: customers || data.overview?.total_customers || 0,
      total_leads: leads || data.overview?.total_leads || 0,
      total_subscriptions: data.overview?.total_subscriptions || 0,
      total_meta_spend: metaSpend,
      total_google_spend: googleSpend,
      total_ad_spend: totalSpend,
      total_meta_campaigns: data.overview?.total_meta_campaigns || 0,
      total_google_campaigns: data.overview?.total_google_campaigns || 0,
      total_products: data.overview?.total_products || 0,
      day_count: daily.length,
      data_range: `${dateRange.start} a ${dateRange.end} (${daily.length} dias)`,
      roas_checkout: totalSpend > 0 ? gross / totalSpend : 0,
      cac_per_lead: leads > 0 ? totalSpend / leads : 0,
      cac_per_deal: 0,
      avg_deal_value: txns > 0 ? gross / txns : 0,
      ltv_checkout: txns > 0 ? gross / txns : 0,
    }
  }, [dateRange, filtered])

  // Revenue validation warning
  const validationMismatch = bqValidation?.status === 'mismatch'

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
                Receita: Guru Digital (unica fonte) | CRM: Funil apenas | BigQuery: Single Source of Truth
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {bqHealth?.connected && (
                <span className="text-[9px] sm:text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">BQ Connected</span>
              )}
              {validationMismatch && (
                <span className="text-[9px] sm:text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 animate-pulse">Data Mismatch</span>
              )}
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                minDate={minDate}
                maxDate={maxDate}
              />
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
        {dateRange && (
          <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs sm:text-sm flex items-center justify-between">
            <span>Filtrando: <strong>{dateRange.start}</strong> a <strong>{dateRange.end}</strong> ({filtered.daily_revenue.length} dias com dados)</span>
            <button onClick={() => setDateRange(null)} className="text-slate-400 hover:text-white text-xs underline">Limpar</button>
          </div>
        )}
        {validationMismatch && (
          <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs sm:text-sm">
            <strong>Data Warning:</strong> SUM(guru_revenue) no BigQuery ({bqValidation?.bq_total}) difere do dashboard ({bqValidation?.dashboard_total}).
            Delta: {bqValidation?.delta} ({bqValidation?.delta_pct}%). Verifique a tab Data Health.
          </div>
        )}
        <KPICards kpis={yearKPIs} year={selectedYear} />
        <div className="mt-4 sm:mt-6">
          {dateRange && ['produtos', 'geo', 'clientes', 'leads', 'marketing', 'pagamentos'].includes(activeTab) && (
            <div className="mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] sm:text-xs">
              Dados mensais — filtro diario nao disponivel para esta aba. Mostrando meses completos dentro do periodo selecionado.
            </div>
          )}
          {activeTab === 'overview' && <OverviewTab yearlySummary={data.yearly_summary} overview={data.overview} selectedYear={selectedYear} monthlyCombined={filtered.monthly_combined} cohort={data.cohort} ltv={data.ltv} dataSources={data.data_sources} dataCoverage={data.data_coverage} crmDealAnalysis={data.crm_deal_analysis} dailyMonthlyRevenue={dailyMonthly} />}
          {activeTab === 'receita' && <RevenueTab monthly={dailyMonthly || filtered.monthly_revenue} daily={filtered.daily_revenue} crmMonthly={filtered.crm_monthly_won} />}
          {activeTab === 'midia' && <MediaTab meta={filtered.meta_monthly} google={filtered.google_monthly} metaStats={data.meta_campaigns} googleCampaigns={data.google_campaigns} />}
          {activeTab === 'roas' && <ROASTab meta={filtered.meta_monthly} google={filtered.google_monthly} revenue={dailyMonthly || filtered.monthly_revenue} monthlyCombined={filtered.monthly_combined} />}
          {activeTab === 'produtos' && <ProductsTab data={filtered.products} utmSources={data.utm_sources} utmCampaigns={data.utm_campaigns} />}
          {activeTab === 'geo' && <GeoTab data={filtered.states} />}
          {activeTab === 'crm' && <CRMTab daily={filtered.crm_daily} details={data.crm_details} />}
          {activeTab === 'clientes' && <CustomersTab data={{ ...data.customers, monthly_new: filtered.customers_monthly }} />}
          {activeTab === 'leads' && <LeadsTab data={{ ...data.leads, monthly_new: filtered.leads_monthly }} />}
          {activeTab === 'marketing' && <MarketingTab conversions={data.marketing_conversions} campaigns={data.meta_campaigns} />}
          {activeTab === 'pagamentos' && <PaymentsTab methods={filtered.payments} installments={data.installments} />}
          {activeTab === 'attribution' && <AttributionTab attribution={bqAttribution} />}
          {activeTab === 'mrr' && <MRRChurnTab mrr={bqMrr} churn={bqChurn} />}
          {activeTab === 'datahealth' && <DataHealthTab health={bqHealth} syncStatus={bqSyncStatus} validation={bqValidation} />}
          {activeTab === 'debug' && <DebugTab data={data} />}
        </div>
      </main>

      <footer className="text-center py-4 text-slate-600 text-[10px] sm:text-xs border-t border-slate-800 px-4">
        EMR Dashboard v6.0 | Maestros da IA | Revenue: Guru Digital (unica fonte) | CRM: Funil | BigQuery SSOT
      </footer>
    </div>
  )
}

export default App
