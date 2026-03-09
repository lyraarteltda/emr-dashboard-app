import { useState } from 'react'
import data from './data.json'
import { KPICards } from './components/KPICards'
import { RevenueTab } from './components/RevenueTab'
import { MediaTab } from './components/MediaTab'
import { ROASTab } from './components/ROASTab'
import { ProductsTab } from './components/ProductsTab'
import { GeoTab } from './components/GeoTab'
import { CRMTab } from './components/CRMTab'
import { MarketingTab } from './components/MarketingTab'
import { PaymentsTab } from './components/PaymentsTab'
import { CustomersTab } from './components/CustomersTab'
import { LeadsTab } from './components/LeadsTab'
import { SubscriptionsTab } from './components/SubscriptionsTab'

const tabs = [
  { id: 'receita', label: 'Receita', icon: '💰' },
  { id: 'midia', label: 'Midia Paga', icon: '📢' },
  { id: 'roas', label: 'ROAS', icon: '📈' },
  { id: 'produtos', label: 'Produtos', icon: '📦' },
  { id: 'geo', label: 'Geografia', icon: '🗺' },
  { id: 'crm', label: 'CRM', icon: '🤝' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'leads', label: 'Leads', icon: '🎯' },
  { id: 'assinaturas', label: 'Assinaturas', icon: '🔄' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'pagamentos', label: 'Pagamentos', icon: '💳' },
]

function App() {
  const [activeTab, setActiveTab] = useState('receita')

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                EMR Dashboard
                <span className="text-emerald-400 ml-1 sm:ml-2 text-sm sm:text-lg font-medium">Eu Medico Residente</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                {data.kpis.data_range.start} a {data.kpis.data_range.end} | 5 fontes de dados | 30 CSVs
              </p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-[10px] sm:text-xs text-slate-500">Powered by</div>
              <div className="text-xs sm:text-sm font-semibold text-blue-400">Maestros da IA</div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <KPICards kpis={data.kpis} />
        <div className="mt-4 sm:mt-6">
          {activeTab === 'receita' && <RevenueTab monthly={data.monthly_revenue} daily={data.daily_revenue} />}
          {activeTab === 'midia' && <MediaTab meta={data.meta_monthly} google={data.google_monthly} metaStats={data.meta_campaign_stats} googleCampaigns={data.google_campaigns} />}
          {activeTab === 'roas' && <ROASTab meta={data.meta_monthly} google={data.google_monthly} revenue={data.monthly_revenue} />}
          {activeTab === 'produtos' && <ProductsTab data={data.top_products} utmSources={data.utm_sources} utmCampaigns={data.utm_campaigns} />}
          {activeTab === 'geo' && <GeoTab data={data.revenue_by_state} />}
          {activeTab === 'crm' && <CRMTab daily={data.crm_daily} details={data.crm_details} />}
          {activeTab === 'clientes' && <CustomersTab data={data.customers} />}
          {activeTab === 'leads' && <LeadsTab data={data.leads} />}
          {activeTab === 'assinaturas' && <SubscriptionsTab data={data.subscriptions} refunds={data.refund_details} />}
          {activeTab === 'marketing' && <MarketingTab conversions={data.marketing_conversions} campaigns={data.meta_campaigns} />}
          {activeTab === 'pagamentos' && <PaymentsTab methods={data.payment_methods} installments={data.installments} />}
        </div>
      </main>

      <footer className="text-center py-4 sm:py-6 text-slate-600 text-[10px] sm:text-xs border-t border-slate-800 px-4">
        EMR Dashboard v3.0 | Maestros da IA | Guru Digital + Meta Ads + Google Ads + RD Station CRM + RD Station Marketing
      </footer>
    </div>
  )
}

export default App
