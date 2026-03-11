import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#a78bfa']
const fmt = (v: number) => { const n = v ?? 0; return n >= 1e6 ? `R$${(n/1e6).toFixed(2).replace('.', ',')}M` : n >= 1e3 ? `R$${(n/1e3).toFixed(1).replace('.', ',')}K` : `R$${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` }

export function ProductsTab({ data, utmSources, utmCampaigns }: { data: any[]; utmSources: any[]; utmCampaigns: any[] }) {
  const totalSales = data.reduce((s: number, p: any) => s + (p.count || 0), 0)
  const totalRevenue = data.reduce((s: number, p: any) => s + (p.gross || 0), 0)
  const uniqueProducts = data.filter((p: any) => p.count > 0).length

  const top15 = data.slice(0, 15).map((p: any) => ({
    ...p,
    short: p.name.length > 35 ? p.name.slice(0, 35) + '...' : p.name,
    ticket: p.count > 0 ? p.gross / p.count : 0,
    pct: totalRevenue > 0 ? (p.gross / totalRevenue * 100) : 0,
  }))

  const pieData = data.slice(0, 8).map((p: any) => ({
    name: p.name.length > 25 ? p.name.slice(0, 25) + '...' : p.name,
    value: p.gross || 0,
  }))
  const otherGross = data.slice(8).reduce((s: number, p: any) => s + (p.gross || 0), 0)
  if (otherGross > 0) pieData.push({ name: 'Outros', value: otherGross })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Receita Total Produtos</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{fmt(totalRevenue)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Vendas</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{totalSales.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Produtos Ativos</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{uniqueProducts}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Ticket Medio Geral</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{fmt(totalSales > 0 ? totalRevenue / totalSales : 0)}</div>
        </div>
      </div>

      {/* Top 15 Bar Chart */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Top 15 Produtos por Receita</h3>
        <div className="h-[400px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top15} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="short" stroke="#64748b" tick={{ fontSize: 8 }} width={180} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any, name: any) => name === 'Vendas' ? Number(v).toLocaleString('pt-BR') : `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="gross" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="count" name="Vendas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Distribution Pie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Distribuicao de Receita</h3>
          <div className="h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="65%" label={({ name, percent, x, y }: any) => percent > 0.03 ? <text x={x} y={y} fill="#e2e8f0" fontSize={9} textAnchor="middle" dominantBaseline="central">{`${name.slice(0, 18)} ${(percent*100).toFixed(0)}%`}</text> : null} labelLine={true}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Summary Cards */}
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top 10 — Vendas por Produto</h3>
          <div className="space-y-1.5">
            {data.slice(0, 10).map((p: any, i: number) => {
              const pct = totalRevenue > 0 ? (p.gross / totalRevenue * 100) : 0
              return (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="text-slate-500 text-xs w-5 shrink-0">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-300 text-[10px] sm:text-xs truncate mr-2" title={p.name}>{p.name?.slice(0, 40)}</span>
                      <span className="text-emerald-400 text-[10px] sm:text-xs font-bold shrink-0">{(p.count || 0).toLocaleString('pt-BR')} vendas</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-slate-500 text-[9px]">{fmt(p.gross || 0)}</span>
                      <span className="text-slate-500 text-[9px]">{pct.toFixed(1)}% da receita</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Full Product Table */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Todos os Produtos ({data.filter((p: any) => p.count > 0).length} com vendas)</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0 max-h-[500px] overflow-y-auto">
          <table className="w-full text-[10px] sm:text-sm min-w-[650px]">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2">#</th>
                <th className="text-left py-1.5 px-2">Produto</th>
                <th className="text-right py-1.5 px-2">Vendas</th>
                <th className="text-right py-1.5 px-2">% Vendas</th>
                <th className="text-right py-1.5 px-2">Receita</th>
                <th className="text-right py-1.5 px-2">% Receita</th>
                <th className="text-right py-1.5 px-2">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {data.filter((p: any) => p.count > 0).map((p: any, i: number) => {
                const salesPct = totalSales > 0 ? (p.count / totalSales * 100) : 0
                const revPct = totalRevenue > 0 ? (p.gross / totalRevenue * 100) : 0
                return (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-500">{i + 1}</td>
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[220px]" title={p.name}>{p.name?.slice(0, 50)}</td>
                    <td className="py-1 px-2 text-right font-bold text-blue-400">{(p.count || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-slate-500">{salesPct.toFixed(1)}%</td>
                    <td className="py-1 px-2 text-right text-emerald-400">R${(p.gross || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-1 px-2 text-right text-slate-500">{revPct.toFixed(1)}%</td>
                    <td className="py-1 px-2 text-right text-amber-400">R${(p.count > 0 ? p.gross / p.count : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )
              })}
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
                    <td className="py-1 px-2 text-right">{(s.count || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">R${(s.gross || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
                    <td className="py-1 px-2 text-right">{(c.count || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-emerald-400">R${(c.gross || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
