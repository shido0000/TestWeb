import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Settings as SettingsIcon, Bell, Shield, Globe, Webhook, Mail, Github, MessageSquare, ToggleLeft, ToggleRight, Save, Key } from 'lucide-react';

export default function SettingsPage() {
  const { integrations, apiKeys } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    slack: true,
    critical: true,
    scanComplete: true,
    weeklyDigest: false,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  const integrationIcons: Record<string, any> = {
    slack: MessageSquare,
    jira: Globe,
    github: Github,
    webhook: Webhook,
    email: Mail,
    teams: MessageSquare,
    pagerduty: Bell,
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Configure your TestHub instance</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="bg-surface-light border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-text-primary">General Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Corp"
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Default Scan Depth</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Rate Limit (req/s)</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Max Concurrent Scans</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Respect robots.txt</p>
                    <p className="text-xs text-text-muted">Honor robots.txt directives during crawling</p>
                  </div>
                  <ToggleRight className="w-8 h-8 text-primary-400" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-text-primary">SPA Support</p>
                    <p className="text-xs text-text-muted">Enable smart waits for single-page applications</p>
                  </div>
                  <ToggleRight className="w-8 h-8 text-primary-400" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Auto-deduplication</p>
                    <p className="text-xs text-text-muted">Automatically mark duplicate findings</p>
                  </div>
                  <ToggleRight className="w-8 h-8 text-primary-400" />
                </label>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-surface-light border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-text-primary">Notification Preferences</h3>

              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive findings and scan results via email' },
                  { key: 'slack', label: 'Slack Notifications', desc: 'Post alerts to your Slack channels' },
                  { key: 'critical', label: 'Critical Findings Only', desc: 'Only notify for critical and high severity findings' },
                  { key: 'scanComplete', label: 'Scan Completion', desc: 'Notify when a scan finishes (success or failure)' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of all findings' },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50 cursor-pointer hover:border-border transition-colors">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    >
                      {notifications[item.key as keyof typeof notifications]
                        ? <ToggleRight className="w-8 h-8 text-primary-400" />
                        : <ToggleLeft className="w-8 h-8 text-text-muted" />
                      }
                    </button>
                  </label>
                ))}
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-surface-light border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-text-primary">Security Settings</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary">Two-Factor Authentication</p>
                    <span className="px-2 py-0.5 text-xs bg-low/10 text-low rounded-full border border-low/20">Enabled</span>
                  </div>
                  <p className="text-xs text-text-muted">All admin accounts require 2FA</p>
                </div>

                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary">IP Allowlist</p>
                    <span className="px-2 py-0.5 text-xs bg-medium/10 text-medium rounded-full border border-medium/20">Configured</span>
                  </div>
                  <p className="text-xs text-text-muted">Restrict API access to specific IP ranges</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 text-xs bg-surface border border-border rounded font-mono text-text-secondary">10.0.0.0/8</span>
                    <span className="px-2 py-0.5 text-xs bg-surface border border-border rounded font-mono text-text-secondary">172.16.0.0/12</span>
                    <span className="px-2 py-0.5 text-xs bg-surface border border-border rounded font-mono text-text-secondary">192.168.1.0/24</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary">Worker Isolation</p>
                    <span className="px-2 py-0.5 text-xs bg-low/10 text-low rounded-full border border-low/20">Active</span>
                  </div>
                  <p className="text-xs text-text-muted">Scans run in isolated containers with no host network access</p>
                </div>

                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-sm font-medium text-text-primary mb-2">Session Timeout</p>
                  <input
                    type="number"
                    defaultValue={60}
                    className="w-32 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                  <span className="text-xs text-text-muted ml-2">minutes</span>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Security Settings
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-surface-light border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-text-primary">Integrations</h3>
              <p className="text-sm text-text-secondary">Connect TestHub with your existing tools and workflows</p>

              <div className="space-y-3">
                {integrations.map(integration => {
                  const Icon = integrationIcons[integration.type] || Webhook;
                  return (
                    <div key={integration.id} className="flex items-center gap-4 p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-border transition-colors">
                      <div className={`p-2.5 rounded-lg ${integration.enabled ? 'bg-primary-500/10' : 'bg-surface-lighter'}`}>
                        <Icon className={`w-5 h-5 ${integration.enabled ? 'text-primary-400' : 'text-text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary">{integration.name}</p>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            integration.enabled ? 'bg-low/10 text-low' : 'bg-text-muted/10 text-text-muted'
                          }`}>
                            {integration.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 capitalize">{integration.type} • Events: {integration.events.join(', ')}</p>
                      </div>
                      <button className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-lighter">
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border hover:border-border-light text-text-primary text-sm font-medium rounded-lg transition-colors">
                <Webhook className="w-4 h-4" /> Add Integration
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-surface-light border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-text-primary">API Keys</h3>
              <p className="text-sm text-text-secondary">Manage API keys for CI/CD integration and programmatic access</p>

              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{key.name}</p>
                        <p className="text-xs text-text-muted font-mono mt-1">{key.prefix}••••••••••••••••••••</p>
                        <p className="text-[10px] text-text-muted mt-1">Permissions: {key.permissions.join(', ')}</p>
                        {key.lastUsed && <p className="text-[10px] text-text-muted">Last used: {new Date(key.lastUsed).toLocaleString()}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs bg-low/10 text-low rounded-full">{key.active ? 'Active' : 'Revoked'}</span>
                        <button className="px-2 py-1 text-xs text-text-secondary hover:text-critical border border-border rounded hover:border-critical/30">Revoke</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Key className="w-4 h-4" /> Generate New Key
              </button>

              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <p className="text-sm font-medium text-info mb-2">API Documentation</p>
                <p className="text-xs text-text-secondary">
                  Full API documentation is available at <code className="px-1 py-0.5 bg-surface rounded text-text-primary">/api/docs</code> (Swagger/OpenAPI 3.0).
                  Use your API key in the Authorization header: <code className="px-1 py-0.5 bg-surface rounded text-text-primary">Authorization: Bearer &lt;your-key&gt;</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
