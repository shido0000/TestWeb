import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Play, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle, Zap, Eye, ChevronDown } from 'lucide-react';
import type { ScanSuite } from '../types';

const suiteLabels: Record<ScanSuite, string> = {
  console_errors: 'Console & Network Errors',
  broken_links: 'Broken Links & SEO',
  accessibility: 'Accessibility (WCAG)',
  performance: 'Performance (Lighthouse)',
  security: 'Security Headers & Vulns',
  visual_regression: 'Visual Regression',
  seo: 'SEO Audit',
  e2e: 'E2E Functional Tests',
};

const suiteDescriptions: Record<ScanSuite, string> = {
  console_errors: 'Capture JS errors, console warnings, failed requests, CORS issues',
  broken_links: 'Verify internal/external links, check meta tags, sitemap, robots.txt',
  accessibility: 'axe-core integration, WCAG AA/AAA, color contrast, daltonism simulation',
  performance: 'Core Web Vitals, Lighthouse audit, resource weight analysis',
  security: 'Security headers, SSL/TLS, OWASP ZAP baseline, Nuclei templates',
  visual_regression: 'Screenshot comparison, pixel diff, layout shift detection',
  seo: 'Meta tags, structured data, Open Graph, sitemap validation',
  e2e: 'Run user-defined flows with Playwright: login, checkout, forms',
};

export default function Scans() {
  const { scans, targets, projects, startScan } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedSuites, setSelectedSuites] = useState<ScanSuite[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const handleStartScan = () => {
    if (!selectedTarget || selectedSuites.length === 0) return;
    const target = targets.find(t => t.id === selectedTarget);
    if (!target) return;
    startScan({
      projectId: target.projectId,
      targetId: target.id,
      targetUrl: target.url,
      suites: selectedSuites,
      startedAt: new Date().toISOString(),
      triggeredBy: 'Alex Rivera',
    });
    setSelectedTarget('');
    setSelectedSuites([]);
    setShowModal(false);
  };

  const toggleSuite = (suite: ScanSuite) => {
    setSelectedSuites(prev =>
      prev.includes(suite) ? prev.filter(s => s !== suite) : [...prev, suite]
    );
  };

  const selectAllSuites = () => {
    const allSuites: ScanSuite[] = ['console_errors', 'broken_links', 'accessibility', 'performance', 'security', 'visual_regression', 'seo', 'e2e'];
    setSelectedSuites(selectedSuites.length === allSuites.length ? [] : allSuites);
  };

  const filteredScans = filter === 'all' ? scans : scans.filter(s => s.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-low" />;
      case 'running': return <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-critical" />;
      default: return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Scans</h1>
          <p className="text-sm text-text-secondary mt-1">Launch and monitor automated test suites</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20"
        >
          <Play className="w-4 h-4" /> New Scan
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'running', 'completed', 'pending', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === f
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'text-text-secondary border-border hover:border-border-light hover:text-text-primary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${scans.length})`}
          </button>
        ))}
      </div>

      {/* Scans List */}
      <div className="space-y-3">
        {filteredScans.map(scan => (
          <div key={scan.id} className="bg-surface-light border border-border rounded-xl p-5 hover:border-border-light transition-all">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                scan.status === 'completed' ? 'bg-low/10' :
                scan.status === 'running' ? 'bg-primary-400/10' :
                scan.status === 'failed' ? 'bg-critical/10' : 'bg-surface-lighter'
              }`}>
                <Zap className={`w-5 h-5 ${
                  scan.status === 'completed' ? 'text-low' :
                  scan.status === 'running' ? 'text-primary-400' :
                  scan.status === 'failed' ? 'text-critical' : 'text-text-muted'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-text-primary font-mono">{scan.targetUrl}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    scan.status === 'completed' ? 'bg-low/10 text-low' :
                    scan.status === 'running' ? 'bg-primary-400/10 text-primary-400' :
                    scan.status === 'failed' ? 'bg-critical/10 text-critical' : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    {statusIcon(scan.status)} {scan.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <span>Triggered by: {scan.triggeredBy}</span>
                  <span>{scan.suites.length} suites</span>
                  <span>{scan.pagesScanned} pages scanned</span>
                  {scan.duration && <span>Duration: {Math.round(scan.duration / 60)}min</span>}
                </div>

                {/* Progress bar for running scans */}
                {scan.status === 'running' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{scan.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                        style={{ width: `${scan.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Suites */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {scan.suites.map(suite => (
                    <span key={suite} className="px-2 py-0.5 text-xs bg-surface border border-border rounded text-text-secondary">
                      {suiteLabels[suite]}
                    </span>
                  ))}
                </div>

                {/* Findings Summary */}
                {scan.status !== 'pending' && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-text-muted font-medium">Findings:</span>
                    {scan.findingsSummary.critical > 0 && (
                      <span className="flex items-center gap-1 text-xs text-critical font-medium">
                        <AlertTriangle className="w-3 h-3" /> {scan.findingsSummary.critical} critical
                      </span>
                    )}
                    {scan.findingsSummary.high > 0 && (
                      <span className="text-xs text-high font-medium">{scan.findingsSummary.high} high</span>
                    )}
                    {scan.findingsSummary.medium > 0 && (
                      <span className="text-xs text-medium font-medium">{scan.findingsSummary.medium} medium</span>
                    )}
                    {scan.findingsSummary.low > 0 && (
                      <span className="text-xs text-low font-medium">{scan.findingsSummary.low} low</span>
                    )}
                    {scan.findingsSummary.info > 0 && (
                      <span className="text-xs text-info font-medium">{scan.findingsSummary.info} info</span>
                    )}
                  </div>
                )}
              </div>

              <button className="p-2 text-text-muted hover:text-primary-400 rounded-lg hover:bg-surface-lighter transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Scan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface-light border border-border rounded-xl shadow-2xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-text-primary mb-1">Launch New Scan</h2>
            <p className="text-xs text-text-secondary mb-5">Select a target and the test suites to run</p>

            {/* Target Selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Target</label>
              <select
                value={selectedTarget}
                onChange={e => setSelectedTarget(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
              >
                <option value="">Select a target...</option>
                {targets.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.url}</option>
                ))}
              </select>
            </div>

            {/* Suite Selection */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Test Suites</label>
                <button onClick={selectAllSuites} className="text-xs text-primary-400 hover:text-primary-300">
                  {selectedSuites.length === 7 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(Object.entries(suiteLabels) as [ScanSuite, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleSuite(key)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedSuites.includes(key)
                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                        : 'bg-surface border-border hover:border-border-light text-text-secondary'
                    }`}
                  >
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{suiteDescriptions[key]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-lighter">Cancel</button>
              <button
                onClick={handleStartScan}
                disabled={!selectedTarget || selectedSuites.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" /> Launch Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
