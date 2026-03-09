import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#f97316']

export function SubscriptionsTab({ data, refunds }: { data: any; refunds: any }) {
  const statusData = Object.entries(data.by_status || {}).map(([k, v]: any) => ({ name: k, value: v }))
  const pmData = Object.entries(data.by_payment_method || {}).map(([k, v]: any) => ({ name: k, value: v }))
  const monthlyData = (data.monthly_new || []).map((d: any) => ({ ...d, label: d.month.slice(2) }))
  const refundMonthly = (refunds.monthly || []).map((d: any) => ({ ...d, label: d.month.slice(2) }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-orange-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Assinaturas</div>
          <div className="text-lg sm:text-2xl font-bold text-orange-400">{data.total?.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Status Ativas</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{(data.by_status?.active || 0).toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-red-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Canceladas</div>
          <div className="text-lg sm:text-2xl font-bold text-red-400">{(data.by_status?.cancelled || 0).toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Reembolsos</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{refunds.by_reason?.reduce((s: number, r: any) => s + r.count, 0)?.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Novas Assinaturas por Mes</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Novas Assinaturas" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Status das Assinaturas</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Metodo de Pagamento</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pmData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pmData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Refund Analysis */}
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Reembolsos por Mes (Qtd vs Valor)</h3>
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={refundMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 9 }} tickFormatter={(v: any) => `R$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="count" name="Qtd Reembolsos" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="amount" name="Valor Total" stroke="#ef4444" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-3">Motivos de Reembolso</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[400px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1.5 px-2 sm:px-3">Motivo</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Qtd</th>
                <th className="text-right py-1.5 px-2 sm:px-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {refunds.by_reason?.map((r: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-1 px-2 sm:px-3 text-slate-300 truncate max-w-[200px]">{r.reason}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-amber-400">{r.count}</td>
                  <td className="py-1 px-2 sm:px-3 text-right text-red-400">R${r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
