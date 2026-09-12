import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Lock, Globe, Server, Bug, FileWarning, ExternalLink } from 'lucide-react';
import type { Severity, SslGrade } from '../types';

const severityConfig: Record<Severity, { color: string; bg: string }> = {
  critical: { color: 'text-critical', bg: 'bg-critical/10 border-critical/20' },
  high: { color: 'text-high', bg: 'bg-high/10 border-high/20' },
  medium: { color: 'text-medium', bg: 'bg-medium/10 border-medium/20' },
  low: { color: 'text-low', bg: 'bg-low/10 border-low/20' },
  info: { color: 'text-info', bg: 'bg-info/10 border-info/20' },
  warning: { color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
};

function gradeColor(grade: SslGrade) {
  if (grade === 'A+' || grade === 'A') return 'text-low';
  if (grade === 'B') return 'text-medium';
  return 'text-critical';
}

export default function Security() {
  const { securityResults } = useApp();
  const [selectedUrl, setSelectedUrl] = useState(securityResults[0]?.url || '');
  const [activeTab, setActiveTab] = useState<'headers' | 'ssl' | 'zap' | 'nuclei'>('headers');

  const result = securityResults.find(r => r.url === selectedUrl) || securityResults[0];
  if (!result) return null;

  const headersPresent = result.headers.filter(h => h.present).length;
  const headersTotal = result.headers.length;
  const criticalHeaders = result.headers.filter(h => !h.present && (h.severity === 'critical' || h.severity === 'high'));

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security</h1>
          <p className="text-sm text-text-secondary mt-1">Security headers, SSL/TLS, OWASP ZAP, and Nuclei scan results</p>
        </div>
        <select
          value={selectedUrl}
          onChange={e => setSelectedUrl(e.target.value)}
          className="px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
        >
          {securityResults.map(r => (
            <option key={r.url} value={r.url}>{r.url}</option>
          ))}
        </select>
      </div>

      {/* Overall Grade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-xl border text-center ${
          result.overallGrade === 'A+' || result.overallGrade === 'A' ? 'bg-low/5 border-low/20' :
          result.overallGrade === 'B' ? 'bg-medium/5 border-medium/20' : 'bg-critical/5 border-critical/20'
        }`}>
          <Shield className={`w-6 h-6 mx-auto mb-2 ${gradeColor(result.overallGrade)}`} />
          <p className={`text-4xl font-bold ${gradeColor(result.overallGrade)}`}>{result.overallGrade}</p>
          <p className="text-xs text-text-muted mt-1">Overall Grade</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-light border border-border text-center">
          <Lock className="w-6 h-6 mx-auto mb-2 text-primary-400" />
          <p className="text-lg font-bold text-text-primary">{result.ssl.protocol}</p>
          <p className="text-xs text-text-muted mt-1">{result.ssl.grade} SSL Grade</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-light border border-border text-center">
          <Server className="w-6 h-6 mx-auto mb-2 text-primary-400" />
          <p className="text-lg font-bold text-text-primary">{headersPresent}/{headersTotal}</p>
          <p className="text-xs text-text-muted mt-1">Security Headers</p>
        </div>
        <div className="p-5 rounded-xl bg-critical/5 border border-critical/20 text-center">
          <Bug className="w-6 h-6 mx-auto mb-2 text-critical" />
          <p className="text-lg font-bold text-critical">{result.zapAlerts.length + result.nucleiFindings.length}</p>
          <p className="text-xs text-text-muted mt-1">Vulnerabilities Found</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-light border border-border rounded-xl p-1">
        {[
          { id: 'headers', label: 'Security Headers', icon: Shield },
          { id: 'ssl', label: 'SSL/TLS', icon: Lock },
          { id: 'zap', label: 'OWASP ZAP', icon: Bug },
          { id: 'nuclei', label: 'Nuclei', icon: FileWarning },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Security Headers Tab */}
      {activeTab === 'headers' && (
        <div className="bg-surface-light border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">HTTP Security Headers</h3>
            <span className="text-xs text-text-muted">{headersPresent} of {headersTotal} present</span>
          </div>
          <div className="space-y-2">
            {result.headers.map(header => {
              const sev = severityConfig[header.severity];
              return (
                <div key={header.name} className={`p-3 rounded-lg border ${header.present ? 'bg-low/5 border-low/10' : sev.bg}`}>
                  <div className="flex items-center gap-3">
                    {header.present ? (
                      <CheckCircle2 className="w-4 h-4 text-low flex-shrink-0" />
                    ) : (
                      <XCircle className={`w-4 h-4 flex-shrink-0 ${sev.color}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary font-mono">{header.name}</p>
                        {!header.present && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${sev.bg} ${sev.color}`}>
                            {header.severity}
                          </span>
                        )}
                      </div>
                      {header.present && header.value ? (
                        <p className="text-xs text-text-muted font-mono mt-1 truncate">{header.value}</p>
                      ) : header.recommendation ? (
                        <p className="text-xs text-text-muted mt-1">{header.recommendation}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SSL/TLS Tab */}
      {activeTab === 'ssl' && (
        <div className="space-y-4">
          <div className="bg-surface-light border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">SSL/TLS Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Protocol</p>
                <p className="text-sm font-bold text-text-primary mt-1">{result.ssl.protocol}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Cipher Suite</p>
                <p className="text-sm font-bold text-text-primary mt-1 font-mono text-xs">{result.ssl.cipher}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Issuer</p>
                <p className="text-sm font-bold text-text-primary mt-1">{result.ssl.issuer}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Expires In</p>
                <p className={`text-sm font-bold mt-1 ${result.ssl.daysUntilExpiry < 30 ? 'text-critical' : result.ssl.daysUntilExpiry < 90 ? 'text-medium' : 'text-low'}`}>
                  {result.ssl.daysUntilExpiry} days
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'HSTS', value: result.ssl.supportsHSTS },
                { label: 'HPKP', value: result.ssl.supportsHPKP },
                { label: 'OCSP Stapling', value: result.ssl.supportsOCSP },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border/50">
                  {item.value ? <CheckCircle2 className="w-4 h-4 text-low" /> : <XCircle className="w-4 h-4 text-medium" />}
                  <span className="text-xs text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerability Checks */}
          <div className="bg-surface-light border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Vulnerability Checks (testssl.sh)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'Heartbleed', vuln: result.ssl.vulnerableToHeartbleed },
                { name: 'CCS Injection', vuln: result.ssl.vulnerableToCCS },
                { name: 'Renegotiation', vuln: result.ssl.vulnerableToRenego },
                { name: 'CRIME', vuln: result.ssl.vulnerableToCrime },
                { name: 'POODLE', vuln: result.ssl.vulnerableToPoodle },
                { name: 'FREAK', vuln: result.ssl.vulnerableToFreak },
                { name: 'Logjam', vuln: result.ssl.vulnerableToLogjam },
                { name: 'DROWN', vuln: result.ssl.vulnerableToDrown },
              ].map(check => (
                <div key={check.name} className={`flex items-center gap-2 p-2.5 rounded-lg border ${check.vuln ? 'bg-critical/5 border-critical/20' : 'bg-low/5 border-low/10'}`}>
                  {check.vuln ? <XCircle className="w-4 h-4 text-critical" /> : <CheckCircle2 className="w-4 h-4 text-low" />}
                  <span className="text-xs text-text-secondary">{check.name}</span>
                  <span className={`text-[10px] font-bold ml-auto ${check.vuln ? 'text-critical' : 'text-low'}`}>
                    {check.vuln ? 'VULN' : 'SAFE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Details */}
          <div className="bg-surface-light border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Certificate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Valid From</p>
                <p className="text-sm text-text-primary mt-1">{result.ssl.validFrom}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs text-text-muted">Valid To</p>
                <p className="text-sm text-text-primary mt-1">{result.ssl.validTo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OWASP ZAP Tab */}
      {activeTab === 'zap' && (
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">OWASP ZAP Baseline Scan</h3>
            <span className="px-2 py-1 text-xs bg-primary-500/10 text-primary-400 rounded border border-primary-500/20">{result.zapAlerts.length} alerts</span>
          </div>
          <div className="space-y-3">
            {result.zapAlerts.map(alert => {
              const sev = severityConfig[alert.risk];
              return (
                <div key={alert.id} className={`p-4 rounded-lg border ${sev.bg}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sev.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">{alert.name}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${sev.bg} ${sev.color}`}>{alert.risk}</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">Confidence: {alert.confidence}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{alert.description}</p>
                      <p className="text-xs text-text-muted mt-1 font-mono truncate">{alert.url}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-text-muted">CWE-{alert.cweId}</span>
                        <span className="text-xs text-text-muted">WASC-{alert.wascid}</span>
                      </div>
                      <div className="mt-2 p-2 rounded bg-surface/50 border border-border/30">
                        <p className="text-xs text-text-muted">Solution: <span className="text-text-secondary">{alert.solution}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nuclei Tab */}
      {activeTab === 'nuclei' && (
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Nuclei Template Scan</h3>
            <span className="px-2 py-1 text-xs bg-primary-500/10 text-primary-400 rounded border border-primary-500/20">{result.nucleiFindings.length} findings</span>
          </div>
          <div className="space-y-3">
            {result.nucleiFindings.map(finding => {
              const sev = severityConfig[finding.severity];
              return (
                <div key={finding.id} className={`p-4 rounded-lg border ${sev.bg}`}>
                  <div className="flex items-start gap-3">
                    <FileWarning className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sev.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">{finding.name}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${sev.bg} ${sev.color}`}>{finding.severity}</span>
                      </div>
                      <p className="text-xs text-text-muted font-mono mt-1">Template: {finding.templateId}</p>
                      <p className="text-xs text-text-secondary mt-1">{finding.description}</p>
                      <p className="text-xs text-text-muted font-mono mt-1">Matched at: {finding.matchedAt}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {finding.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded text-text-muted">{tag}</span>
                        ))}
                      </div>
                      {finding.reference.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {finding.reference.map((ref, i) => (
                            <a key={i} href={ref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                              <ExternalLink className="w-3 h-3" /> Reference {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Checks */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Additional Security Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${result.cookiesSecure ? 'bg-low/5 border-low/10' : 'bg-critical/5 border-critical/20'}`}>
            {result.cookiesSecure ? <CheckCircle2 className="w-4 h-4 text-low" /> : <XCircle className="w-4 h-4 text-critical" />}
            <div>
              <p className="text-sm font-medium text-text-primary">Secure Cookies</p>
              <p className="text-xs text-text-muted">{result.cookiesSecure ? 'All cookies have Secure flag' : 'Some cookies missing Secure flag'}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${!result.mixedContent ? 'bg-low/5 border-low/10' : 'bg-critical/5 border-critical/20'}`}>
            {!result.mixedContent ? <CheckCircle2 className="w-4 h-4 text-low" /> : <XCircle className="w-4 h-4 text-critical" />}
            <div>
              <p className="text-sm font-medium text-text-primary">Mixed Content</p>
              <p className="text-xs text-text-muted">{!result.mixedContent ? 'No mixed content detected' : 'Mixed content (HTTP resources on HTTPS page) found'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
