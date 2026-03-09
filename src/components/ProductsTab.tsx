import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function ProductsTab({ data, utmSources, utmCampaigns }: { data: any[]; utmSources: any[]; utmCampaigns: any[] }) {
  const top15 = data.slice(0, 15).map((p: any) => ({
    ...p,
    short: p.name.length > 35 ? p.name.slice(0, 35) + '...' : p.name,
    ticket: p.approved > 0 ? p.gross / p.approved : 0,
    refundRate: p.count > 0 ? (p.refunded / p.count * 100) : 0,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Top 15 Produtos por Receita</h3>
        <div className="h-[400px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top15} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="short" stroke="#64748b" tick={{ fontSize: 8 }} width={180} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="gross" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product details table */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Detalhes Top 30 Produtos</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-[10px] sm:text-sm min-w-[600px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2">#</th>
                <th className="text-left py-1.5 px-2">Produto</th>
                <th className="text-right py-1.5 px-2">Vendas</th>
                <th className="text-right py-1.5 px-2">Aprovadas</th>
                <th className="text-right py-1.5 px-2">Receita</th>
                <th className="text-right py-1.5 px-2">Ticket</th>
                <th className="text-right py-1.5 px-2">Reemb %</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 30).map((p: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 text-slate-500">{i + 1}</td>
                  <td className="py-1 px-2 text-slate-300 truncate max-w-[200px]" title={p.name}>{p.name.slice(0, 45)}</td>
                  <td className="py-1 px-2 text-right">{p.count.toLocaleString('pt-BR')}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{p.approved.toLocaleString('pt-BR')}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">R${p.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">R${(p.approved > 0 ? p.gross / p.approved : 0).toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-red-400">{(p.count > 0 ? p.refunded / p.count * 100 : 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UTM Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top UTM Sources (Aprovadas)</h3>
          <div className="overflow-y-auto max-h-[350px]">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">Source</th>
                  <th className="text-right py-1.5 px-2">Vendas</th>
                  <th className="text-right py-1.5 px-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {utmSources?.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[120px]">{s.source}</td>
                    <td className="py-1 px-2 text-right">{s.count.toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">R${s.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top UTM Campaigns (Aprovadas)</h3>
          <div className="overflow-y-auto max-h-[350px]">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">Campaign</th>
                  <th className="text-right py-1.5 px-2">Vendas</th>
                  <th className="text-right py-1.5 px-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {utmCampaigns?.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[150px]" title={c.campaign}>{c.campaign}</td>
                    <td className="py-1 px-2 text-right">{c.count.toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">R${c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
