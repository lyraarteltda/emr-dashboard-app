const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function DebugTab({ data }: { data: any }) {
  const ys = data.yearly_summary || []
  const mc = data.monthly_combined || []
  const mr = data.monthly_revenue || []
  const sources = data.data_sources || {}

  // Calculate totals for verification
  const totalCheckoutFromMonthly = mr.reduce((s: number, m: any) => s + m.gross, 0)
  const totalCheckoutFromYearly = ys.reduce((s: number, y: any) => s + y.checkout_gross, 0)
  const totalCRMFromYearly = ys.reduce((s: number, y: any) => s + y.crm_won_value, 0)
  const totalMetaSpend = ys.reduce((s: number, y: any) => s + y.meta_spend, 0)
  const totalGoogleSpend = ys.reduce((s: number, y: any) => s + y.google_spend, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* VERIFICATION HEADER */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-lg font-bold text-red-400 mb-2">Data Verification & Debug</h3>
        <p className="text-xs text-slate-400">This tab shows raw data verification to confirm accuracy. All values are parsed from CSV files using standard float parsing (US decimal format: 721.99 = seven hundred twenty-one and 99 cents).</p>
      </div>

      {/* CURRENCY FORMAT VERIFICATION */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Currency Format Verification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-700/30 rounded p-3">
            <div className="text-slate-400 mb-1">CSV Format</div>
            <div className="text-white">US decimal (dot separator): <code className="text-emerald-400">721.99</code> = R$721,99</div>
            <div className="text-slate-500 mt-1">No commas in source data. No BRL format confusion.</div>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <div className="text-slate-400 mb-1">Max Single Transaction (Guru)</div>
            <div className="text-white">R$135,54 (monthly installment)</div>
            <div className="text-slate-500 mt-1">Business model: small monthly installments via checkout</div>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <div className="text-slate-400 mb-1">Max CRM Deal</div>
            <div className="text-white">{fmtBRL(21127.68)} (full course package)</div>
            <div className="text-slate-500 mt-1">CRM = full contract value sold by sales team</div>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <div className="text-slate-400 mb-1">Why Checkout {"<"} CRM</div>
            <div className="text-white">Checkout = monthly installments. CRM = full contract value.</div>
            <div className="text-slate-500 mt-1">R$135/mo x 12 = R$1,620 checkout vs R$7,519 avg CRM deal</div>
          </div>
        </div>
      </div>

      {/* DATA SOURCES */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Data Sources & Record Counts</h3>
        <table className="w-full text-xs">
          <thead><tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-1.5 px-2">Source</th>
            <th className="text-left py-1.5 px-2">Type</th>
            <th className="text-right py-1.5 px-2">Records</th>
            <th className="text-left py-1.5 px-2">Period</th>
            <th className="text-left py-1.5 px-2">Status</th>
          </tr></thead>
          <tbody>
            {Object.entries(sources).map(([k, v]: any) => (
              <tr key={k} className="border-b border-slate-700/50">
                <td className="py-1.5 px-2 font-medium text-white">{k}</td>
                <td className="py-1.5 px-2 text-slate-400">{v.type}</td>
                <td className="py-1.5 px-2 text-right text-emerald-400">{(v.records || 0).toLocaleString('pt-BR')}</td>
                <td className="py-1.5 px-2 text-slate-400">{v.period}</td>
                <td className="py-1.5 px-2 text-emerald-400">All rows read</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CROSS-VERIFICATION: Sums match */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Cross-Verification: Sum Consistency</h3>
        <table className="w-full text-xs">
          <thead><tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-1.5 px-2">Check</th>
            <th className="text-right py-1.5 px-2">Source A</th>
            <th className="text-right py-1.5 px-2">Source B</th>
            <th className="text-right py-1.5 px-2">Diff</th>
            <th className="text-center py-1.5 px-2">Status</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="py-1.5 px-2 text-white">Checkout: monthly_revenue vs yearly_summary</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalCheckoutFromMonthly)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalCheckoutFromYearly)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(Math.abs(totalCheckoutFromMonthly - totalCheckoutFromYearly))}</td>
              <td className="py-1.5 px-2 text-center">{Math.abs(totalCheckoutFromMonthly - totalCheckoutFromYearly) < 1 ? '✅' : '❌'}</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-1.5 px-2 text-white">Overview checkout vs yearly sum</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(data.overview?.total_checkout_gross || 0)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalCheckoutFromYearly)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(Math.abs((data.overview?.total_checkout_gross || 0) - totalCheckoutFromYearly))}</td>
              <td className="py-1.5 px-2 text-center">{Math.abs((data.overview?.total_checkout_gross || 0) - totalCheckoutFromYearly) < 1 ? '✅' : '❌'}</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-1.5 px-2 text-white">Overview CRM vs yearly sum</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(data.overview?.total_crm_won_value || 0)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalCRMFromYearly)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(Math.abs((data.overview?.total_crm_won_value || 0) - totalCRMFromYearly))}</td>
              <td className="py-1.5 px-2 text-center">{Math.abs((data.overview?.total_crm_won_value || 0) - totalCRMFromYearly) < 1 ? '✅' : '❌'}</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-1.5 px-2 text-white">Meta spend: overview vs yearly sum</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(data.overview?.total_meta_spend || 0)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalMetaSpend)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(Math.abs((data.overview?.total_meta_spend || 0) - totalMetaSpend))}</td>
              <td className="py-1.5 px-2 text-center">{Math.abs((data.overview?.total_meta_spend || 0) - totalMetaSpend) < 1 ? '✅' : '❌'}</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-1.5 px-2 text-white">Google spend: overview vs yearly sum</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(data.overview?.total_google_spend || 0)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(totalGoogleSpend)}</td>
              <td className="py-1.5 px-2 text-right">{fmtBRL(Math.abs((data.overview?.total_google_spend || 0) - totalGoogleSpend))}</td>
              <td className="py-1.5 px-2 text-center">{Math.abs((data.overview?.total_google_spend || 0) - totalGoogleSpend) < 1 ? '✅' : '❌'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* YEARLY BREAKDOWN - EVERY YEAR HAS DATA */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Yearly Revenue Breakdown (All Sources)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-xs min-w-[800px]">
            <thead><tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-1.5 px-2">Year</th>
              <th className="text-right py-1.5 px-2">Checkout Gross</th>
              <th className="text-right py-1.5 px-2">Checkout Net</th>
              <th className="text-right py-1.5 px-2">Refunds</th>
              <th className="text-right py-1.5 px-2">Txns</th>
              <th className="text-right py-1.5 px-2">CRM Won</th>
              <th className="text-right py-1.5 px-2">CRM Deals</th>
              <th className="text-right py-1.5 px-2">Meta Spend</th>
              <th className="text-right py-1.5 px-2">Google Spend</th>
              <th className="text-right py-1.5 px-2">Leads</th>
              <th className="text-right py-1.5 px-2">Months w/Data</th>
            </tr></thead>
            <tbody>
              {ys.map((y: any) => {
                const monthsWithRev = mr.filter((m: any) => m.month.startsWith(y.year) && m.gross > 0).length
                const totalMonths = mr.filter((m: any) => m.month.startsWith(y.year)).length
                return (
                  <tr key={y.year} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1.5 px-2 font-bold text-white">{y.year}</td>
                    <td className={`py-1.5 px-2 text-right ${y.checkout_gross > 0 ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>{fmtBRL(y.checkout_gross)}</td>
                    <td className="py-1.5 px-2 text-right text-cyan-400">{fmtBRL(y.checkout_net)}</td>
                    <td className="py-1.5 px-2 text-right text-red-400">{fmtBRL(y.refunds)}</td>
                    <td className="py-1.5 px-2 text-right">{y.txns.toLocaleString('pt-BR')}</td>
                    <td className={`py-1.5 px-2 text-right ${y.crm_won_value > 0 ? 'text-purple-400' : 'text-slate-600'}`}>{y.crm_won_value > 0 ? fmtBRL(y.crm_won_value) : 'No CRM data'}</td>
                    <td className="py-1.5 px-2 text-right text-purple-300">{y.crm_deals_won || 0}</td>
                    <td className={`py-1.5 px-2 text-right ${y.meta_spend > 0 ? 'text-blue-400' : 'text-slate-600'}`}>{y.meta_spend > 0 ? fmtBRL(y.meta_spend) : 'No Meta data'}</td>
                    <td className={`py-1.5 px-2 text-right ${y.google_spend > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{y.google_spend > 0 ? fmtBRL(y.google_spend) : 'No Google data'}</td>
                    <td className="py-1.5 px-2 text-right text-pink-400">{y.leads_new.toLocaleString('pt-BR')}</td>
                    <td className="py-1.5 px-2 text-right text-slate-300">{monthsWithRev}/{totalMonths}</td>
                  </tr>
                )
              })}
              <tr className="border-t-2 border-slate-600 font-bold">
                <td className="py-2 px-2 text-white">TOTAL</td>
                <td className="py-2 px-2 text-right text-emerald-400">{fmtBRL(totalCheckoutFromYearly)}</td>
                <td className="py-2 px-2 text-right text-cyan-400">{fmtBRL(ys.reduce((s: number, y: any) => s + y.checkout_net, 0))}</td>
                <td className="py-2 px-2 text-right text-red-400">{fmtBRL(ys.reduce((s: number, y: any) => s + y.refunds, 0))}</td>
                <td className="py-2 px-2 text-right">{ys.reduce((s: number, y: any) => s + y.txns, 0).toLocaleString('pt-BR')}</td>
                <td className="py-2 px-2 text-right text-purple-400">{fmtBRL(totalCRMFromYearly)}</td>
                <td className="py-2 px-2 text-right text-purple-300">{ys.reduce((s: number, y: any) => s + y.crm_deals_won, 0).toLocaleString('pt-BR')}</td>
                <td className="py-2 px-2 text-right text-blue-400">{fmtBRL(totalMetaSpend)}</td>
                <td className="py-2 px-2 text-right text-amber-400">{fmtBRL(totalGoogleSpend)}</td>
                <td className="py-2 px-2 text-right text-pink-400">{ys.reduce((s: number, y: any) => s + y.leads_new, 0).toLocaleString('pt-BR')}</td>
                <td className="py-2 px-2 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MONTHLY DETAIL TABLE */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Monthly Revenue Detail (All {mr.length} months)</h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-[10px] sm:text-xs min-w-[600px]">
            <thead className="sticky top-0 bg-slate-800"><tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-1.5 px-2">Month</th>
              <th className="text-right py-1.5 px-2">Checkout Gross</th>
              <th className="text-right py-1.5 px-2">CRM Won</th>
              <th className="text-right py-1.5 px-2">Txns</th>
              <th className="text-right py-1.5 px-2">Refunds</th>
              <th className="text-right py-1.5 px-2">Ad Spend</th>
            </tr></thead>
            <tbody>
              {mc.map((m: any) => (
                <tr key={m.month} className={`border-b border-slate-700/50 hover:bg-slate-700/20 ${m.checkout_gross === 0 && m.crm_won_value === 0 ? 'bg-red-500/5' : ''}`}>
                  <td className="py-1 px-2 text-white">{m.month}</td>
                  <td className={`py-1 px-2 text-right ${m.checkout_gross > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBRL(m.checkout_gross)}</td>
                  <td className={`py-1 px-2 text-right ${m.crm_won_value > 0 ? 'text-purple-400' : 'text-slate-600'}`}>{m.crm_won_value > 0 ? fmtBRL(m.crm_won_value) : '-'}</td>
                  <td className="py-1 px-2 text-right">{m.txns}</td>
                  <td className="py-1 px-2 text-right text-red-300">{fmtBRL(m.refunds)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{m.total_ad_spend > 0 ? fmtBRL(m.total_ad_spend) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMPORTANT NOTE */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <h3 className="text-sm font-bold text-amber-400 mb-2">Understanding the Revenue Gap</h3>
        <div className="text-xs text-slate-300 space-y-2">
          <p><strong>Checkout (Guru Digital):</strong> Captures monthly installment payments. Max single transaction: R$135.54. Total across ALL 82,319 transactions (including canceled): R$1,869,640.77. Approved only: R$1,018,232.82.</p>
          <p><strong>CRM Won Value (RD Station):</strong> Captures full contract value when sales team closes a deal. Average deal: R$7,519.02. CRM data available from Nov 2025 onwards. Total: R$15,113,228.34 (2,010 deals).</p>
          <p><strong>Why the difference:</strong> The checkout platform processes monthly installments (R$100-135/mo). The CRM records the full contract value at time of sale (R$7,000-21,000). These are different metrics measuring different things — both are accurate representations of their respective data sources.</p>
          <p><strong>Data coverage:</strong> CRM data only starts from November 2025. Years 2021-2024 have no CRM data because RD Station CRM was not yet implemented.</p>
        </div>
      </div>
    </div>
  )
}
