import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Play, Plus, Trash2, GripVertical, CheckCircle2, XCircle, Clock, ArrowDown, ArrowUp, MousePointer, Type, Eye, Camera, Navigation, Timer, MousePointerClick, ChevronDown, Save, Copy } from 'lucide-react';
import type { E2EStep, E2EStepType } from '../types';

const stepTypeConfig: Record<E2EStepType, { icon: any; label: string; color: string; hasSelector: boolean; hasValue: boolean }> = {
  navigate: { icon: Navigation, label: 'Navigate', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', hasSelector: false, hasValue: true },
  click: { icon: MousePointerClick, label: 'Click', color: 'bg-green-500/10 text-green-400 border-green-500/20', hasSelector: true, hasValue: false },
  type: { icon: Type, label: 'Type Text', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', hasSelector: true, hasValue: true },
  wait: { icon: Timer, label: 'Wait', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', hasSelector: false, hasValue: false },
  assert: { icon: Eye, label: 'Assert', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', hasSelector: true, hasValue: false },
  screenshot: { icon: Camera, label: 'Screenshot', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', hasSelector: false, hasValue: false },
  hover: { icon: MousePointer, label: 'Hover', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', hasSelector: true, hasValue: false },
  select: { icon: ChevronDown, label: 'Select Option', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', hasSelector: true, hasValue: true },
  scroll: { icon: ArrowDown, label: 'Scroll', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20', hasSelector: false, hasValue: false },
};

export default function E2ETests() {
  const { e2eFlows, targets, addE2EFlow, deleteE2EFlow } = useApp();
  const [selectedFlow, setSelectedFlow] = useState<string | null>(e2eFlows[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [yamlView, setYamlView] = useState(false);

  const flow = e2eFlows.find(f => f.id === selectedFlow);

  const generateYaml = (steps: E2EStep[]) => {
    return `# TestHub E2E Flow - Playwright YAML
name: ${flow?.name || 'New Flow'}
target: ${flow ? targets.find(t => t.id === flow.targetId)?.url : ''}

steps:
${steps.map((step, i) => `  - action: ${step.type}
    description: "${step.description}"${step.selector ? `\n    selector: "${step.selector}"` : ''}${step.value ? `\n    value: "${step.value}"` : ''}${step.timeout ? `\n    timeout: ${step.timeout}` : ''}${step.assertion ? `\n    assert:\n      type: ${step.assertion.type}${step.assertion.expected ? `\n      expected: "${step.assertion.expected}"` : ''}` : ''}`).join('\n')}`;
  };

  const addStep = (type: E2EStepType) => {
    if (!flow) return;
    const newStep: E2EStep = {
      id: `es${Date.now()}`,
      type,
      description: stepTypeConfig[type].label,
      ...(stepTypeConfig[type].hasSelector ? { selector: '' } : {}),
      ...(stepTypeConfig[type].hasValue ? { value: '' } : {}),
    };
    const updatedSteps = [...flow.steps, newStep];
    // In a real app, this would update via the store
    setEditingStep(newStep.id);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">E2E Tests</h1>
          <p className="text-sm text-text-secondary mt-1">Define and run functional test flows with Playwright</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" /> New Flow
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Flow List */}
        <div className="xl:col-span-1 space-y-2">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Test Flows</h3>
          {e2eFlows.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFlow(f.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedFlow === f.id
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-surface-light border-border hover:border-border-light'
              }`}
            >
              <div className="flex items-center gap-2">
                {f.lastStatus === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5 text-low" /> :
                 f.lastStatus === 'failed' ? <XCircle className="w-3.5 h-3.5 text-critical" /> :
                 <Clock className="w-3.5 h-3.5 text-text-muted" />}
                <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
              </div>
              <p className="text-xs text-text-muted mt-1">{f.steps.length} steps • {f.tags.join(', ')}</p>
            </button>
          ))}
        </div>

        {/* Flow Editor */}
        <div className="xl:col-span-3">
          {flow ? (
            <div className="space-y-4">
              {/* Flow Header */}
              <div className="bg-surface-light border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-text-primary">{flow.name}</h2>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        flow.lastStatus === 'passed' ? 'bg-low/10 text-low border border-low/20' :
                        flow.lastStatus === 'failed' ? 'bg-critical/10 text-critical border border-critical/20' :
                        'bg-text-muted/10 text-text-muted border border-border'
                      }`}>
                        {flow.lastStatus || 'Not run'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{flow.description}</p>
                    <p className="text-xs text-text-muted mt-1">Target: {targets.find(t => t.id === flow.targetId)?.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setYamlView(!yamlView)}
                      className="px-3 py-2 text-xs font-medium text-text-secondary border border-border rounded-lg hover:border-border-light transition-colors"
                    >
                      {yamlView ? 'Visual' : 'YAML'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <Play className="w-4 h-4" /> Run Flow
                    </button>
                  </div>
                </div>
              </div>

              {/* YAML View */}
              {yamlView ? (
                <div className="bg-surface-light border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary">YAML Definition</h3>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary border border-border rounded hover:border-border-light">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-4 bg-surface rounded-lg border border-border text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap">
                    {generateYaml(flow.steps)}
                  </pre>
                </div>
              ) : (
                <>
                  {/* Steps */}
                  <div className="bg-surface-light border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-text-primary">Steps ({flow.steps.length})</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Add step:</span>
                        <div className="flex flex-wrap gap-1">
                          {(Object.entries(stepTypeConfig) as [E2EStepType, typeof stepTypeConfig[E2EStepType]][]).map(([type, config]) => (
                            <button
                              key={type}
                              onClick={() => addStep(type)}
                              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border ${config.color} hover:opacity-80 transition-opacity`}
                              title={config.label}
                            >
                              <config.icon className="w-3 h-3" /> {config.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {flow.steps.map((step, index) => {
                        const config = stepTypeConfig[step.type];
                        const Icon = config.icon;
                        const isEditing = editingStep === step.id;

                        return (
                          <div key={step.id} className="relative">
                            {/* Connector line */}
                            {index < flow.steps.length - 1 && (
                              <div className="absolute left-5 top-full w-0.5 h-2 bg-border z-0" />
                            )}
                            <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              isEditing ? 'border-primary-500/30 bg-primary-500/5' : 'bg-surface/50 border-border/50 hover:border-border'
                            }`}>
                              <div className="flex flex-col items-center gap-1">
                                <GripVertical className="w-3 h-3 text-text-muted cursor-grab" />
                                <span className="text-[10px] text-text-muted font-mono">{index + 1}</span>
                              </div>
                              <div className={`p-1.5 rounded-lg border ${config.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      defaultValue={step.description}
                                      placeholder="Step description"
                                      className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary-500"
                                    />
                                    {config.hasSelector && (
                                      <input
                                        type="text"
                                        defaultValue={step.selector}
                                        placeholder="CSS selector (e.g., #email, .btn-submit)"
                                        className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary font-mono focus:outline-none focus:border-primary-500"
                                      />
                                    )}
                                    {config.hasValue && (
                                      <input
                                        type="text"
                                        defaultValue={step.value}
                                        placeholder={step.type === 'navigate' ? 'URL' : 'Value to enter'}
                                        className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary-500"
                                      />
                                    )}
                                    {step.type === 'assert' && (
                                      <div className="flex gap-2">
                                        <select className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary-500">
                                          <option>visible</option>
                                          <option>hidden</option>
                                          <option>text</option>
                                          <option>url</option>
                                          <option>title</option>
                                        </select>
                                        <input
                                          type="text"
                                          defaultValue={step.assertion?.expected || ''}
                                          placeholder="Expected value"
                                          className="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary-500"
                                        />
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setEditingStep(null)} className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700">
                                        <Save className="w-3 h-3 inline mr-1" /> Save
                                      </button>
                                      <button onClick={() => setEditingStep(null)} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div onClick={() => setEditingStep(step.id)} className="cursor-pointer">
                                    <p className="text-sm font-medium text-text-primary">{step.description}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {step.selector && (
                                        <code className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded font-mono text-text-muted">{step.selector}</code>
                                      )}
                                      {step.value && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">
                                          {step.type === 'navigate' ? step.value : `"${step.value}"`}
                                        </span>
                                      )}
                                      {step.assertion && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-info/10 text-info rounded border border-info/20">
                                          assert: {step.assertion.type}{step.assertion.expected ? ` = "${step.assertion.expected}"` : ''}
                                        </span>
                                      )}
                                      {step.timeout && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">timeout: {step.timeout}ms</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {!isEditing && (
                                <div className="flex items-center gap-1">
                                  <button className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-lighter">
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-surface-lighter">
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button className="p-1 text-text-muted hover:text-critical rounded hover:bg-surface-lighter">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Execution Log (simulated) */}
                  {flow.lastRun && (
                    <div className="bg-surface-light border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Last Execution Log</h3>
                      <div className="space-y-1 font-mono text-xs">
                        <p className="text-text-muted">[{new Date(flow.lastRun).toISOString()}] Starting flow: {flow.name}</p>
                        {flow.steps.map((step, i) => (
                          <p key={i} className={flow.lastStatus === 'passed' || i < flow.steps.length - 1 ? 'text-low' : 'text-critical'}>
                            {'  '}
                            {flow.lastStatus === 'passed' || i < flow.steps.length - 1 ? '✓' : '✗'} Step {i + 1}: {step.description}
                            {step.type === 'navigate' && ` → ${step.value}`}
                            {step.type === 'type' && ` [${step.selector}]`}
                            {step.type === 'assert' && ` (${step.assertion?.type})`}
                            <span className="text-text-muted ml-2">{(Math.random() * 500 + 100).toFixed(0)}ms</span>
                          </p>
                        ))}
                        <p className={`mt-2 font-bold ${flow.lastStatus === 'passed' ? 'text-low' : 'text-critical'}`}>
                          {flow.lastStatus === 'passed' ? '✓ Flow completed successfully' : '✗ Flow failed at step ' + flow.steps.length}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-surface-light border border-border rounded-xl p-12 text-center">
              <Play className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Select a flow to view or edit its steps</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Flow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-light border border-border rounded-xl shadow-2xl p-6 animate-slide-in">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create New E2E Flow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Flow Name</label>
                <input type="text" placeholder="e.g., User Registration" className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea placeholder="What does this flow test?" rows={2} className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Target</label>
                <select className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500">
                  <option value="">Select target...</option>
                  {targets.map(t => <option key={t.id} value={t.id}>{t.name} — {t.url}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Tags (comma-separated)</label>
                <input type="text" placeholder="smoke, regression, critical" className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-lighter">Cancel</button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Create Flow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
