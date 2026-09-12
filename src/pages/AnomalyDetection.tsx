import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Activity, Layout, Palette, Type, EyeOff, Plus, Ruler, Move, Smartphone, CheckCircle2, AlertTriangle, Clock, XCircle, Filter, ArrowRight } from 'lucide-react';
import type { AnomalyType, AnomalySeverity } from '../types';

const typeConfig: Record<AnomalyType, { icon: any; label: string; color: string; description: string }> = {
  layout_shift: { icon: Layout, label: 'Layout Shift', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', description: 'Elements moved from expected position' },
  color_drift: { icon: Palette, label: 'Color Drift', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', description: 'Colors changed outside design system' },
  typography_mismatch: { icon: Type, label: 'Typography', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', description: 'Font family/size/weight changed' },
  missing_element: { icon: EyeOff, label: 'Missing Element', color: 'bg-critical/10 text-critical border-critical/20', description: 'Expected element not found' },
  new_element: { icon: Plus, label: 'New Element', color: 'bg-info/10 text-info border-info/20', description: 'Unexpected element appeared' },
  spacing_anomaly: { icon: Ruler, label: 'Spacing', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20', description: 'Padding/margin outside design tokens' },
  motion_anomaly: { icon: Move, label: 'Motion', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', description: 'Animation timing/behavior changed' },
  responsive_break: { icon: Smartphone, label: 'Responsive', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', description: 'Layout breaks at specific viewport' },
};

const severityConfig: Record<AnomalySeverity, { color: string; bg: string }> = {
  critical: { color: 'text-critical', bg: 'bg-critical/10 border-critical/20' },
  major: { color: 'text-high', bg: 'bg-high/10 border-high/20' },
  minor: { color: 'text-medium', bg: 'bg-medium/10 border-medium/20' },
  cosmetic: { color: 'text-text-muted', bg: 'bg-surface border-border' },
};

const statusIcons = {
  new: AlertTriangle,
  acknowledged: Clock,
  resolved: CheckCircle2,
  ignored: XCircle,
};

export default function AnomalyDetection() {
  const { visualAnomalies, updateAnomalyStatus } = useApp();
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(visualAnomalies[0]?.id || null);

  const filtered = visualAnomalies.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const selected = visualAnomalies.find(a => a.id === selectedAnomaly);

  const stats = {
    total: visualAnomalies.length,
    new: visualAnomalies.filter(a => a.status === 'new').length,
    critical: visualAnomalies.filter(a => a.severity === 'critical').length,
    avgConfidence: Math.round(visualAnomalies.reduce((s, a) => s + a.confidence, 0) / visualAnomalies.length),
  };

  // Type distribution
  const typeDistribution = Object.entries(typeConfig).map(([type, config]) => ({
    type: type as AnomalyType,
    label: config.label,
    count: visualAnomalies.filter(a => a.type === type).length,
    color: config.color,
  })).filter(t => t.count > 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary-400" />
            Anomaly Detection
          </h1>
          <p className="text-sm text-text-secondary mt-1">AI-powered detection of visual, layout, and behavioral anomalies</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg">
          <Activity className="w-4 h-4 text-primary-400 animate-pulse" />
          <span className="text-xs font-medium text-primary-400">Monitoring 47 pages • Real-time</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-light border border-border">
          <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-xs text-text-muted mt-1">Total Anomalies</p>
        </div>
        <div className="p-5 rounded-xl bg-critical/5 border border-critical/20">
          <p className="text-3xl font-bold text-critical">{stats.new}</p>
          <p className="text-xs text-text-muted mt-1">New (Unreviewed)</p>
        </div>
        <div className="p-5 rounded-xl bg-high/5 border border-high/20">
          <p className="text-3xl font-bold text-high">{stats.critical}</p>
          <p className="text-xs text-text-muted mt-1">Critical Severity</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-light border border-border">
          <p className="text-3xl font-bold text-text-primary">{stats.avgConfidence}%</p>
          <p className="text-xs text-text-muted mt-1">Avg Confidence</p>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Anomaly Types Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {typeDistribution.map(t => {
            const config = typeConfig[t.type];
            const Icon = config.icon;
            return (
              <button
                key={t.type}
                onClick={() => setTypeFilter(typeFilter === t.type ? 'all' : t.type)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  typeFilter === t.type ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surface/50 border-border/50 hover:border-border'
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${config.color.split(' ')[1]}`} />
                <p className="text-lg font-bold text-text-primary">{t.count}</p>
                <p className="text-[10px] text-text-muted">{config.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-text-muted" />
        {(['all', 'critical', 'major', 'minor', 'cosmetic'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              severityFilter === sev
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'text-text-secondary border-border hover:border-border-light'
            }`}
          >
            {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
          </button>
        ))}
        {(typeFilter !== 'all' || severityFilter !== 'all') && (
          <button
            onClick={() => { setTypeFilter('all'); setSeverityFilter('all'); }}
            className="text-xs text-primary-400 hover:text-primary-300 ml-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Anomalies List */}
        <div className="xl:col-span-2 space-y-2">
          {filtered.map(anomaly => {
            const config = typeConfig[anomaly.type];
            const sev = severityConfig[anomaly.severity];
            const StatusIcon = statusIcons[anomaly.status];
            const Icon = config.icon;
            return (
              <div
                key={anomaly.id}
                onClick={() => setSelectedAnomaly(anomaly.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAnomaly === anomaly.id
                    ? 'bg-primary-500/5 border-primary-500/30'
                    : 'bg-surface-light border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${sev.bg} ${sev.color}`}>
                        {anomaly.severity}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">
                        {config.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-text-muted">
                        <StatusIcon className="w-3 h-3" /> {anomaly.status}
                      </span>
                      <span className="text-[10px] text-text-muted ml-auto">{anomaly.confidence}% confidence</span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary">{anomaly.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{anomaly.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="font-mono truncate max-w-[200px]">{anomaly.url.replace(/^https?:\/\/[^/]+/, '')}</span>
                      <span>•</span>
                      <span>{anomaly.viewport}</span>
                      {anomaly.introducedAt && (
                        <>
                          <span>•</span>
                          <span>Introduced {new Date(anomaly.introducedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-0 bg-surface-light border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${typeConfig[selected.type].color}`}>
                  {typeConfig[selected.type].label}
                </span>
                <span className="text-xs text-text-muted">{selected.confidence}% confidence</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary">{selected.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{selected.description}</p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-[10px] text-text-muted uppercase mb-1">Baseline</p>
                  <p className="text-xs text-text-primary font-mono break-all">{selected.baselineValue}</p>
                </div>
                <div className="p-3 rounded-lg bg-critical/5 border border-critical/20">
                  <p className="text-[10px] text-text-muted uppercase mb-1">Current</p>
                  <p className="text-xs text-text-primary font-mono break-all">{selected.currentValue}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-medium/5 border border-medium/20">
                <p className="text-[10px] text-text-muted uppercase mb-1">Delta</p>
                <p className="text-sm font-bold text-medium">{selected.delta}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-low" />
                  <span className="text-text-muted">Detected:</span>
                  <span className="text-text-primary">{new Date(selected.detectedAt).toLocaleString()}</span>
                </div>
                {selected.introducedAt && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-critical" />
                    <span className="text-text-muted">Introduced:</span>
                    <span className="text-text-primary">{new Date(selected.introducedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Affected Elements */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Affected Elements</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.affectedElements.map((el, i) => (
                    <code key={i} className="px-2 py-1 text-xs bg-surface border border-border rounded font-mono text-text-secondary">{el}</code>
                  ))}
                </div>
              </div>

              {/* Simulated Heatmap */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Change Heatmap</p>
                <div className="relative h-32 bg-surface rounded-lg border border-border overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-0.5 p-2">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            backgroundColor: intensity > 0.7 ? 'rgba(239, 68, 68, 0.6)' :
                              intensity > 0.4 ? 'rgba(234, 179, 8, 0.4)' :
                              intensity > 0.2 ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-text-muted">
                    <div className="w-2 h-2 rounded-sm bg-blue-500/30" /> Low
                    <div className="w-2 h-2 rounded-sm bg-yellow-500/40 ml-1" /> Med
                    <div className="w-2 h-2 rounded-sm bg-red-500/60 ml-1" /> High
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['new', 'acknowledged', 'resolved', 'ignored'] as const).map(status => {
                    const Icon = statusIcons[status];
                    return (
                      <button
                        key={status}
                        onClick={() => updateAnomalyStatus(selected.id, status)}
                        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded border transition-colors ${
                          selected.status === status
                            ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                            : 'text-text-secondary border-border hover:border-border-light'
                        }`}
                      >
                        <Icon className="w-3 h-3" /> {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-0 bg-surface-light border border-border rounded-xl p-8 text-center">
              <Activity className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Select an anomaly to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
