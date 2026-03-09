import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function CustomersTab({ data }: { data: any }) {
  const monthlyData = (data.monthly_new || []).map((d: any) => ({ ...d, label: d.month.slice(2) }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Clientes</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{data.total?.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Estados</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{data.by_state?.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Cidades</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{data.by_city?.length}+</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Maior Estado</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400">{data.by_state?.[0]?.state}</div>
          <div className="text-[9px] sm:text-xs text-slate-500">{data.by_state?.[0]?.count?.toLocaleString('pt-BR')} clientes</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Novos Clientes por Mes</h3>
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Novos Clientes" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top 20 Estados</h3>
          <div className="h-[400px] sm:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_state?.slice(0, 20)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="state" stroke="#64748b" tick={{ fontSize: 10 }} width={40} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Clientes" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top 20 Cidades</h3>
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">#</th>
                  <th className="text-left py-1.5 px-2">Cidade/UF</th>
                  <th className="text-right py-1.5 px-2">Clientes</th>
                  <th className="text-right py-1.5 px-2">%</th>
                </tr>
              </thead>
              <tbody>
                {data.by_city?.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-1 px-2 text-slate-500">{i + 1}</td>
                    <td className="py-1 px-2 text-slate-300 truncate max-w-[150px]">{c.city}</td>
                    <td className="py-1 px-2 text-right text-cyan-400">{c.count.toLocaleString('pt-BR')}</td>
                    <td className="py-1 px-2 text-right text-slate-400">{(c.count / data.total * 100).toFixed(1)}%</td>
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
