import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function LeadsTab({ data }: { data: any }) {
  const monthlyData = (data.monthly_new || []).map((d: any) => ({ ...d, label: d.month.slice(2) }))

  // Calculate yearly breakdown from monthly
  const yearlyBreakdown: any = {}
  for (const m of data.monthly_new || []) {
    const yr = m.year || m.month?.slice(0, 4)
    if (!yr) continue
    yearlyBreakdown[yr] = (yearlyBreakdown[yr] || 0) + (m.count || 0)
  }
  const yearlyData = Object.entries(yearlyBreakdown).map(([year, count]) => ({ year, count })).sort((a: any, b: any) => a.year.localeCompare(b.year))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-pink-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Leads</div>
          <div className="text-lg sm:text-2xl font-bold text-pink-400">{(data.total || 0).toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Meses com Dados</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{monthlyData.filter((d: any) => d.count > 0).length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Media Mensal</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{monthlyData.length > 0 ? Math.round((data.total || 0) / monthlyData.filter((d: any) => d.count > 0).length).toLocaleString('pt-BR') : 0}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Fonte</div>
          <div className="text-sm sm:text-lg font-bold text-amber-400">RD Station</div>
          <div className="text-[9px] sm:text-xs text-slate-500">Marketing</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Novos Leads por Mes</h3>
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Novos Leads" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Leads por Ano</h3>
        <div className="h-[220px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Leads" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Detalhamento Mensal</h3>
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-xs sm:text-sm">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2">Mes</th>
                <th className="text-right py-1.5 px-2">Novos Leads</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().filter((d: any) => d.count > 0).map((d: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 text-slate-300">{d.month}</td>
                  <td className="py-1 px-2 text-right text-pink-400">{d.count.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
