import { useState } from 'react';
import { useApp } from '../store/useStore';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const { scans, findings, projects } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'executive'>('summary');

  const projectFindings = selectedProject === 'all'
    ? findings
    : findings.filter(f => f.projectId === selectedProject);

  const severityData = [
    { name: 'Critical', value: projectFindings.filter(f => f.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: projectFindings.filter(f => f.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: projectFindings.filter(f => f.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: projectFindings.filter(f => f.severity === 'low').length, color: '#22c55e' },
    { name: 'Info', value: projectFindings.filter(f => f.severity === 'info').length, color: '#3b82f6' },
    { name: 'Warning', value: projectFindings.filter(f => f.severity === 'warning').length, color: '#a855f7' },
  ].filter(d => d.value > 0);

  const suiteData = [
    { name: 'Security', value: projectFindings.filter(f => f.suite === 'security').length },
    { name: 'Accessibility', value: projectFindings.filter(f => f.suite === 'accessibility').length },
    { name: 'Performance', value: projectFindings.filter(f => f.suite === 'performance').length },
    { name: 'Console', value: projectFindings.filter(f => f.suite === 'console_errors').length },
    { name: 'Links', value: projectFindings.filter(f => f.suite === 'broken_links').length },
    { name: 'Visual', value: projectFindings.filter(f => f.suite === 'visual_regression').length },
    { name: 'SEO', value: projectFindings.filter(f => f.suite === 'seo').length },
  ].filter(d => d.value > 0);

  const completedScans = scans.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-sm text-text-secondary mt-1">Generate and export detailed testing reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-light border border-border hover:border-border-light text-text-primary text-sm font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20">
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* Report Config */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase mb-1.5">Project</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="summary">Executive Summary</option>
              <option value="detailed">Detailed Technical Report</option>
              <option value="executive">Board-Level Overview</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase mb-1.5">Format</label>
            <div className="flex gap-2">
              {['PDF', 'HTML', 'JSON'].map(fmt => (
                <button key={fmt} className="flex-1 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-border-light transition-colors">
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-surface-light border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary-500/10">
            <BarChart3 className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">TestHub Security & Quality Report</h2>
            <p className="text-xs text-text-muted">
              Generated: {new Date().toLocaleDateString()} • Scope: {selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id === selectedProject)?.name}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-2xl font-bold text-text-primary">{completedScans.length}</p>
            <p className="text-xs text-text-muted mt-1">Scans Completed</p>
          </div>
          <div className="p-4 rounded-lg bg-surface/50 border border-border/50 text-center">
            <p className="text-2xl font-bold text-text-primary">{projectFindings.length}</p>
            <p className="text-xs text-text-muted mt-1">Total Findings</p>
          </div>
          <div className="p-4 rounded-lg bg-critical/5 border border-critical/10 text-center">
            <p className="text-2xl font-bold text-critical">{projectFindings.filter(f => f.severity === 'critical').length}</p>
            <p className="text-xs text-text-muted mt-1">Critical Issues</p>
          </div>
          <div className="p-4 rounded-lg bg-low/5 border border-low/10 text-center">
            <p className="text-2xl font-bold text-low">{projectFindings.filter(f => f.status === 'fixed').length}</p>
            <p className="text-xs text-text-muted mt-1">Resolved</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-text-muted" /> Findings by Severity
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RPieChart>
                <Pie data={severityData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-text-muted" /> Findings by Suite
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={suiteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Findings Table */}
        {projectFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-muted" /> High-Priority Findings
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Severity</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Finding</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Suite</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">URL</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectFindings
                    .filter(f => f.severity === 'critical' || f.severity === 'high')
                    .map(finding => (
                      <tr key={finding.id} className="border-b border-border/50 hover:bg-surface/30">
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                            finding.severity === 'critical' ? 'bg-critical/10 text-critical' : 'bg-high/10 text-high'
                          }`}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-text-primary font-medium">{finding.title}</td>
                        <td className="py-2.5 px-3 text-text-secondary text-xs">{finding.suite.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 text-text-muted text-xs font-mono max-w-[200px] truncate">{finding.url}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs ${finding.status === 'open' ? 'text-critical' : finding.status === 'fixed' ? 'text-low' : 'text-text-muted'}`}>
                            {finding.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-6 p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
          <h4 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Key Recommendations
          </h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-critical mt-1">●</span>
              Immediately address all critical security findings, especially exposed environment files and injection vulnerabilities.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-high mt-1">●</span>
              Implement Content-Security-Policy headers and fix all accessibility violations to meet WCAG AA compliance.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-medium mt-1">●</span>
              Optimize performance bottlenecks: compress images, implement lazy loading, and reduce unused JavaScript.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-low mt-1">●</span>
              Fix broken internal links and add missing meta descriptions for improved SEO and user experience.
            </li>
          </ul>
        </div>
      </div>

      {/* Previous Reports */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Previous Reports</h3>
        <div className="space-y-2">
          {completedScans.map(scan => (
            <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-border transition-colors">
              <FileText className="w-4 h-4 text-text-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">{scan.targetUrl}</p>
                <p className="text-xs text-text-muted">
                  {new Date(scan.completedAt || '').toLocaleDateString()} • {scan.findingsSummary.critical + scan.findingsSummary.high + scan.findingsSummary.medium + scan.findingsSummary.low + scan.findingsSummary.info + scan.findingsSummary.warning} findings
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary border border-border rounded hover:border-border-light">PDF</button>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary border border-border rounded hover:border-border-light">HTML</button>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary border border-border rounded hover:border-border-light">JSON</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
