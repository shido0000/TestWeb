import { useApp } from '../store/useStore';
import { AlertTriangle, Shield, Zap, Activity, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const severityColors: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
  Info: '#3b82f6',
  Warning: '#a855f7',
};

export default function Dashboard() {
  const { stats, scans, findings } = useApp();

      const statCards = [
        { label: 'Total Proyectos', value: stats.totalProjects, icon: Shield, color: 'from-blue-500 to-blue-700', change: '+1 esta semana' },
        { label: 'Total Escaneos', value: stats.totalScans, icon: Zap, color: 'from-purple-500 to-purple-700', change: `${stats.scansThisWeek} esta semana` },
        { label: 'Total Hallazgos', value: stats.totalFindings, icon: AlertTriangle, color: 'from-amber-500 to-amber-700', change: '+12 desde último escaneo' },
        { label: 'Problemas Críticos', value: stats.criticalFindings, icon: Activity, color: 'from-red-500 to-red-700', change: 'Requiere atención' },
      ];
  const recentScans = scans.slice(0, 4);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Panel de Control</h1>
          <p className="text-sm text-text-secondary mt-1">Resumen de tu actividad de pruebas y hallazgos</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-low/10 text-low text-xs font-medium rounded-full border border-low/20">
            <CheckCircle2 className="w-3 h-3" /> Todos los sistemas operativos
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="relative overflow-hidden bg-surface-light border border-border rounded-xl p-5 hover:border-border-light transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {stat.change}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Findings Trend */}
        <div className="lg:col-span-2 bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Tendencia de Hallazgos</h3>
              <p className="text-xs text-text-muted">Últimos 7 días</p>
            </div>
            <div className="flex items-center gap-3">
              {['Critical', 'High', 'Medium', 'Low'].map(s => (
                <span key={s} className="flex items-center gap-1 text-xs text-text-secondary">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[s] }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.findingsTrend}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#colorCritical)" strokeWidth={2} />
              <Area type="monotone" dataKey="high" stroke="#f97316" fill="url(#colorHigh)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stroke="#eab308" fill="url(#colorMedium)" strokeWidth={2} />
              <Area type="monotone" dataKey="low" stroke="#22c55e" fill="url(#colorLow)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Distribución por Severidad</h3>
          <p className="text-xs text-text-muted mb-4">Todos los hallazgos por severidad</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.severityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
              >
                {stats.severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {stats.severityDistribution.map(s => (
              <div key={s.severity} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-text-secondary">{s.severity}: {s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suite Distribution + Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Suite Distribution */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Hallazgos por Suite</h3>
          <p className="text-xs text-text-muted mb-4">Distribución a través de suites de prueba</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.suiteDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="suite" stroke="#64748b" fontSize={11} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Scans */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Escaneos Recientes</h3>
              <p className="text-xs text-text-muted">Última actividad de escaneo</p>
            </div>
            <a href="/scans" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentScans.map(scan => (
              <div key={scan.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-border transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  scan.status === 'completed' ? 'bg-low' :
                  scan.status === 'running' ? 'bg-primary-400 animate-pulse' :
                  scan.status === 'failed' ? 'bg-critical' : 'bg-text-muted'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{scan.targetUrl}</p>
                  <p className="text-xs text-text-muted">
                    {scan.suites.length} suites • {scan.pagesScanned} páginas
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    scan.status === 'completed' ? 'bg-low/10 text-low' :
                    scan.status === 'running' ? 'bg-primary-400/10 text-primary-400' :
                    scan.status === 'failed' ? 'bg-critical/10 text-critical' : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    {scan.status}
                  </span>
                  <p className="text-xs text-text-muted mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {scan.duration ? `${Math.round(scan.duration / 60)}min` : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Findings Alert */}
      {findings.filter(f => f.severity === 'critical').length > 0 && (
        <div className="bg-critical/5 border border-critical/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-critical" />
            <h3 className="text-sm font-semibold text-critical">Hallazgos Críticos que Requieren Atención Inmediata</h3>
          </div>
          <div className="space-y-2">
            {findings.filter(f => f.severity === 'critical').map(finding => (
              <div key={finding.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-light/50 border border-critical/10">
                <span className="px-2 py-0.5 text-xs font-bold bg-critical/10 text-critical rounded">CRITICAL</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{finding.title}</p>
                  <p className="text-xs text-text-muted truncate">{finding.url}</p>
                </div>
                <span className="text-xs text-text-muted">{finding.suite.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
