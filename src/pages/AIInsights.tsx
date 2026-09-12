import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Target, Network, ArrowRight, Cpu, Zap, BarChart3, GitBranch, Info, ChevronRight, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const confidenceColors = {
  'very-high': 'bg-low/10 text-low border-low/20',
  'high': 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  'medium': 'bg-medium/10 text-medium border-medium/20',
  'low': 'bg-text-muted/10 text-text-muted border-border',
};

const typeIcons = {
  prioritization: Target,
  pattern: Network,
  prediction: TrendingUp,
  recommendation: Sparkles,
  correlation: GitBranch,
};

const typeLabels = {
  prioritization: 'Prioritization',
  pattern: 'Pattern Detected',
  prediction: 'Prediction',
  recommendation: 'Recommendation',
  correlation: 'Correlation',
};

export default function AIInsights() {
  const { aiInsights, aiPatterns, aiPredictions, findings } = useApp();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(aiInsights[0]?.id || null);
  const [filterType, setFilterType] = useState<string>('all');

  const selected = aiInsights.find(i => i.id === selectedInsight);
  const filteredInsights = filterType === 'all' ? aiInsights : aiInsights.filter(i => i.type === filterType);

  // Aggregate risk score
  const overallRiskScore = Math.round(aiInsights.reduce((sum, i) => sum + i.confidenceScore * (i.impact === 'critical' ? 1 : i.impact === 'high' ? 0.7 : 0.4), 0) / aiInsights.length);

  const trendData = [
    { week: 'W-6', risk: 45, findings: 12 },
    { week: 'W-5', risk: 52, findings: 18 },
    { week: 'W-4', risk: 48, findings: 15 },
    { week: 'W-3', risk: 61, findings: 22 },
    { week: 'W-2', risk: 58, findings: 19 },
    { week: 'W-1', risk: 72, findings: 28 },
    { week: 'Now', risk: overallRiskScore, findings: 34 },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary-400" />
            AI Insights
          </h1>
          <p className="text-sm text-text-secondary mt-1">Machine learning-powered analysis, predictions, and smart prioritization</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg">
          <Cpu className="w-4 h-4 text-primary-400" />
          <span className="text-xs font-medium text-primary-400">Model v2.4 • Last trained 2h ago</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-700/5 border border-primary-500/20">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span className="text-xs text-text-muted">Overall</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{aiInsights.length}</p>
          <p className="text-xs text-text-secondary mt-1">Active Insights</p>
        </div>
        <div className="p-5 rounded-xl bg-critical/5 border border-critical/20">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-critical" />
            <span className="text-xs text-text-muted">Critical</span>
          </div>
          <p className="text-3xl font-bold text-critical">{aiInsights.filter(i => i.impact === 'critical').length}</p>
          <p className="text-xs text-text-secondary mt-1">Critical Actions</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-light border border-border">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <span className="text-xs text-text-muted">Avg Confidence</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {Math.round(aiInsights.reduce((s, i) => s + i.confidenceScore, 0) / aiInsights.length)}%
          </p>
          <p className="text-xs text-text-secondary mt-1">Model Accuracy</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-light border border-border">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-medium" />
            <span className="text-xs text-text-muted">Risk Score</span>
          </div>
          <p className={`text-3xl font-bold ${overallRiskScore > 70 ? 'text-critical' : overallRiskScore > 40 ? 'text-medium' : 'text-low'}`}>
            {overallRiskScore}
          </p>
          <p className="text-xs text-text-secondary mt-1">Composite Risk</p>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Risk Score Trend</h3>
            <p className="text-xs text-text-muted">Composite risk over the last 7 weeks</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-text-secondary"><span className="w-2 h-2 rounded-full bg-critical" /> Risk</span>
            <span className="flex items-center gap-1 text-text-secondary"><span className="w-2 h-2 rounded-full bg-primary-400" /> Findings</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
            <Line type="monotone" dataKey="findings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'prioritization', 'pattern', 'prediction', 'recommendation', 'correlation'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filterType === type
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'text-text-secondary border-border hover:border-border-light'
            }`}
          >
            {type === 'all' ? 'All Insights' : typeLabels[type as keyof typeof typeLabels]}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
          {filteredInsights.map(insight => {
            const Icon = typeIcons[insight.type];
            return (
              <div
                key={insight.id}
                onClick={() => setSelectedInsight(insight.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedInsight === insight.id
                    ? 'bg-primary-500/5 border-primary-500/30 shadow-lg shadow-primary-500/5'
                    : 'bg-surface-light border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${confidenceColors[insight.confidence]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${confidenceColors[insight.confidence]}`}>
                        {typeLabels[insight.type]}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                        insight.impact === 'critical' ? 'bg-critical/10 text-critical' :
                        insight.impact === 'high' ? 'bg-high/10 text-high' :
                        insight.impact === 'medium' ? 'bg-medium/10 text-medium' : 'bg-low/10 text-low'
                      }`}>
                        {insight.impact} impact
                      </span>
                      <span className="text-[10px] text-text-muted">{insight.confidenceScore}% confidence</span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary">{insight.title}</h4>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      <span>{insight.affectedFindings.length} findings affected</span>
                      <span>•</span>
                      <span>{insight.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-0 bg-surface-light border border-border rounded-xl p-5 space-y-4">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${confidenceColors[selected.confidence]}`}>
                  {typeLabels[selected.type]}
                </span>
                <h3 className="text-base font-bold text-text-primary mt-2">{selected.title}</h3>
                <p className="text-sm text-text-secondary mt-2">{selected.description}</p>
              </div>

              {/* Confidence Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">Confidence</span>
                  <span className="font-bold text-text-primary">{selected.confidenceScore}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selected.confidenceScore > 85 ? 'bg-low' : selected.confidenceScore > 60 ? 'bg-primary-400' : 'bg-medium'
                    }`}
                    style={{ width: `${selected.confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" /> AI Reasoning
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">{selected.reasoning}</p>
              </div>

              {/* Feature Importance */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Feature Importance</p>
                <div className="space-y-2">
                  {selected.features.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-text-secondary">{f.name}</span>
                        <span className="text-text-muted font-mono">{(f.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: `${f.weight * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Findings */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase mb-2">Affected Findings ({selected.affectedFindings.length})</p>
                <div className="space-y-1.5">
                  {selected.affectedFindings.map(fid => {
                    const finding = findings.find(f => f.id === fid);
                    if (!finding) return null;
                    return (
                      <div key={fid} className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border/50">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          finding.severity === 'critical' ? 'bg-critical' :
                          finding.severity === 'high' ? 'bg-high' : 'bg-medium'
                        }`} />
                        <span className="text-xs text-text-primary truncate flex-1">{finding.title}</span>
                        <ArrowUpRight className="w-3 h-3 text-text-muted" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {selected.actionUrl && (
                <a href={selected.actionUrl} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Take Action <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="sticky top-0 bg-surface-light border border-border rounded-xl p-8 text-center">
              <Brain className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Select an insight to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Patterns & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detected Patterns */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Network className="w-4 h-4 text-primary-400" /> Detected Patterns
          </h3>
          <div className="space-y-3">
            {aiPatterns.map(pattern => (
              <div key={pattern.id} className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text-primary">{pattern.name}</p>
                  <span className="text-xs text-text-muted">{pattern.confidence}%</span>
                </div>
                <p className="text-xs text-text-secondary mb-2">{pattern.description}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{pattern.occurrences} occurrences</span>
                  <span>•</span>
                  <span className={pattern.severity === 'high' ? 'text-high' : 'text-medium'}>{pattern.severity}</span>
                </div>
                <div className="mt-2 p-2 rounded bg-primary-500/5 border border-primary-500/10">
                  <p className="text-xs text-primary-400">💡 {pattern.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" /> Predictions
          </h3>
          <div className="space-y-3">
            {aiPredictions.map(pred => (
              <div key={pred.id} className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text-primary">{pred.title}</p>
                  <span className={`text-xs font-bold ${
                    pred.probability > 80 ? 'text-critical' : pred.probability > 60 ? 'text-medium' : 'text-low'
                  }`}>{pred.probability}%</span>
                </div>
                <p className="text-xs text-text-secondary mb-2">{pred.description}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                  <span>⏱ Within {pred.timeframe}</span>
                  <span>•</span>
                  <span>Based on {pred.historicalBasis}% historical accuracy</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      pred.probability > 80 ? 'bg-critical' : pred.probability > 60 ? 'bg-medium' : 'bg-low'
                    }`}
                    style={{ width: `${pred.probability}%` }}
                  />
                </div>
                <div className="p-2 rounded bg-low/5 border border-low/10">
                  <p className="text-xs text-low">🛡 Preventive: {pred.preventiveAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
