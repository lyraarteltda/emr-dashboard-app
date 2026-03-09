import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Area } from 'recharts'

export function OverviewTab({ yearlySummary, overview, selectedYear }: { yearlySummary: any[]; overview: any; selectedYear: string }) {
  const yearData = yearlySummary.map((y: any) => ({
    ...y,
    total_spend: y.meta_spend + y.google_spend,
    roas: (y.meta_spend + y.google_spend) > 0 ? y.gross / (y.meta_spend + y.google_spend) : 0,
    ticket: y.txns > 0 ? y.gross / y.txns : 0,
    refund_rate: y.gross > 0 ? (y.refunds / y.gross * 100) : 0,
  }))

  const selectedData = selectedYear !== 'all' ? yearData.find((y: any) => y.year === selectedYear) : null

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Year comparison or single year highlight */}
      {selectedYear === 'all' ? (
        <>
          {/* Revenue by Year */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Receita Bruta por Ano</h3>
            <div className="h-[250px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="gross" name="Receita Bruta" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="refunds" name="Reembolsos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="txns" name="Transacoes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spend by Year */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Investimento Ads por Ano</h3>
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

          {/* ROAS + Ticket + Refund Rate Trends */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">ROAS, Ticket Medio & Taxa de Reembolso por Ano</h3>
            <div className="h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${v.toFixed(0)}%`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="roas" name="ROAS" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="ticket" name="Ticket R$" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="refund_rate" name="Refund %" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CRM + Leads + Conversions */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">CRM, Leads & Conversoes por Ano</h3>
            <div className="h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1e6).toFixed(1)}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="crm_won_value" name="CRM Won R$" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="leads_new" name="Leads" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="meta_purchases" name="Meta Purchases" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Yearly Table */}
          <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Comparativo Anual Completo</h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full text-[10px] sm:text-xs min-w-[700px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-1.5 px-2">Ano</th>
                    <th className="text-right py-1.5 px-2">Receita</th>
                    <th className="text-right py-1.5 px-2">Reemb.</th>
                    <th className="text-right py-1.5 px-2">Txns</th>
                    <th className="text-right py-1.5 px-2">Ticket</th>
                    <th className="text-right py-1.5 px-2">Meta $</th>
                    <th className="text-right py-1.5 px-2">Google $</th>
                    <th className="text-right py-1.5 px-2">ROAS</th>
                    <th className="text-right py-1.5 px-2">CRM Won</th>
                    <th className="text-right py-1.5 px-2">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {yearData.map((y: any) => (
                    <tr key={y.year} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-1.5 px-2 font-bold text-white">{y.year}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-400">R${(y.gross/1e3).toFixed(1)}K</td>
                      <td className="py-1.5 px-2 text-right text-red-400">R${(y.refunds/1e3).toFixed(1)}K</td>
                      <td className="py-1.5 px-2 text-right">{y.txns.toLocaleString('pt-BR')}</td>
                      <td className="py-1.5 px-2 text-right text-amber-400">R${y.ticket.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right text-blue-400">R${(y.meta_spend/1e3).toFixed(0)}K</td>
                      <td className="py-1.5 px-2 text-right text-amber-300">R${(y.google_spend/1e3).toFixed(0)}K</td>
                      <td className="py-1.5 px-2 text-right text-emerald-300">{y.roas.toFixed(3)}x</td>
                      <td className="py-1.5 px-2 text-right text-purple-400">R${(y.crm_won_value/1e6).toFixed(2)}M</td>
                      <td className="py-1.5 px-2 text-right text-pink-400">{y.leads_new.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : selectedData ? (
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-emerald-500/20 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Resumo {selectedYear}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { l: 'Receita Bruta', v: `R$${(selectedData.gross/1e3).toFixed(1)}K` , c: 'text-emerald-400' },
              { l: 'Receita Liquida', v: `R$${(selectedData.net/1e3).toFixed(1)}K`, c: 'text-cyan-400' },
              { l: 'Reembolsos', v: `R$${(selectedData.refunds/1e3).toFixed(1)}K`, c: 'text-red-400' },
              { l: 'Transacoes', v: selectedData.txns.toLocaleString('pt-BR'), c: 'text-amber-400' },
              { l: 'Ticket Medio', v: `R$${selectedData.ticket.toFixed(2)}`, c: 'text-amber-300' },
              { l: 'Meta Ads Spend', v: `R$${(selectedData.meta_spend/1e3).toFixed(0)}K`, c: 'text-blue-400' },
              { l: 'Google Ads Spend', v: `R$${(selectedData.google_spend/1e3).toFixed(0)}K`, c: 'text-yellow-400' },
              { l: 'ROAS', v: `${selectedData.roas.toFixed(3)}x`, c: 'text-emerald-300' },
              { l: 'Meta Impressoes', v: `${(selectedData.meta_impressions/1e6).toFixed(1)}M`, c: 'text-blue-300' },
              { l: 'Meta Clicks', v: `${(selectedData.meta_clicks/1e3).toFixed(0)}K`, c: 'text-blue-200' },
              { l: 'Meta Leads', v: selectedData.meta_leads.toLocaleString('pt-BR'), c: 'text-purple-400' },
              { l: 'Meta Purchases', v: selectedData.meta_purchases.toLocaleString('pt-BR'), c: 'text-green-400' },
              { l: 'Google Clicks', v: `${(selectedData.google_clicks/1e3).toFixed(0)}K`, c: 'text-yellow-300' },
              { l: 'Google Conv.', v: selectedData.google_conversions.toLocaleString('pt-BR'), c: 'text-yellow-200' },
              { l: 'CRM Won Value', v: `R$${(selectedData.crm_won_value/1e6).toFixed(2)}M`, c: 'text-purple-300' },
              { l: 'CRM Deals Won', v: selectedData.crm_deals_won.toLocaleString('pt-BR'), c: 'text-purple-200' },
              { l: 'CRM New Deals', v: selectedData.crm_deals_new.toLocaleString('pt-BR'), c: 'text-indigo-400' },
              { l: 'CRM Lost Deals', v: selectedData.crm_deals_lost.toLocaleString('pt-BR'), c: 'text-red-300' },
              { l: 'Novos Leads', v: selectedData.leads_new.toLocaleString('pt-BR'), c: 'text-pink-400' },
              { l: 'Taxa Reembolso', v: `${selectedData.refund_rate.toFixed(1)}%`, c: 'text-red-300' },
            ].map(item => (
              <div key={item.l} className="bg-slate-700/30 rounded-lg p-2.5 sm:p-3">
                <div className="text-[10px] sm:text-xs text-slate-400">{item.l}</div>
                <div className={`text-sm sm:text-lg font-bold ${item.c}`}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-center py-10">Sem dados para {selectedYear}</div>
      )}
    </div>
  )
}
