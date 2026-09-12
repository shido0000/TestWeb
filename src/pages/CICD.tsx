import { useApp } from '../store/useStore';
import { GitBranch, CheckCircle2, XCircle, Clock, Settings, ExternalLink, Shield, AlertTriangle, Play } from 'lucide-react';

const providerConfig = {
  github_actions: { name: 'GitHub Actions', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: '⚡' },
  gitlab_ci: { name: 'GitLab CI/CD', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: '🦊' },
  jenkins: { name: 'Jenkins', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '🔧' },
  azure_devops: { name: 'Azure DevOps', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '☁️' },
  circleci: { name: 'CircleCI', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '⭕' },
};

const severityOrder = ['critical', 'high', 'medium', 'low', 'info', 'warning'];

export default function CICD() {
  const { cicdConfigs, projects } = useApp();

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">CI/CD Integration</h1>
          <p className="text-sm text-text-secondary mt-1">Configure automated testing in your deployment pipelines</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20">
          <Settings className="w-4 h-4" /> Add Pipeline
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-light border border-border text-center">
          <p className="text-2xl font-bold text-text-primary">{cicdConfigs.length}</p>
          <p className="text-xs text-text-muted">Total Pipelines</p>
        </div>
        <div className="p-4 rounded-xl bg-low/5 border border-low/20 text-center">
          <p className="text-2xl font-bold text-low">{cicdConfigs.filter(c => c.enabled).length}</p>
          <p className="text-xs text-text-muted">Active</p>
        </div>
        <div className="p-4 rounded-xl bg-low/5 border border-low/20 text-center">
          <p className="text-2xl font-bold text-low">{cicdConfigs.filter(c => c.lastStatus === 'passed').length}</p>
          <p className="text-xs text-text-muted">Last Passed</p>
        </div>
        <div className="p-4 rounded-xl bg-critical/5 border border-critical/20 text-center">
          <p className="text-2xl font-bold text-critical">{cicdConfigs.filter(c => c.lastStatus === 'failed').length}</p>
          <p className="text-xs text-text-muted">Last Failed</p>
        </div>
      </div>

      {/* Pipeline Configs */}
      <div className="space-y-4">
        {cicdConfigs.map(config => {
          const provider = providerConfig[config.provider];
          return (
            <div key={config.id} className="bg-surface-light border border-border rounded-xl p-5 hover:border-border-light transition-all">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg border ${provider.color} text-2xl`}>
                  {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-text-primary">{config.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${provider.color}`}>
                      {provider.name}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      config.enabled ? 'bg-low/10 text-low border border-low/20' : 'bg-text-muted/10 text-text-muted border border-border'
                    }`}>
                      {config.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Project: {getProjectName(config.projectId)}</p>

                  {/* Config Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                      <p className="text-[10px] text-text-muted uppercase">Repository</p>
                      <p className="text-xs text-text-primary font-mono mt-0.5">{config.config.repo || config.config.project || config.config.job}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                      <p className="text-[10px] text-text-muted uppercase">Trigger</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {config.triggerOn.map(t => (
                          <span key={t} className="px-1.5 py-0.5 text-[10px] bg-primary-500/10 text-primary-400 rounded border border-primary-500/20">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
                      <p className="text-[10px] text-text-muted uppercase">Fail On</p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                        config.failOnSeverity === 'critical' ? 'bg-critical/10 text-critical' :
                        config.failOnSeverity === 'high' ? 'bg-high/10 text-high' :
                        'bg-medium/10 text-medium'
                      }`}>
                        {config.failOnSeverity}+
                      </span>
                    </div>
                  </div>

                  {/* Last Run */}
                  {config.lastRun && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      {config.lastStatus === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-low" />
                      ) : config.lastStatus === 'failed' ? (
                        <XCircle className="w-4 h-4 text-critical" />
                      ) : (
                        <Clock className="w-4 h-4 text-text-muted" />
                      )}
                      <span className="text-xs text-text-secondary">
                        Last run: {new Date(config.lastRun).toLocaleString()}
                      </span>
                      <span className={`text-xs font-medium ${
                        config.lastStatus === 'passed' ? 'text-low' : config.lastStatus === 'failed' ? 'text-critical' : 'text-text-muted'
                      }`}>
                        {config.lastStatus}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-text-muted hover:text-primary-400 rounded-lg hover:bg-surface-lighter transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-lighter transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Example Configurations */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary-400" /> Example CI/CD Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Actions */}
          <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚡</span>
              <p className="text-sm font-medium text-text-primary">GitHub Actions</p>
            </div>
            <pre className="p-3 bg-surface rounded-lg border border-border text-[10px] text-text-secondary font-mono overflow-x-auto">
{`name: TestHub Security Gate
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run TestHub Scan
        uses: testhub/action@v1
        with:
          api-key: \${{ secrets.TESTHUB_KEY }}
          target: https://staging.example.com
          suites: accessibility,security,performance
          fail-on: high
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: testhub-report
          path: ./testhub-report/`}
            </pre>
          </div>

          {/* GitLab CI */}
          <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🦊</span>
              <p className="text-sm font-medium text-text-primary">GitLab CI/CD</p>
            </div>
            <pre className="p-3 bg-surface rounded-lg border border-border text-[10px] text-text-secondary font-mono overflow-x-auto">
{`testhub-scan:
  stage: test
  image: testhub/cli:latest
  variables:
    TESTHUB_API_KEY: $TESTHUB_KEY
    TESTHUB_TARGET: https://staging.example.com
  script:
    - testhub scan
        --suites accessibility,security
        --fail-on high
        --output html
        --notify slack
  artifacts:
    paths:
      - testhub-report/
    expire_in: 30 days
  rules:
    - if: $CI_MERGE_REQUEST_ID`}
            </pre>
          </div>
        </div>
      </div>

      {/* CLI Usage */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-400" /> CLI Usage
        </h3>
        <div className="p-4 rounded-lg bg-surface border border-border">
          <pre className="text-xs text-text-secondary font-mono overflow-x-auto">
{`# Install TestHub CLI
npm install -g @testhub/cli

# Authenticate
testhub auth login --api-key $TESTHUB_API_KEY

# Run a scan
testhub scan --target https://example.com --suites all

# Run specific suites
testhub scan --target https://example.com --suites security,accessibility

# With CI/CD gate (exit code 1 if findings above threshold)
testhub scan --target https://example.com --fail-on high --format json

# Generate report
testhub report --scan-id <scan-id> --format pdf --output ./report.pdf

# Check scan status
testhub status --scan-id <scan-id>

# List findings
testhub findings --project <project-id> --severity critical`}
          </pre>
        </div>
      </div>

      {/* Quality Gate Info */}
      <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Quality Gate Configuration
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          Configure thresholds that will fail your CI/CD pipeline when exceeded. This ensures code quality standards are maintained before deployment.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Max Critical</p>
            <p className="text-lg font-bold text-critical">0</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Max High</p>
            <p className="text-lg font-bold text-high">3</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Min A11y Score</p>
            <p className="text-lg font-bold text-low">80</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Min Perf Score</p>
            <p className="text-lg font-bold text-medium">70</p>
          </div>
        </div>
      </div>
    </div>
  );
}
