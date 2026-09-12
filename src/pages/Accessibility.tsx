import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Eye, AlertTriangle, CheckCircle2, Info, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { ColorVisionMode } from '../types';

const colorVisionModes: { mode: ColorVisionMode; label: string; filter: string; description: string }[] = [
  { mode: 'normal', label: 'Normal Vision', filter: 'none', description: 'Standard color perception' },
  { mode: 'protanopia', label: 'Protanopia', filter: 'url(#protanopia)', description: 'No red cones (~1% of males)' },
  { mode: 'deuteranopia', label: 'Deuteranopia', filter: 'url(#deuteranopia)', description: 'No green cones (~1% of males)' },
  { mode: 'tritanopia', label: 'Tritanopia', filter: 'url(#tritanopia)', description: 'No blue cones (very rare)' },
  { mode: 'achromatopsia', label: 'Achromatopsia', filter: 'grayscale(100%)', description: 'Total color blindness' },
];

const impactColors = {
  critical: 'bg-critical/10 text-critical border-critical/20',
  serious: 'bg-high/10 text-high border-high/20',
  moderate: 'bg-medium/10 text-medium border-medium/20',
  minor: 'bg-low/10 text-low border-low/20',
};

export default function Accessibility() {
  const { accessibilityResults } = useApp();
  const [selectedUrl, setSelectedUrl] = useState(accessibilityResults[0]?.url || '');
  const [colorMode, setColorMode] = useState<ColorVisionMode>('normal');
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);

  const result = accessibilityResults.find(r => r.url === selectedUrl) || accessibilityResults[0];
  if (!result) return null;

  const totalRules = result.violations + result.passes + result.incomplete + result.inapplicable;
  const complianceRate = ((result.passes / (result.passes + result.violations)) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* SVG Filters for Color Vision Simulation */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Accessibility</h1>
          <p className="text-sm text-text-secondary mt-1">WCAG compliance, color contrast, and color vision simulation</p>
        </div>
        <select
          value={selectedUrl}
          onChange={e => setSelectedUrl(e.target.value)}
          className="px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
        >
          {accessibilityResults.map(r => (
            <option key={r.url} value={r.url}>{r.url}</option>
          ))}
        </select>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border text-center ${result.score >= 80 ? 'bg-low/5 border-low/20' : result.score >= 60 ? 'bg-medium/5 border-medium/20' : 'bg-critical/5 border-critical/20'}`}>
          <p className={`text-3xl font-bold ${result.score >= 80 ? 'text-low' : result.score >= 60 ? 'text-medium' : 'text-critical'}`}>{result.score}</p>
          <p className="text-xs text-text-muted mt-1">Accessibility Score</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-3xl font-bold text-text-primary">{complianceRate}%</p>
          <p className="text-xs text-text-muted mt-1">Compliance Rate</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <div className="flex items-center justify-center gap-2">
            {result.wcagAA ? <CheckCircle2 className="w-5 h-5 text-low" /> : <AlertTriangle className="w-5 h-5 text-critical" />}
            <span className={`text-lg font-bold ${result.wcagAA ? 'text-low' : 'text-critical'}`}>WCAG AA</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{result.wcagAA ? 'Compliant' : 'Non-compliant'}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <div className="flex items-center justify-center gap-2">
            {result.wcagAAA ? <CheckCircle2 className="w-5 h-5 text-low" /> : <AlertTriangle className="w-5 h-5 text-medium" />}
            <span className={`text-lg font-bold ${result.wcagAAA ? 'text-low' : 'text-medium'}`}>WCAG AAA</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{result.wcagAAA ? 'Compliant' : 'Non-compliant'}</p>
        </div>
      </div>

      {/* axe-core Results Summary */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">axe-core Analysis Results</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-critical/5 border border-critical/10">
            <p className="text-2xl font-bold text-critical">{result.violations}</p>
            <p className="text-xs text-text-muted mt-1">Violations</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-low/5 border border-low/10">
            <p className="text-2xl font-bold text-low">{result.passes}</p>
            <p className="text-xs text-text-muted mt-1">Passes</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-medium/5 border border-medium/10">
            <p className="text-2xl font-bold text-medium">{result.incomplete}</p>
            <p className="text-xs text-text-muted mt-1">Incomplete</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-2xl font-bold text-text-muted">{result.inapplicable}</p>
            <p className="text-xs text-text-muted mt-1">Inapplicable</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>Rule compliance</span>
            <span>{result.passes}/{totalRules} rules passed</span>
          </div>
          <div className="h-3 bg-surface rounded-full overflow-hidden flex">
            <div className="bg-low" style={{ width: `${(result.passes / totalRules) * 100}%` }} />
            <div className="bg-critical" style={{ width: `${(result.violations / totalRules) * 100}%` }} />
            <div className="bg-medium" style={{ width: `${(result.incomplete / totalRules) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Violations Detail */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-critical" /> Violations ({result.violations_detail.length})
        </h3>
        <div className="space-y-2">
          {result.violations_detail.map(violation => (
            <div key={violation.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedViolation(expandedViolation === violation.id ? null : violation.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface/30 transition-colors"
              >
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${impactColors[violation.impact]}`}>
                  {violation.impact}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{violation.description}</p>
                  <p className="text-xs text-text-muted mt-0.5">{violation.nodes} element{violation.nodes !== 1 ? 's' : ''} affected</p>
                </div>
                <div className="flex items-center gap-2">
                  {violation.wcagTags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-info/10 text-info rounded border border-info/20">{tag}</span>
                  ))}
                </div>
              </button>
              {expandedViolation === violation.id && (
                <div className="px-3 pb-3 border-t border-border pt-3 animate-slide-in">
                  <p className="text-sm text-text-secondary mb-2">{violation.help}</p>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">Affected Elements</p>
                    <div className="flex flex-wrap gap-1.5">
                      {violation.elements.map((el, i) => (
                        <code key={i} className="px-2 py-0.5 text-xs bg-surface border border-border rounded font-mono text-text-secondary">{el}</code>
                      ))}
                    </div>
                  </div>
                  <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2">
                    <ExternalLink className="w-3 h-3" /> Learn more about this rule
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Color Vision Simulation */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-400" /> Color Vision Simulation
        </h3>
        <p className="text-xs text-text-secondary mb-4">Preview how your site appears to users with different types of color blindness</p>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {colorVisionModes.map(mode => (
            <button
              key={mode.mode}
              onClick={() => setColorMode(mode.mode)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                colorMode === mode.mode
                  ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                  : 'text-text-secondary border-border hover:border-border-light'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Preview Area */}
        <div className="relative rounded-lg overflow-hidden border border-border" style={{ filter: colorMode !== 'normal' ? (colorVisionModes.find(m => m.mode === colorMode)?.filter || 'none') : 'none' }}>
          {/* Simulated webpage preview */}
          <div className="bg-white p-6 min-h-[300px]">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600" />
                <div>
                  <div className="h-4 w-32 bg-gray-800 rounded" />
                  <div className="h-3 w-20 bg-gray-400 rounded mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="h-24 rounded-lg bg-green-500 flex items-center justify-center text-white text-xs font-bold">CTA Button</div>
                <div className="h-24 rounded-lg bg-red-500 flex items-center justify-center text-white text-xs font-bold">Alert</div>
                <div className="h-24 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Info</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="h-3 w-40 bg-gray-300 rounded" />
                  <span className="text-xs text-gray-500">Status: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="h-3 w-36 bg-gray-300 rounded" />
                  <span className="text-xs text-gray-500">Status: Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-44 bg-gray-300 rounded" />
                  <span className="text-xs text-gray-500">Status: Warning</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">Chart: Red line vs Green line data comparison</p>
                <div className="flex items-end justify-center gap-1 mt-2 h-16">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85].map((h, i) => (
                    <div key={i} className={`w-4 rounded-t ${i % 2 === 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted mt-3">
          <Info className="w-3 h-3 inline mr-1" />
          {colorVisionModes.find(m => m.mode === colorMode)?.description}. This simulation uses CSS color matrix approximations.
        </p>
      </div>

      {/* Contrast Checker */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary-400" /> Contrast Issues Found ({result.contrastIssues})
        </h3>
        <div className="space-y-3">
          {[
            { fg: '#999999', bg: '#FFFFFF', ratio: 2.84, element: '.btn-cta', level: 'AA' },
            { fg: '#AAAAAA', bg: '#FFFFFF', ratio: 2.32, element: '.text-muted', level: 'AA' },
            { fg: '#666666', bg: '#333333', ratio: 1.97, element: '.nav-link', level: 'AA' },
            { fg: '#CCCCCC', bg: '#FFFFFF', ratio: 1.60, element: '.footer-text', level: 'AAA' },
          ].map((issue, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface/50 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 rounded border border-border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: issue.bg, color: issue.fg }}>Aa</div>
                <div className="text-xs">
                  <p className="text-text-muted">FG: <code className="text-text-secondary">{issue.fg}</code></p>
                  <p className="text-text-muted">BG: <code className="text-text-secondary">{issue.bg}</code></p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary font-medium">{issue.element}</p>
                <p className="text-xs text-text-muted">Required: 4.5:1 ({issue.level})</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${issue.ratio >= 4.5 ? 'text-low' : issue.ratio >= 3 ? 'text-medium' : 'text-critical'}`}>
                  {issue.ratio}:1
                </p>
                <p className="text-xs text-critical">FAIL</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
