import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

type Payment = { method: string; count: number; revenue: number }

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b']
const LABELS: Record<string, string> = {
  credit_card: 'Cartao de Credito',
  billet: 'Boleto',
  pix: 'PIX',
  other: 'Outros',
  free: 'Gratuito',
}

export function PaymentsTab({ data }: { data: Payment[] }) {
  const mapped = data.filter(d => d.revenue > 0).map(d => ({
    ...d,
    label: LABELS[d.method] || d.method,
  }))

  const totalRevenue = mapped.reduce((s, d) => s + d.revenue, 0)
  const totalCount = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-4">
          <div className="text-xs text-slate-400">Receita Total (pagos)</div>
          <div className="text-2xl font-bold text-emerald-400">R${(totalRevenue / 1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-blue-500/30 p-4">
          <div className="text-xs text-slate-400">Total Transacoes</div>
          <div className="text-2xl font-bold text-blue-400">{totalCount.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Metodo</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={mapped} dataKey="revenue" nameKey="label" cx="50%" cy="50%" outerRadius={130} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}>
                {mapped.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Transacoes por Metodo</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.map(d => ({ ...d, label: LABELS[d.method] || d.method }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" name="Transacoes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Detalhes por Metodo de Pagamento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Metodo</th>
                <th className="text-right py-2 px-3">Transacoes</th>
                <th className="text-right py-2 px-3">Receita</th>
                <th className="text-right py-2 px-3">% Receita</th>
                <th className="text-right py-2 px-3">Ticket Medio</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.method} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 font-medium text-white">{LABELS[d.method] || d.method}</td>
                  <td className="py-2 px-3 text-right">{d.count.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">R${d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{totalRevenue > 0 ? (d.revenue / totalRevenue * 100).toFixed(1) : '0.0'}%</td>
                  <td className="py-2 px-3 text-right text-amber-400">R${(d.count > 0 ? d.revenue / d.count : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
