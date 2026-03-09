import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Line } from 'recharts'

export function RevenueTab({ monthly, daily, crmMonthly }: { monthly: any[]; daily: any[]; crmMonthly?: any[] }) {
  const monthData = monthly.map(d => ({ ...d, label: d.month.slice(2) }))
  const dailyData = daily.map((d: any) => ({ ...d, label: d.date.slice(5) }))

  const yearly = monthly.reduce((acc: any, d: any) => {
    const year = d.month.slice(0, 4)
    if (!acc[year]) acc[year] = { year, gross: 0, net: 0, refunds: 0, chargebacks: 0, txns: 0 }
    acc[year].gross += d.gross
    acc[year].net += d.net
    acc[year].refunds += d.refunds
    acc[year].chargebacks += d.chargebacks || 0
    acc[year].txns += d.txns
    return acc
  }, {})

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Monthly Revenue */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Receita Mensal (Bruta vs Liquida vs Reembolsos)</h3>
        <div className="h-[250px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Area type="monotone" dataKey="gross" name="Bruta" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Area type="monotone" dataKey="net" name="Liquida" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
              <Area type="monotone" dataKey="refunds" name="Reembolsos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Revenue (last 180 days) */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Receita Diaria (Ultimos 180 dias)</h3>
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 8 }} interval={14} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="gross" name="Receita" fill="#10b981" fillOpacity={0.6} radius={[1, 1, 0, 0]} />
              <Line type="monotone" dataKey="refunds" name="Reembolsos" stroke="#ef4444" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions per Month */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Transacoes e Ticket Medio Mensal</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthData.map((d: any) => ({ ...d, ticket: d.txns > 0 ? d.gross / d.txns : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${v.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="txns" name="Transacoes" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="ticket" name="Ticket Medio" stroke="#f59e0b" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Summary */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Resumo Anual</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[500px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2 sm:px-3">Ano</th>
                <th className="text-right py-2 px-2 sm:px-3">Receita Bruta</th>
                <th className="text-right py-2 px-2 sm:px-3">Receita Liquida</th>
                <th className="text-right py-2 px-2 sm:px-3">Reembolsos</th>
                <th className="text-right py-2 px-2 sm:px-3">Chargebacks</th>
                <th className="text-right py-2 px-2 sm:px-3">Txns</th>
                <th className="text-right py-2 px-2 sm:px-3">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(yearly).map((y: any) => (
                <tr key={y.year} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-white">{y.year}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-emerald-400">R${y.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-cyan-400">R${y.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-red-400">R${y.refunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-red-300">R${y.chargebacks.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-slate-300">{y.txns.toLocaleString('pt-BR')}</td>
                  <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-right text-amber-400">R${(y.txns > 0 ? y.gross / y.txns : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
