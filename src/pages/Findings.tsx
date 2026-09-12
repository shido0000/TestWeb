import { useState } from 'react';
import { useApp } from '../store/useStore';
import { AlertTriangle, Shield, Eye, Filter, CheckCircle2, XCircle, ExternalLink, Clock, ChevronRight } from 'lucide-react';
import type { Severity, FindingStatus, ScanSuite } from '../types';

const severityConfig: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: 'text-critical', bg: 'bg-critical/10', border: 'border-critical/20' },
  high: { color: 'text-high', bg: 'bg-high/10', border: 'border-high/20' },
  medium: { color: 'text-medium', bg: 'bg-medium/10', border: 'border-medium/20' },
  low: { color: 'text-low', bg: 'bg-low/10', border: 'border-low/20' },
  info: { color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  warning: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
};

const statusConfig: Record<FindingStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'text-critical' },
  accepted: { label: 'Accepted', color: 'text-medium' },
  false_positive: { label: 'False Positive', color: 'text-text-muted' },
  fixed: { label: 'Fixed', color: 'text-low' },
  retest: { label: 'Retest', color: 'text-info' },
};

const suiteLabels: Record<ScanSuite, string> = {
  console_errors: 'Console/Network',
  broken_links: 'Broken Links',
  accessibility: 'Accessibility',
  performance: 'Performance',
  security: 'Security',
  visual_regression: 'Visual Regression',
  seo: 'SEO',
  e2e: 'E2E Tests',
};

export default function Findings() {
  const { findings, updateFindingStatus } = useApp();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FindingStatus | 'all'>('all');
  const [suiteFilter, setSuiteFilter] = useState<ScanSuite | 'all'>('all');
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);

  const filtered = findings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (suiteFilter !== 'all' && f.suite !== suiteFilter) return false;
    return true;
  });

  const selected = findings.find(f => f.id === selectedFinding);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Findings</h1>
          <p className="text-sm text-text-secondary mt-1">{filtered.length} findings detected across all scans</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-light border border-border rounded-xl">
        <Filter className="w-4 h-4 text-text-muted" />
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value as any)}
          className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="false_positive">False Positive</option>
          <option value="fixed">Fixed</option>
          <option value="retest">Retest</option>
        </select>
        <select
          value={suiteFilter}
          onChange={e => setSuiteFilter(e.target.value as any)}
          className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Suites</option>
          <option value="security">Security</option>
          <option value="accessibility">Accessibility</option>
          <option value="performance">Performance</option>
          <option value="console_errors">Console/Network</option>
          <option value="broken_links">Broken Links</option>
          <option value="visual_regression">Visual Regression</option>
          <option value="seo">SEO</option>
          <option value="e2e">E2E Tests</option>
        </select>
        {(severityFilter !== 'all' || statusFilter !== 'all' || suiteFilter !== 'all') && (
          <button
            onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); setSuiteFilter('all'); }}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Findings List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-2">
          {filtered.map(finding => {
            const sev = severityConfig[finding.severity];
            const stat = statusConfig[finding.status];
            return (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFinding === finding.id
                    ? 'bg-surface-light border-primary-500/30 shadow-lg shadow-primary-500/5'
                    : 'bg-surface-light border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${sev.bg} border ${sev.border}`}>
                    <AlertTriangle className={`w-3.5 h-3.5 ${sev.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${sev.bg} ${sev.color} border ${sev.border}`}>
                        {finding.severity}
                      </span>
                      <span className={`text-[10px] font-medium ${stat.color}`}>
                        {stat.label}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">
                        {suiteLabels[finding.suite]}
                      </span>
                      {finding.cweId && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">
                          {finding.cweId}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mt-1.5">{finding.title}</h4>
                    <p className="text-xs text-text-muted mt-1 font-mono truncate">{finding.url}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-text-muted">Risk: {finding.riskScore}</div>
                    <ChevronRight className="w-4 h-4 text-text-muted mt-1" />
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
                <h3 className="text-sm font-semibold text-text-primary">Finding Details</h3>
                <button onClick={() => setSelectedFinding(null)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-base font-semibold text-text-primary">{selected.title}</h4>
                <p className="text-xs text-text-muted font-mono mt-1">{selected.url}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-[10px] text-text-muted uppercase">Severity</p>
                  <p className={`text-sm font-bold ${severityConfig[selected.severity].color}`}>{selected.severity.toUpperCase()}</p>
                </div>
                <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-[10px] text-text-muted uppercase">Risk Score</p>
                  <p className="text-sm font-bold text-text-primary">{selected.riskScore}/100</p>
                </div>
                <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-[10px] text-text-muted uppercase">Suite</p>
                  <p className="text-sm font-medium text-text-primary">{suiteLabels[selected.suite]}</p>
                </div>
                <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-[10px] text-text-muted uppercase">Status</p>
                  <p className={`text-sm font-medium ${statusConfig[selected.status].color}`}>{statusConfig[selected.status].label}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-1">Description</p>
                <p className="text-sm text-text-secondary">{selected.description}</p>
              </div>

              {selected.evidence && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">Evidence</p>
                  <div className="p-3 rounded-lg bg-surface border border-border font-mono text-xs text-text-secondary">
                    {selected.evidence}
                  </div>
                </div>
              )}

              {selected.recommendation && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">Recommendation</p>
                  <p className="text-sm text-text-secondary">{selected.recommendation}</p>
                </div>
              )}

              {selected.wcagCriteria && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">WCAG Criteria</p>
                  <span className="px-2 py-1 text-xs bg-info/10 text-info rounded border border-info/20">{selected.wcagCriteria}</span>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['open', 'accepted', 'false_positive', 'fixed', 'retest'] as FindingStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateFindingStatus(selected.id, status)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        selected.status === status
                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                          : 'text-text-secondary border-border hover:border-border-light'
                      }`}
                    >
                      {statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                  <ExternalLink className="w-3 h-3" /> Open URL
                </a>
                <span className="text-text-muted">•</span>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" /> {new Date(selected.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="sticky top-0 bg-surface-light border border-border rounded-xl p-8 text-center">
              <Eye className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Select a finding to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
