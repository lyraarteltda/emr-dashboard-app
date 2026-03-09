import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b']
const LABELS: Record<string, string> = {
  credit_card: 'Cartao de Credito', billet: 'Boleto', pix: 'PIX', other: 'Outros', free: 'Gratuito',
}

export function PaymentsTab({ methods, installments }: { methods: any[]; installments: any[] }) {
  const mapped = methods.filter((d: any) => d.revenue > 0).map((d: any) => ({ ...d, label: LABELS[d.method] || d.method }))
  const totalRevenue = mapped.reduce((s: number, d: any) => s + d.revenue, 0)
  const totalCount = methods.reduce((s: number, d: any) => s + d.count, 0)

  // Group installments
  const instData = installments.slice(0, 12).map((d: any) => ({ ...d, label: `${d.installments}x` }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Receita Paga</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">R${(totalRevenue/1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Transacoes</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{totalCount.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">% Cartao</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{(methods.find((m: any) => m.method === 'credit_card')?.revenue / totalRevenue * 100 || 0).toFixed(1)}%</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">% PIX</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{(methods.find((m: any) => m.method === 'pix')?.revenue / totalRevenue * 100 || 0).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Receita por Metodo</h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mapped} dataKey="revenue" nameKey="label" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => `${name} ${((percent || 0)*100).toFixed(1)}%`} labelLine={false}>
                  {mapped.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Parcelamento (Transacoes Aprovadas)</h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Transacoes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Detalhes por Metodo de Pagamento</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[450px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2 sm:px-3">Metodo</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Transacoes</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Receita</th>
                <th className="text-right py-1.5 px-2 sm:px-3">% Receita</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((d: any) => (
                <tr key={d.method} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 sm:px-3 font-medium text-white">{LABELS[d.method] || d.method}</td>
                  <td className="py-1 px-2 sm:px-3 text-right">{d.count.toLocaleString('pt-BR')}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-emerald-400">R${d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-blue-400">{totalRevenue > 0 ? (d.revenue / totalRevenue * 100).toFixed(1) : '0.0'}%</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-amber-400">R${(d.count > 0 ? d.revenue / d.count : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
