import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Monitor, Smartphone, Tablet, CheckCircle2, XCircle, AlertTriangle, Eye, ZoomIn, ZoomOut } from 'lucide-react';

const viewports = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, size: '1920x1080' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, size: '768x1024' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, size: '375x812' },
];

export default function VisualRegression() {
  const { visualDiffs } = useApp();
  const [selectedViewport, setSelectedViewport] = useState('1920x1080');
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'diff'>('side-by-side');

  const filteredDiffs = visualDiffs.filter(d => d.viewport === selectedViewport);
  const allDiffs = visualDiffs;

  const passed = allDiffs.filter(d => d.status === 'passed').length;
  const failed = allDiffs.filter(d => d.status === 'failed').length;
  const warnings = allDiffs.filter(d => d.status === 'warning').length;

  const selected = visualDiffs.find(d => d.id === selectedDiff);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Visual Regression</h1>
          <p className="text-sm text-text-secondary mt-1">Pixel-level comparison against baseline screenshots</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-surface-light border border-border hover:border-border-light text-text-secondary text-sm rounded-lg transition-colors">
            Update Baselines
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-low/5 border border-low/20 text-center">
          <CheckCircle2 className="w-6 h-6 text-low mx-auto mb-2" />
          <p className="text-2xl font-bold text-low">{passed}</p>
          <p className="text-xs text-text-muted">Passed</p>
        </div>
        <div className="p-4 rounded-xl bg-critical/5 border border-critical/20 text-center">
          <XCircle className="w-6 h-6 text-critical mx-auto mb-2" />
          <p className="text-2xl font-bold text-critical">{failed}</p>
          <p className="text-xs text-text-muted">Failed</p>
        </div>
        <div className="p-4 rounded-xl bg-medium/5 border border-medium/20 text-center">
          <AlertTriangle className="w-6 h-6 text-medium mx-auto mb-2" />
          <p className="text-2xl font-bold text-medium">{warnings}</p>
          <p className="text-xs text-text-muted">Warnings</p>
        </div>
      </div>

      {/* Viewport Filter */}
      <div className="flex items-center gap-2">
        {viewports.map(vp => (
          <button
            key={vp.id}
            onClick={() => setSelectedViewport(vp.size)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
              selectedViewport === vp.size
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'text-text-secondary border-border hover:border-border-light'
            }`}
          >
            <vp.icon className="w-4 h-4" /> {vp.label} ({vp.size})
          </button>
        ))}
        <button
          onClick={() => setSelectedViewport('all')}
          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
            selectedViewport === 'all'
              ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
              : 'text-text-secondary border-border hover:border-border-light'
          }`}
        >
          All Viewports
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-surface-light border border-border rounded-lg p-1 w-fit">
        {[
          { id: 'side-by-side', label: 'Side by Side' },
          { id: 'overlay', label: 'Overlay' },
          { id: 'diff', label: 'Diff Only' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === mode.id ? 'bg-primary-500/10 text-primary-400' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Visual Diffs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(selectedViewport === 'all' ? allDiffs : filteredDiffs).map(diff => (
          <div
            key={diff.id}
            onClick={() => setSelectedDiff(diff.id)}
            className={`bg-surface-light border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-border-light ${
              selectedDiff === diff.id ? 'border-primary-500/30 shadow-lg shadow-primary-500/5' : 'border-border'
            }`}
          >
            {/* Simulated Diff Preview */}
            <div className="relative h-40 bg-surface overflow-hidden">
              <div className="absolute inset-0 flex">
                {/* Baseline side */}
                <div className="w-1/2 border-r border-border/50 p-2">
                  <div className="h-full rounded bg-surface-lighter/50 flex items-center justify-center">
                    <div className="space-y-1.5 w-full px-2">
                      <div className="h-3 bg-surface-lighter rounded w-3/4" />
                      <div className="h-2 bg-surface-lighter rounded w-1/2" />
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        <div className="h-8 bg-surface-lighter rounded" />
                        <div className="h-8 bg-surface-lighter rounded" />
                        <div className="h-8 bg-surface-lighter rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Current side */}
                <div className="w-1/2 p-2">
                  <div className="h-full rounded bg-surface-lighter/50 flex items-center justify-center relative">
                    <div className="space-y-1.5 w-full px-2">
                      <div className="h-3 bg-surface-lighter rounded w-3/4" />
                      <div className="h-2 bg-surface-lighter rounded w-1/2" />
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        <div className="h-8 bg-surface-lighter rounded" />
                        <div className="h-8 bg-surface-lighter rounded" style={{ transform: 'translateX(3px)' }} />
                        <div className="h-8 bg-surface-lighter rounded" />
                      </div>
                    </div>
                    {/* Diff overlay */}
                    {diff.mismatchPercentage > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-8 right-4 w-12 h-8 bg-critical/30 border border-critical/50 rounded" />
                        {diff.mismatchPercentage > 5 && (
                          <div className="absolute bottom-4 left-2 w-16 h-4 bg-critical/20 border border-critical/40 rounded" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Status badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded ${
                diff.status === 'passed' ? 'bg-low/90 text-white' :
                diff.status === 'failed' ? 'bg-critical/90 text-white' : 'bg-medium/90 text-white'
              }`}>
                {diff.status.toUpperCase()}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs font-mono text-text-secondary truncate">{diff.url}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-muted">{diff.viewport}</span>
                <span className={`text-xs font-bold ${
                  diff.mismatchPercentage === 0 ? 'text-low' :
                  diff.mismatchPercentage < 5 ? 'text-medium' : 'text-critical'
                }`}>
                  {diff.mismatchPercentage}% diff
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-1">{new Date(diff.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDiff(null)}>
          <div className="w-full max-w-4xl bg-surface-light border border-border rounded-xl shadow-2xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Visual Diff Detail</h3>
                <p className="text-xs text-text-muted font-mono mt-0.5">{selected.url} • {selected.viewport}</p>
              </div>
              <button onClick={() => setSelectedDiff(null)} className="text-text-muted hover:text-text-primary text-sm">✕ Close</button>
            </div>

            {/* Comparison View */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="px-2 py-1 bg-surface text-xs text-text-muted font-medium">Baseline</div>
                <div className="h-48 bg-surface-lighter flex items-center justify-center">
                  <div className="space-y-2 w-full px-4">
                    <div className="h-4 bg-surface rounded w-3/4" />
                    <div className="h-3 bg-surface rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="h-12 bg-surface rounded" />
                      <div className="h-12 bg-surface rounded" />
                      <div className="h-12 bg-surface rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="px-2 py-1 bg-surface text-xs text-text-muted font-medium">Current</div>
                <div className="h-48 bg-surface-lighter flex items-center justify-center relative">
                  <div className="space-y-2 w-full px-4">
                    <div className="h-4 bg-surface rounded w-3/4" />
                    <div className="h-3 bg-surface rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="h-12 bg-surface rounded" />
                      <div className="h-12 bg-surface rounded" style={{ transform: 'translateX(5px)' }} />
                      <div className="h-12 bg-surface rounded" />
                    </div>
                  </div>
                  <div className="absolute top-12 right-8 w-16 h-12 bg-critical/20 border-2 border-critical/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="px-2 py-1 bg-surface text-xs text-text-muted font-medium">Diff</div>
                <div className="h-48 bg-surface-lighter flex items-center justify-center relative">
                  <div className="absolute top-12 right-8 w-16 h-12 bg-critical/40 border-2 border-critical rounded" />
                  {selected.mismatchPercentage > 5 && (
                    <div className="absolute bottom-8 left-6 w-20 h-6 bg-critical/30 border border-critical/60 rounded" />
                  )}
                  <p className="text-xs text-text-muted">Pixel differences highlighted</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
                <p className={`text-xl font-bold ${selected.mismatchPercentage === 0 ? 'text-low' : selected.mismatchPercentage < 5 ? 'text-medium' : 'text-critical'}`}>
                  {selected.mismatchPercentage}%
                </p>
                <p className="text-xs text-text-muted">Mismatch</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
                <p className="text-xl font-bold text-critical">{selected.missingPixels.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Missing Pixels</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-center">
                <p className="text-xl font-bold text-high">{selected.extraPixels.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Extra Pixels</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <button className="px-3 py-2 bg-low/10 text-low text-xs font-medium rounded-lg border border-low/20 hover:bg-low/20">
                ✓ Accept as New Baseline
              </button>
              <button className="px-3 py-2 bg-surface text-text-secondary text-xs font-medium rounded-lg border border-border hover:border-border-light">
                Ignore Region
              </button>
              <button className="px-3 py-2 bg-surface text-text-secondary text-xs font-medium rounded-lg border border-border hover:border-border-light">
                Re-run Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
