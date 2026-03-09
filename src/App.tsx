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

const tabs = [
  { id: 'receita', label: 'Receita' },
  { id: 'midia', label: 'Midia Paga' },
  { id: 'roas', label: 'ROAS' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'geo', label: 'Geografia' },
  { id: 'crm', label: 'CRM' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'pagamentos', label: 'Pagamentos' },
]

function App() {
  const [activeTab, setActiveTab] = useState('receita')

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                EMR Dashboard
                <span className="text-emerald-400 ml-2 text-lg font-medium">Eu Medico Residente</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {data.kpis.data_range.start} a {data.kpis.data_range.end} | Dados reais consolidados
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Powered by</div>
              <div className="text-sm font-semibold text-blue-400">Maestros da IA</div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <KPICards kpis={data.kpis} />
        <div className="mt-6">
          {activeTab === 'receita' && <RevenueTab data={data.monthly_revenue} />}
          {activeTab === 'midia' && <MediaTab meta={data.meta_monthly} google={data.google_monthly} />}
          {activeTab === 'roas' && <ROASTab meta={data.meta_monthly} google={data.google_monthly} revenue={data.monthly_revenue} />}
          {activeTab === 'produtos' && <ProductsTab data={data.top_products} />}
          {activeTab === 'geo' && <GeoTab data={data.revenue_by_state} />}
          {activeTab === 'crm' && <CRMTab data={data.crm_daily} />}
          {activeTab === 'marketing' && <MarketingTab data={data.marketing_conversions} />}
          {activeTab === 'pagamentos' && <PaymentsTab data={data.payment_methods} />}
        </div>
      </main>

      <footer className="text-center py-6 text-slate-600 text-xs border-t border-slate-800">
        EMR Dashboard v2.0 | Maestros da IA | Dados: Guru Digital, Meta Ads, Google Ads, RD Station
      </footer>
    </div>
  )
}

export default App
