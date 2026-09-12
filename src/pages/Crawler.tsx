import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Globe, Link2, FileText, AlertTriangle, CheckCircle2, XCircle, Clock, Search, Filter, ChevronRight, ChevronDown, TreePine } from 'lucide-react';

export default function Crawler() {
  const { crawlResults, targets } = useApp();
  const [selectedTarget, setSelectedTarget] = useState('t1');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['c1']));
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'table'>('tree');
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | '404' | 'other'>('all');

  const filteredResults = crawlResults.filter(r => {
    if (statusFilter === '200') return r.status === 200;
    if (statusFilter === '404') return r.status === 404;
    if (statusFilter === 'other') return r.status !== 200 && r.status !== 404;
    return true;
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLinks = filteredResults.reduce((sum, r) => sum + r.linksFound, 0);
  const totalForms = filteredResults.reduce((sum, r) => sum + r.forms, 0);
  const avgLoadTime = filteredResults.length > 0 ? Math.round(filteredResults.reduce((sum, r) => sum + r.loadTime, 0) / filteredResults.length) : 0;
  const errorPages = filteredResults.filter(r => r.status >= 400).length;

  const renderTreeNode = (result: typeof crawlResults[0], depth: number = 0) => {
    const children = crawlResults.filter(r => result.children.includes(r.id));
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(result.id);

    return (
      <div key={result.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-surface/30 cursor-pointer transition-colors group"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => hasChildren && toggleNode(result.id)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <span className="w-3.5" />
          )}
          <Globe className={`w-3.5 h-3.5 ${result.status === 200 ? 'text-low' : result.status === 404 ? 'text-critical' : 'text-medium'}`} />
          <span className="text-xs text-text-primary font-mono truncate flex-1">{result.url.replace(/^https?:\/\/[^/]+/, '')}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            result.status === 200 ? 'bg-low/10 text-low' : result.status === 404 ? 'bg-critical/10 text-critical' : 'bg-medium/10 text-medium'
          }`}>{result.status}</span>
          <span className="text-[10px] text-text-muted hidden group-hover:inline">{result.linksFound} links</span>
          <span className="text-[10px] text-text-muted hidden group-hover:inline">{result.loadTime}ms</span>
        </div>
        {isExpanded && children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  const rootNodes = filteredResults.filter(r => r.depth === 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Crawler & Discovery</h1>
          <p className="text-sm text-text-secondary mt-1">Site map, discovered routes, forms, and resources</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTarget}
            onChange={e => setSelectedTarget(e.target.value)}
            className="px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
          >
            {targets.map(t => (
              <option key={t.id} value={t.id}>{t.name} — {t.url}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <TreePine className="w-4 h-4" /> Re-crawl
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-2xl font-bold text-text-primary">{filteredResults.length}</p>
          <p className="text-xs text-text-muted">Pages Found</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-2xl font-bold text-primary-400">{totalLinks}</p>
          <p className="text-xs text-text-muted">Total Links</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-2xl font-bold text-text-primary">{totalForms}</p>
          <p className="text-xs text-text-muted">Forms Found</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-2xl font-bold text-text-primary">{avgLoadTime}ms</p>
          <p className="text-xs text-text-muted">Avg Load Time</p>
        </div>
        <div className="p-4 rounded-xl bg-critical/5 border border-critical/20 text-center">
          <p className="text-2xl font-bold text-critical">{errorPages}</p>
          <p className="text-xs text-text-muted">Error Pages</p>
        </div>
      </div>

      {/* View Mode & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-surface-light border border-border rounded-lg p-1">
          {[
            { id: 'tree', label: 'Tree', icon: TreePine },
            { id: 'list', label: 'List', icon: FileText },
            { id: 'table', label: 'Table', icon: Filter },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === mode.id ? 'bg-primary-500/10 text-primary-400' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <mode.icon className="w-3.5 h-3.5" /> {mode.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {(['all', '200', '404', 'other'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                  : 'text-text-secondary border-border hover:border-border-light'
              }`}
            >
              {status === 'all' ? 'All' : status === 'other' ? 'Errors' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tree View */}
      {viewMode === 'tree' && (
        <div className="bg-surface-light border border-border rounded-xl p-4">
          <div className="space-y-0.5">
            {rootNodes.map(node => renderTreeNode(node))}
          </div>
          {filteredResults.filter(r => r.depth > 0 && !crawlResults.some(pr => pr.children.includes(r.id))).map(r => (
            <div key={r.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-surface/30" style={{ paddingLeft: '28px' }}>
              <span className="w-3.5" />
              <Globe className={`w-3.5 h-3.5 ${r.status === 200 ? 'text-low' : 'text-critical'}`} />
              <span className="text-xs text-text-primary font-mono truncate">{r.url.replace(/^https?:\/\/[^/]+/, '')}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.status === 200 ? 'bg-low/10 text-low' : 'bg-critical/10 text-critical'}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-surface-light border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">URL</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Depth</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Links</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Forms</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Load Time</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(result => (
                  <tr key={result.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="text-xs font-mono text-text-primary">{result.url.replace(/^https?:\/\/[^/]+/, '')}</span>
                      {result.title && <p className="text-[10px] text-text-muted mt-0.5">{result.title}</p>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        result.status === 200 ? 'bg-low/10 text-low' : result.status === 404 ? 'bg-critical/10 text-critical' : 'bg-medium/10 text-medium'
                      }`}>{result.status}</span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-text-secondary">{result.depth}</td>
                    <td className="py-2.5 px-4 text-xs text-text-secondary">{result.linksFound}</td>
                    <td className="py-2.5 px-4 text-xs text-text-secondary">{result.forms}</td>
                    <td className="py-2.5 px-4 text-xs text-text-secondary">{result.loadTime}ms</td>
                    <td className="py-2.5 px-4 text-xs text-text-muted">{result.contentType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredResults.map(result => (
            <div key={result.id} className="bg-surface-light border border-border rounded-lg p-3 hover:border-border-light transition-all">
              <div className="flex items-center gap-3">
                <Globe className={`w-4 h-4 ${result.status === 200 ? 'text-low' : result.status === 404 ? 'text-critical' : 'text-medium'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-text-primary truncate">{result.url}</p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      result.status === 200 ? 'bg-low/10 text-low' : result.status === 404 ? 'bg-critical/10 text-critical' : 'bg-medium/10 text-medium'
                    }`}>{result.status}</span>
                  </div>
                  {result.title && <p className="text-xs text-text-muted mt-0.5">{result.title}</p>}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>Depth: {result.depth}</span>
                  <span>{result.linksFound} links</span>
                  <span>{result.forms} forms</span>
                  <span>{result.loadTime}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crawl Config */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Crawl Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Max Depth</p>
            <p className="text-sm font-bold text-text-primary mt-1">5</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Rate Limit</p>
            <p className="text-sm font-bold text-text-primary mt-1">10 req/s</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Respect robots.txt</p>
            <p className="text-sm font-bold text-low mt-1">Yes</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">SPA Support</p>
            <p className="text-sm font-bold text-low mt-1">Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
