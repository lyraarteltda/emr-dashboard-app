import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16']

export function GeoTab({ data }: { data: any[] }) {
  const top10 = data.slice(0, 10)
  const totalRevenue = data.reduce((s: number, d: any) => s + d.revenue, 0)
  const totalTxns = data.reduce((s: number, d: any) => s + d.txns, 0)
  const pieData = top10.map((d: any) => ({ ...d, pct: (d.revenue / totalRevenue * 100).toFixed(1) }))

  // Regions: NE, SE, N, S, CO
  const regions: any = { NE: 0, SE: 0, N: 0, S: 0, CO: 0 }
  const regionMap: any = {
    PE: 'NE', CE: 'NE', PB: 'NE', BA: 'NE', AL: 'NE', RN: 'NE', PI: 'NE', SE: 'NE', MA: 'NE',
    SP: 'SE', MG: 'SE', RJ: 'SE', ES: 'SE',
    PA: 'N', AM: 'N', TO: 'N', RO: 'N', AC: 'N', AP: 'N',
    PR: 'S', RS: 'S', SC: 'S',
    GO: 'CO', DF: 'CO', MS: 'CO', MT: 'CO',
  }
  data.forEach((d: any) => {
    const reg = regionMap[d.state] || 'CO'
    regions[reg] += d.revenue
  })
  const regionData = Object.entries(regions).map(([k, v]: any) => ({ region: k, revenue: v })).sort((a: any, b: any) => b.revenue - a.revenue)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Receita Total</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">R${(totalRevenue/1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Transacoes</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{totalTxns.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Estados</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{data.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">PE domina</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{((data[0]?.revenue || 0) / totalRevenue * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Receita por Estado (Top 10)</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="state" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Distribuicao por Regiao</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={regionData} dataKey="revenue" nameKey="region" cx="50%" cy="50%" outerRadius="80%" label={({ region, percent }: any) => `${region} ${((percent || 0)*100).toFixed(1)}%`} labelLine={false}>
                  {regionData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `R$${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Todos os Estados</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[450px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2 sm:px-3">Estado</th>
                <th className="text-left py-1.5 px-2 sm:px-3">Regiao</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Txns</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Receita</th>
                <th className="text-right py-1.5 px-2 sm:px-3">% Total</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any) => (
                <tr key={d.state} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 sm:px-3 font-medium text-white">{d.state}</td>
                  <td className="py-1 px-2 sm:px-3 text-slate-400">{regionMap[d.state] || '-'}</td>
                  <td className="py-1 px-2 sm:px-3 text-right">{d.txns.toLocaleString('pt-BR')}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-emerald-400">R${d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-blue-400">{(d.revenue / totalRevenue * 100).toFixed(1)}%</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-amber-400">R${(d.txns > 0 ? d.revenue / d.txns : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
