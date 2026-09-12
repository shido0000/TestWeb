import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Plus, Globe, Lock, Trash2, Server, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export default function Targets() {
  const { targets, projects, addTarget, deleteTarget } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTarget, setNewTarget] = useState({
    projectId: '', url: '', name: '', environment: 'production' as const,
    authRequired: false, maxDepth: 3, allowedDomains: '', excludedPaths: '',
  });

  const handleCreate = () => {
    if (!newTarget.name || !newTarget.url || !newTarget.projectId) return;
    addTarget({
      projectId: newTarget.projectId,
      url: newTarget.url,
      name: newTarget.name,
      environment: newTarget.environment,
      authRequired: newTarget.authRequired,
      scope: {
        allowedDomains: newTarget.allowedDomains.split(',').map(d => d.trim()).filter(Boolean),
        excludedPaths: newTarget.excludedPaths.split(',').map(p => p.trim()).filter(Boolean),
        maxDepth: newTarget.maxDepth,
      },
    });
    setNewTarget({ projectId: '', url: '', name: '', environment: 'production', authRequired: false, maxDepth: 3, allowedDomains: '', excludedPaths: '' });
    setShowModal(false);
  };

  const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || 'Unknown';

  const envColors = {
    production: 'bg-low/10 text-low border-low/20',
    staging: 'bg-medium/10 text-medium border-medium/20',
    development: 'bg-info/10 text-info border-info/20',
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Objetivos</h1>
          <p className="text-sm text-text-secondary mt-1">Configura aplicaciones web y endpoints a probar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" /> Agregar Objetivo
        </button>
      </div>

      {/* Advertencia de Autorización */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-400">Autorización Requerida</p>
          <p className="text-xs text-text-secondary mt-1">
            Solo escanea sistemas que tengas autorización explícita para probar. El escaneo no autorizado puede violar leyes y términos de servicio.
          </p>
        </div>
      </div>

      {/* Targets List */}
      <div className="space-y-3">
        {targets.map(target => (
          <div key={target.id} className="bg-surface-light border border-border rounded-xl overflow-hidden hover:border-border-light transition-all">
            <div className="flex items-center gap-4 p-4">
              <div className="p-2.5 rounded-lg bg-primary-500/10">
                <Globe className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">{target.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${envColors[target.environment]}`}>
                    {target.environment}
                  </span>
                  {target.authRequired && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-warning/10 text-warning rounded-full border border-warning/20">
                      <Lock className="w-2.5 h-2.5" /> Auth
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1 font-mono">{target.url}</p>
                <p className="text-xs text-text-muted mt-0.5">Project: {getProjectName(target.projectId)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === target.id ? null : target.id)}
                  className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-lighter transition-colors"
                >
                  {expandedId === target.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteTarget(target.id)}
                  className="p-2 text-text-muted hover:text-critical rounded-lg hover:bg-surface-lighter transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === target.id && (
              <div className="px-4 pb-4 border-t border-border pt-4 animate-slide-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                    <p className="text-xs font-medium text-text-muted uppercase mb-2">Scope Configuration</p>
                    <div className="space-y-1.5">
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Max Depth:</span> {target.scope.maxDepth}
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Allowed Domains:</span> {target.scope.allowedDomains.join(', ') || 'All'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Excluded Paths:</span> {target.scope.excludedPaths.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                    <p className="text-xs font-medium text-text-muted uppercase mb-2">Authentication</p>
                    <div className="space-y-1.5">
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Required:</span> {target.authRequired ? 'Yes' : 'No'}
                      </p>
                      {target.headers && (
                        <p className="text-xs text-text-secondary">
                          <span className="text-text-muted">Headers:</span> {Object.keys(target.headers).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                    <p className="text-xs font-medium text-text-muted uppercase mb-2">Crawl Settings</p>
                    <div className="space-y-1.5">
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Respect robots.txt:</span> Yes
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">Rate Limit:</span> 10 req/s
                      </p>
                      <p className="text-xs text-text-secondary">
                        <span className="text-text-muted">SPA Support:</span> Enabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Target Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface-light border border-border rounded-xl shadow-2xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Add New Target</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Project</label>
                <select
                  value={newTarget.projectId}
                  onChange={e => setNewTarget(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Target Name</label>
                  <input
                    type="text"
                    value={newTarget.name}
                    onChange={e => setNewTarget(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Production Store"
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Environment</label>
                  <select
                    value={newTarget.environment}
                    onChange={e => setNewTarget(p => ({ ...p, environment: e.target.value as any }))}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">URL</label>
                <input
                  type="url"
                  value={newTarget.url}
                  onChange={e => setNewTarget(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Max Crawl Depth</label>
                  <input
                    type="number"
                    value={newTarget.maxDepth}
                    onChange={e => setNewTarget(p => ({ ...p, maxDepth: parseInt(e.target.value) || 3 }))}
                    min={1}
                    max={10}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTarget.authRequired}
                      onChange={e => setNewTarget(p => ({ ...p, authRequired: e.target.checked }))}
                      className="w-4 h-4 rounded border-border bg-surface text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-text-secondary">Requires Authentication</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Allowed Domains (comma-separated)</label>
                <input
                  type="text"
                  value={newTarget.allowedDomains}
                  onChange={e => setNewTarget(p => ({ ...p, allowedDomains: e.target.value }))}
                  placeholder="example.com, cdn.example.com"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Excluded Paths (comma-separated)</label>
                <input
                  type="text"
                  value={newTarget.excludedPaths}
                  onChange={e => setNewTarget(p => ({ ...p, excludedPaths: e.target.value }))}
                  placeholder="/admin, /api/internal"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-lighter">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Add Target</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
