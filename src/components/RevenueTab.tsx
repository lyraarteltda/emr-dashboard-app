import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type MonthlyRevenue = { month: string; gross: number; net: number; refunds: number; txns: number }

export function RevenueTab({ data }: { data: MonthlyRevenue[] }) {
  const chartData = data.map(d => ({
    ...d,
    label: d.month.slice(2), // "21-04"
  }))

  const yearly = data.reduce((acc, d) => {
    const year = d.month.slice(0, 4)
    if (!acc[year]) acc[year] = { year, gross: 0, net: 0, refunds: 0, txns: 0 }
    acc[year].gross += d.gross
    acc[year].net += d.net
    acc[year].refunds += d.refunds
    acc[year].txns += d.txns
    return acc
  }, {} as Record<string, { year: string; gross: number; net: number; refunds: number; txns: number }>)

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Receita Mensal (Bruta vs Liquida)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v: number) => [`R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            />
            <Area type="monotone" dataKey="gross" name="Bruta" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
            <Area type="monotone" dataKey="net" name="Liquida" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
            <Area type="monotone" dataKey="refunds" name="Reembolsos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Transacoes por Mes</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="txns" name="Transacoes" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Resumo Anual</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Ano</th>
                <th className="text-right py-2 px-3">Receita Bruta</th>
                <th className="text-right py-2 px-3">Receita Liquida</th>
                <th className="text-right py-2 px-3">Reembolsos</th>
                <th className="text-right py-2 px-3">Transacoes</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(yearly).map(y => (
                <tr key={y.year} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 font-medium text-white">{y.year}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">R${y.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-cyan-400">R${y.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-red-400">R${y.refunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{y.txns.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
