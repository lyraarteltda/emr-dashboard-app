import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4']

export function LeadsTab({ data }: { data: any }) {
  const monthlyData = (data.monthly_new || []).map((d: any) => ({ ...d, label: d.month.slice(2) }))
  const lifecycleData = data.by_lifecycle || []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg border border-pink-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Total Leads</div>
          <div className="text-lg sm:text-2xl font-bold text-pink-400">{data.total?.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Lifecycle Stages</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{lifecycleData.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-blue-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Tags Unicas</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{data.top_tags?.length}+</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-amber-500/30 p-2.5 sm:p-4">
          <div className="text-[10px] sm:text-xs text-slate-400">Fonte</div>
          <div className="text-sm sm:text-lg font-bold text-amber-400">RD Station</div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Lifecycle Stage</h3>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={lifecycleData} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius="80%" label={({ stage, percent }: any) => `${stage} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {lifecycleData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Top 20 Tags</h3>
          <div className="h-[250px] sm:h-[300px] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_tags?.slice(0, 15)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="tag" stroke="#64748b" tick={{ fontSize: 8 }} width={120} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Leads" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
