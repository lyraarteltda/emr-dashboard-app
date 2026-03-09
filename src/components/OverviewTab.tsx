import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart } from 'recharts'
import { useState } from 'react'

const fmt = (v: number) => v >= 1e6 ? `R$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `R$${(v/1e3).toFixed(1)}K` : `R$${v.toFixed(0)}`
const SourceBadge = ({ src }: { src: string }) => <span className="text-[8px] sm:text-[9px] text-slate-500 bg-slate-800 px-1 rounded ml-1">{src}</span>

export function OverviewTab({ yearlySummary, overview, selectedYear, monthlyCombined, cohort, ltv, dataSources }: {
  yearlySummary: any[]; overview: any; selectedYear: string; monthlyCombined: any[]; cohort: any[]; ltv: any; dataSources: any
}) {
  const [drillYear, setDrillYear] = useState<string | null>(null)

  const yearData = yearlySummary.map((y: any) => ({
    ...y,
    total_spend: y.meta_spend + y.google_spend,
  }))

  const selectedData = selectedYear !== 'all' ? yearData.find((y: any) => y.year === selectedYear) : null
  const drillData = drillYear ? monthlyCombined.filter((m: any) => m.month.startsWith(drillYear)) : (selectedYear !== 'all' ? monthlyCombined.filter((m: any) => m.month.startsWith(selectedYear)) : [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Sources Status */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-white mb-2">Fontes de Dados</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {dataSources && Object.entries(dataSources).map(([key, src]: any) => (
            <div key={key} className="bg-slate-700/30 rounded p-2">
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium">{key.replace(/_/g, ' ')}</div>
              <div className="text-[8px] sm:text-[9px] text-slate-400">{src.type}</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500">{(src.records || 0).toLocaleString()} registros</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500">{src.period}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedYear === 'all' ? (
        <>
          {/* DUAL REVENUE: CRM Won Value vs Checkout Revenue */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-1">Receita por Ano: CRM Won Value vs Checkout</h3>
            <p className="text-[9px] sm:text-xs text-slate-400 mb-3">Clique no ano na tabela abaixo para ver o detalhamento mensal</p>
            <div className="h-[280px] sm:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e6).toFixed(1)}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e3).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any, name: any) => [`R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="crm_won_value" name="CRM Won Value (RD CRM)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="checkout_gross" name="Checkout Gross (Guru)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="total_ad_spend" name="Ad Spend (Meta+Google)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROAS Real + CAC + LTV Trends */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">ROAS Real (CRM), CAC & LTV por Ano</h3>
            <div className="h-[250px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearData.filter((y: any) => y.total_ad_spend > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e3).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="right" dataKey="avg_deal_value" name="LTV (Avg Deal R$)" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.6} />
                  <Line yAxisId="left" type="monotone" dataKey="roas_crm" name="ROAS CRM" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                  <Line yAxisId="left" type="monotone" dataKey="roas_checkout" name="ROAS Checkout" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CAC Chart */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CAC por Ano (Custo de Aquisicao)</h3>
            <div className="h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData.filter((y: any) => y.total_ad_spend > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e3).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="cac_per_deal" name="CAC por Deal Won" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cac_per_lead" name="CAC por Lead" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cohort Retention Table */}
          {cohort && cohort.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Cohort: Retencao de Alunos (Checkout)</h3>
              <p className="text-[9px] sm:text-xs text-slate-400 mb-3">% de clientes do cohort que compraram novamente em anos seguintes <SourceBadge src="Guru Digital" /></p>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-[10px] sm:text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-1.5 px-2">Cohort</th>
                      <th className="text-right py-1.5 px-2">Alunos</th>
                      {yearlySummary.map((y: any) => <th key={y.year} className="text-right py-1.5 px-2">{y.year}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.map((c: any) => (
                      <tr key={c.cohort} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-1.5 px-2 font-bold text-white">{c.cohort}</td>
                        <td className="py-1.5 px-2 text-right text-slate-300">{c.initial_customers?.toLocaleString('pt-BR')}</td>
                        {yearlySummary.map((y: any) => {
                          const yd = c.years?.[y.year]
                          if (!yd || y.year < c.cohort) return <td key={y.year} className="py-1.5 px-2 text-right text-slate-600">-</td>
                          const isBase = y.year === c.cohort
                          const pct = yd.retention || 0
                          const color = isBase ? 'text-emerald-400 font-bold' : pct > 30 ? 'text-emerald-300' : pct > 15 ? 'text-amber-400' : pct > 5 ? 'text-orange-400' : 'text-red-400'
                          return <td key={y.year} className={`py-1.5 px-2 text-right ${color}`}>{pct.toFixed(1)}%</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LTV Summary */}
          {ltv && (
            <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">LTV & Lifetime Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-[10px] sm:text-xs text-slate-400">LTV CRM (Avg Deal)<SourceBadge src="RD CRM" /></div>
                  <div className="text-lg sm:text-xl font-bold text-purple-400">{fmt(ltv.crm_avg_deal || 0)}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-[10px] sm:text-xs text-slate-400">LTV Checkout<SourceBadge src="Guru" /></div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400">{fmt(ltv.checkout_ltv || 0)}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-[10px] sm:text-xs text-slate-400">Compradores Recorrentes</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-400">{(ltv.repeat_buyers || 0).toLocaleString('pt-BR')}</div>
                  <div className="text-[9px] text-slate-500">{ltv.repeat_rate}% de {(ltv.unique_buyers || 0).toLocaleString('pt-BR')}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-[10px] sm:text-xs text-slate-400">CAC/LTV Ratio (CRM)</div>
                  <div className={`text-lg sm:text-xl font-bold ${(overview.cac_per_deal / overview.avg_deal_value) < 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {overview.avg_deal_value > 0 ? (overview.cac_per_deal / overview.avg_deal_value).toFixed(2) : '-'}x
                  </div>
                  <div className="text-[9px] text-slate-500">{(overview.cac_per_deal / overview.avg_deal_value) < 1 ? 'Saudavel' : 'Atencao'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Yearly Comparison Table - CLICKABLE for drill-down */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Comparativo Anual Completo (clique no ano para drill-down)</h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full text-[10px] sm:text-xs min-w-[900px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-1.5 px-2">Ano</th>
                    <th className="text-right py-1.5 px-2">CRM Won<SourceBadge src="CRM" /></th>
                    <th className="text-right py-1.5 px-2">Checkout<SourceBadge src="Guru" /></th>
                    <th className="text-right py-1.5 px-2">Ad Spend<SourceBadge src="Meta+Google" /></th>
                    <th className="text-right py-1.5 px-2">ROAS CRM</th>
                    <th className="text-right py-1.5 px-2">ROAS Checkout</th>
                    <th className="text-right py-1.5 px-2">CAC/Deal</th>
                    <th className="text-right py-1.5 px-2">CAC/Lead</th>
                    <th className="text-right py-1.5 px-2">LTV Deal</th>
                    <th className="text-right py-1.5 px-2">Leads<SourceBadge src="RD" /></th>
                    <th className="text-right py-1.5 px-2">Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {yearData.map((y: any) => (
                    <tr key={y.year} className={`border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer ${drillYear === y.year ? 'bg-emerald-500/10' : ''}`} onClick={() => setDrillYear(drillYear === y.year ? null : y.year)}>
                      <td className="py-1.5 px-2 font-bold text-white">{y.year} {drillYear === y.year ? '▼' : '▶'}</td>
                      <td className="py-1.5 px-2 text-right text-purple-400">{fmt(y.crm_won_value)}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-400">{fmt(y.checkout_gross)}</td>
                      <td className="py-1.5 px-2 text-right text-red-400">{fmt(y.total_ad_spend)}</td>
                      <td className="py-1.5 px-2 text-right text-purple-300">{y.roas_crm > 0 ? `${y.roas_crm.toFixed(2)}x` : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-300">{y.roas_checkout > 0 ? `${y.roas_checkout.toFixed(3)}x` : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-red-300">{y.cac_per_deal > 0 ? fmt(y.cac_per_deal) : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-amber-400">{y.cac_per_lead > 0 ? fmt(y.cac_per_lead) : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-amber-300">{y.avg_deal_value > 0 ? fmt(y.avg_deal_value) : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-pink-400">{y.leads_new.toLocaleString('pt-BR')}</td>
                      <td className="py-1.5 px-2 text-right">{y.txns.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Drill-Down (when year clicked) */}
          {drillYear && drillData.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-emerald-500/30 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-lg font-semibold text-white">Detalhamento Mensal: {drillYear}</h3>
                <button onClick={() => setDrillYear(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700/50">Fechar</button>
              </div>
              <div className="h-[250px] sm:h-[320px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={drillData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v.slice(5)} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1e3).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar yAxisId="left" dataKey="crm_won_value" name="CRM Won" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="right" dataKey="checkout_gross" name="Checkout" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="total_ad_spend" name="Ad Spend" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-[10px] sm:text-xs min-w-[700px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-1.5 px-2">Mes</th>
                      <th className="text-right py-1.5 px-2">CRM Won</th>
                      <th className="text-right py-1.5 px-2">Checkout</th>
                      <th className="text-right py-1.5 px-2">Ad Spend</th>
                      <th className="text-right py-1.5 px-2">ROAS CRM</th>
                      <th className="text-right py-1.5 px-2">Leads</th>
                      <th className="text-right py-1.5 px-2">Txns</th>
                      <th className="text-right py-1.5 px-2">Refunds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillData.map((m: any) => (
                      <tr key={m.month} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-1.5 px-2 font-medium text-white">{m.month}</td>
                        <td className="py-1.5 px-2 text-right text-purple-400">{fmt(m.crm_won_value)}</td>
                        <td className="py-1.5 px-2 text-right text-emerald-400">{fmt(m.checkout_gross)}</td>
                        <td className="py-1.5 px-2 text-right text-red-400">{fmt(m.total_ad_spend)}</td>
                        <td className="py-1.5 px-2 text-right text-purple-300">{m.roas_crm > 0 ? `${m.roas_crm.toFixed(2)}x` : '-'}</td>
                        <td className="py-1.5 px-2 text-right text-pink-400">{m.leads_new.toLocaleString('pt-BR')}</td>
                        <td className="py-1.5 px-2 text-right">{m.txns.toLocaleString('pt-BR')}</td>
                        <td className="py-1.5 px-2 text-right text-red-300">{fmt(m.refunds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Spend by Year */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Investimento Ads por Ano <SourceBadge src="Meta + Google" /></h3>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="meta_spend" name="Meta Ads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="google_spend" name="Google Ads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CRM + Leads + Conversions */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CRM Deals, Leads & Conversoes por Ano</h3>
            <div className="h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="crm_deals_won" name="Deals Won" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="leads_new" name="Leads" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="meta_purchases" name="Meta Purchases" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : selectedData ? (
        <>
          {/* Single Year Summary with Source Labels */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-emerald-500/20 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Resumo {selectedYear}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { l: 'CRM Won Value', v: fmt(selectedData.crm_won_value), c: 'text-purple-400', s: 'RD CRM' },
                { l: 'Checkout Gross', v: fmt(selectedData.checkout_gross), c: 'text-emerald-400', s: 'Guru' },
                { l: 'Checkout Net', v: fmt(selectedData.checkout_net), c: 'text-cyan-400', s: 'Guru' },
                { l: 'Reembolsos', v: fmt(selectedData.refunds), c: 'text-red-400', s: 'Guru' },
                { l: 'Transacoes', v: selectedData.txns.toLocaleString('pt-BR'), c: 'text-amber-400', s: 'Guru' },
                { l: 'Ticket Checkout', v: fmt(selectedData.ticket_checkout), c: 'text-amber-300', s: 'Guru' },
                { l: 'Meta Spend', v: fmt(selectedData.meta_spend), c: 'text-blue-400', s: 'Meta' },
                { l: 'Google Spend', v: fmt(selectedData.google_spend), c: 'text-yellow-400', s: 'Google' },
                { l: 'ROAS CRM', v: selectedData.roas_crm > 0 ? `${selectedData.roas_crm.toFixed(2)}x` : '-', c: 'text-purple-300', s: 'CRM/Ads' },
                { l: 'ROAS Checkout', v: selectedData.roas_checkout > 0 ? `${selectedData.roas_checkout.toFixed(3)}x` : '-', c: 'text-emerald-300', s: 'Guru/Ads' },
                { l: 'CAC por Deal', v: selectedData.cac_per_deal > 0 ? fmt(selectedData.cac_per_deal) : '-', c: 'text-red-300', s: 'Ads/CRM' },
                { l: 'CAC por Lead', v: selectedData.cac_per_lead > 0 ? fmt(selectedData.cac_per_lead) : '-', c: 'text-orange-400', s: 'Ads/RD' },
                { l: 'LTV (Avg Deal)', v: selectedData.avg_deal_value > 0 ? fmt(selectedData.avg_deal_value) : '-', c: 'text-amber-300', s: 'CRM' },
                { l: 'CRM Deals Won', v: selectedData.crm_deals_won.toLocaleString('pt-BR'), c: 'text-purple-200', s: 'RD CRM' },
                { l: 'Meta Impressoes', v: `${(selectedData.meta_impressions/1e6).toFixed(1)}M`, c: 'text-blue-300', s: 'Meta' },
                { l: 'Meta Clicks', v: `${(selectedData.meta_clicks/1e3).toFixed(0)}K`, c: 'text-blue-200', s: 'Meta' },
                { l: 'Meta Leads', v: selectedData.meta_leads.toLocaleString('pt-BR'), c: 'text-purple-400', s: 'Meta' },
                { l: 'Meta Purchases', v: selectedData.meta_purchases.toLocaleString('pt-BR'), c: 'text-green-400', s: 'Meta' },
                { l: 'Novos Leads', v: selectedData.leads_new.toLocaleString('pt-BR'), c: 'text-pink-400', s: 'RD Marketing' },
                { l: 'Taxa Reembolso', v: `${selectedData.refund_rate.toFixed(1)}%`, c: 'text-red-300', s: 'Guru' },
              ].map(item => (
                <div key={item.l} className="bg-slate-700/30 rounded-lg p-2.5 sm:p-3">
                  <div className="text-[10px] sm:text-xs text-slate-400">{item.l}<SourceBadge src={item.s} /></div>
                  <div className={`text-sm sm:text-lg font-bold ${item.c}`}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly drill-down for selected year */}
          {drillData.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Detalhamento Mensal {selectedYear}</h3>
              <div className="h-[250px] sm:h-[320px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={drillData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v.slice(5)} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1e3).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar yAxisId="left" dataKey="crm_won_value" name="CRM Won" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="right" dataKey="checkout_gross" name="Checkout" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="total_ad_spend" name="Ad Spend" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-[10px] sm:text-xs min-w-[700px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-1.5 px-2">Mes</th>
                      <th className="text-right py-1.5 px-2">CRM Won</th>
                      <th className="text-right py-1.5 px-2">Deals</th>
                      <th className="text-right py-1.5 px-2">Checkout</th>
                      <th className="text-right py-1.5 px-2">Txns</th>
                      <th className="text-right py-1.5 px-2">Ad Spend</th>
                      <th className="text-right py-1.5 px-2">ROAS CRM</th>
                      <th className="text-right py-1.5 px-2">Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillData.map((m: any) => (
                      <tr key={m.month} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-1.5 px-2 font-medium text-white">{m.month}</td>
                        <td className="py-1.5 px-2 text-right text-purple-400">{fmt(m.crm_won_value)}</td>
                        <td className="py-1.5 px-2 text-right text-purple-300">{m.crm_deals_won}</td>
                        <td className="py-1.5 px-2 text-right text-emerald-400">{fmt(m.checkout_gross)}</td>
                        <td className="py-1.5 px-2 text-right">{m.txns.toLocaleString('pt-BR')}</td>
                        <td className="py-1.5 px-2 text-right text-red-400">{fmt(m.total_ad_spend)}</td>
                        <td className="py-1.5 px-2 text-right text-purple-300">{m.roas_crm > 0 ? `${m.roas_crm.toFixed(2)}x` : '-'}</td>
                        <td className="py-1.5 px-2 text-right text-pink-400">{m.leads_new.toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-400 text-center py-10">Sem dados para {selectedYear}</div>
      )}
    </div>
  )
}
