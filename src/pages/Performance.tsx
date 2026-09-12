import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Gauge, Clock, Zap, Image, Code, Database, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function getScoreColor(score: number) {
  if (score >= 90) return 'text-low';
  if (score >= 50) return 'text-medium';
  return 'text-critical';
}

function getScoreBg(score: number) {
  if (score >= 90) return 'bg-low/10 border-low/20';
  if (score >= 50) return 'bg-medium/10 border-medium/20';
  return 'bg-critical/10 border-critical/20';
}

function getMetricRating(value: number, thresholds: { good: number; needsImprovement: number }): { label: string; color: string } {
  if (value <= thresholds.good) return { label: 'Good', color: 'text-low' };
  if (value <= thresholds.needsImprovement) return { label: 'Needs Improvement', color: 'text-medium' };
  return { label: 'Poor', color: 'text-critical' };
}

export default function Performance() {
  const { performanceMetrics } = useApp();
  const [selectedUrl, setSelectedUrl] = useState(performanceMetrics[0]?.url || '');

  const metrics = performanceMetrics.find(m => m.url === selectedUrl) || performanceMetrics[0];
  if (!metrics) return null;

  const radarData = [
    { subject: 'Performance', value: metrics.performanceScore },
    { subject: 'Accessibility', value: metrics.accessibilityScore },
    { subject: 'Best Practices', value: metrics.bestPracticesScore },
    { subject: 'SEO', value: metrics.seoScore },
    { subject: 'PWA', value: metrics.pwaScore },
  ];

  const resourceData = metrics.resources.map(r => ({
    name: r.type,
    transfer: Math.round(r.transferSize / 1024),
    size: Math.round(r.resourceSize / 1024),
  }));

  const coreWebVitals = [
    { name: 'FCP', value: metrics.fcp, unit: 'ms', thresholds: { good: 1800, needsImprovement: 3000 }, desc: 'First Contentful Paint' },
    { name: 'LCP', value: metrics.lcp, unit: 'ms', thresholds: { good: 2500, needsImprovement: 4000 }, desc: 'Largest Contentful Paint' },
    { name: 'FID', value: metrics.fid, unit: 'ms', thresholds: { good: 100, needsImprovement: 300 }, desc: 'First Input Delay' },
    { name: 'CLS', value: metrics.cls, unit: '', thresholds: { good: 0.1, needsImprovement: 0.25 }, desc: 'Cumulative Layout Shift' },
    { name: 'TTFB', value: metrics.ttfb, unit: 'ms', thresholds: { good: 800, needsImprovement: 1800 }, desc: 'Time to First Byte' },
    { name: 'TBT', value: metrics.totalBlockingTime, unit: 'ms', thresholds: { good: 200, needsImprovement: 600 }, desc: 'Total Blocking Time' },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Performance</h1>
          <p className="text-sm text-text-secondary mt-1">Lighthouse audit results and Core Web Vitals analysis</p>
        </div>
        <select
          value={selectedUrl}
          onChange={e => setSelectedUrl(e.target.value)}
          className="px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
        >
          {performanceMetrics.map(m => (
            <option key={m.url} value={m.url}>{m.url}</option>
          ))}
        </select>
      </div>

      {/* Lighthouse Scores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Performance', score: metrics.performanceScore, icon: Gauge },
          { label: 'Accessibility', score: metrics.accessibilityScore, icon: CheckCircle2 },
          { label: 'Best Practices', score: metrics.bestPracticesScore, icon: Code },
          { label: 'SEO', score: metrics.seoScore, icon: TrendingUp },
          { label: 'PWA', score: metrics.pwaScore, icon: Zap },
        ].map(item => (
          <div key={item.label} className={`p-4 rounded-xl border text-center ${getScoreBg(item.score)}`}>
            <item.icon className={`w-5 h-5 mx-auto mb-2 ${getScoreColor(item.score)}`} />
            <div className={`text-3xl font-bold ${getScoreColor(item.score)}`}>{item.score}</div>
            <p className="text-xs text-text-muted mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Core Web Vitals */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-400" /> Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coreWebVitals.map(metric => {
            const rating = getMetricRating(metric.value, metric.thresholds);
            return (
              <div key={metric.name} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted uppercase">{metric.name}</span>
                  <span className={`text-xs font-bold ${rating.color}`}>{rating.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {metric.value}{metric.unit && <span className="text-sm text-text-muted ml-1">{metric.unit}</span>}
                </p>
                <p className="text-xs text-text-muted mt-1">{metric.desc}</p>
                <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rating.color === 'text-low' ? 'bg-low' : rating.color === 'text-medium' ? 'bg-medium' : 'bg-critical'
                    }`}
                    style={{ width: `${Math.min(100, (metric.value / (metric.thresholds.needsImprovement * 1.5)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Lighthouse Scores Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Breakdown */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Resource Weight (KB transferred)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="transfer" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Transfer Size (KB)" />
              <Bar dataKey="size" fill="#6366f1" radius={[4, 4, 0, 0]} name="Resource Size (KB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Page Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <Image className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-text-primary">{(metrics.totalWeight / 1024 / 1024).toFixed(1)} MB</p>
          <p className="text-xs text-text-muted">Total Page Weight</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <Database className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-text-primary">{metrics.requests}</p>
          <p className="text-xs text-text-muted">Total Requests</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <Code className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-text-primary">{metrics.domNodes}</p>
          <p className="text-xs text-text-muted">DOM Nodes</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <Clock className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-text-primary">{(metrics.jsExecutionTime / 1000).toFixed(1)}s</p>
          <p className="text-xs text-text-muted">JS Execution Time</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-medium" /> Performance Recommendations
        </h3>
        <div className="space-y-3">
          {[
            { severity: 'high', title: 'Serve images in next-gen formats', impact: 'Save 1.8 MB', desc: 'Convert PNG/JPEG images to WebP or AVIF for 30-50% size reduction' },
            { severity: 'high', title: 'Eliminate render-blocking resources', impact: 'Save 1.2s', desc: 'Defer non-critical CSS/JS and inline critical styles' },
            { severity: 'medium', title: 'Reduce unused JavaScript', impact: 'Save 45 KB', desc: 'Remove dead code and implement tree-shaking' },
            { severity: 'medium', title: 'Enable text compression', impact: 'Save 180 KB', desc: 'Enable Brotli or Gzip compression on server' },
            { severity: 'low', title: 'Preconnect to required origins', impact: 'Save 200ms', desc: 'Add <link rel="preconnect"> for critical third-party origins' },
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50 border border-border/50">
              <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                rec.severity === 'high' ? 'bg-high/10 text-high' : rec.severity === 'medium' ? 'bg-medium/10 text-medium' : 'bg-low/10 text-low'
              }`}>{rec.severity}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{rec.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{rec.desc}</p>
              </div>
              <span className="text-xs font-medium text-primary-400">{rec.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
