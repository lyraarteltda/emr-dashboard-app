import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Product = { name: string; count: number; approved: number; gross: number; refunded: number }

export function ProductsTab({ data }: { data: Product[] }) {
  const top15 = data.slice(0, 15).map(p => ({
    ...p,
    short: p.name.length > 40 ? p.name.slice(0, 40) + '...' : p.name,
    ticket: p.approved > 0 ? p.gross / p.approved : 0,
    refundRate: p.count > 0 ? (p.refunded / p.count * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top 15 Produtos por Receita</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={top15} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="short" stroke="#64748b" tick={{ fontSize: 9 }} width={200} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v: number) => `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="gross" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Detalhes dos Produtos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Produto</th>
                <th className="text-right py-2 px-3">Vendas</th>
                <th className="text-right py-2 px-3">Aprovadas</th>
                <th className="text-right py-2 px-3">Receita</th>
                <th className="text-right py-2 px-3">Ticket</th>
                <th className="text-right py-2 px-3">Reemb %</th>
              </tr>
            </thead>
            <tbody>
              {top15.map((p, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-slate-300 max-w-xs truncate" title={p.name}>{p.short}</td>
                  <td className="py-2 px-3 text-right">{p.count.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{p.approved.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">R${p.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right text-cyan-400">R${p.ticket.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-red-400">{p.refundRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
