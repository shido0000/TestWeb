import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Plus, MoreVertical, Trash2, Edit, ExternalLink, Tag, Clock, AlertTriangle } from 'lucide-react';

export default function Projects() {
  const { projects, addProject, deleteProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', tags: '' });

  const handleCreate = () => {
    if (!newProject.name) return;
    addProject({
      name: newProject.name,
      description: newProject.description,
      tags: newProject.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setNewProject({ name: '', description: '', tags: '' });
    setShowModal(false);
  };

  const totalFindings = (p: typeof projects[0]) =>
    Object.values(p.findingsCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your testing projects and their configurations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-surface-light border border-border rounded-xl p-5 hover:border-border-light transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary truncate">{project.name}</h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{project.description}</p>
              </div>
              <div className="relative">
                <button className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-lighter transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full border border-primary-500/20">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>

            {/* Findings Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-critical/5 border border-critical/10">
                <p className="text-lg font-bold text-critical">{project.findingsCount.critical}</p>
                <p className="text-[10px] text-text-muted uppercase">Critical</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-high/5 border border-high/10">
                <p className="text-lg font-bold text-high">{project.findingsCount.high}</p>
                <p className="text-[10px] text-text-muted uppercase">High</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-medium/5 border border-medium/10">
                <p className="text-lg font-bold text-medium">{project.findingsCount.medium}</p>
                <p className="text-[10px] text-text-muted uppercase">Medium</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {totalFindings(project)} findings
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-text-muted hover:text-primary-400 rounded hover:bg-surface-lighter">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-text-muted hover:text-primary-400 rounded hover:bg-surface-lighter">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-1.5 text-text-muted hover:text-critical rounded hover:bg-surface-lighter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-light border border-border rounded-xl shadow-2xl p-6 animate-slide-in">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., E-Commerce Platform"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.tags}
                  onChange={e => setNewProject(p => ({ ...p, tags: e.target.value }))}
                  placeholder="production, critical, frontend"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-lighter transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
