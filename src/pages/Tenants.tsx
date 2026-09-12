import { useState } from 'react';
import { useApp } from '../store/useStore';
import { Building2, Users, Shield, CheckCircle2, Crown, User, Eye, Settings, ArrowRightLeft, Plus, MoreVertical, Globe, Lock, Database, Activity } from 'lucide-react';

const roleConfig = {
  owner: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Owner' },
  admin: { icon: Shield, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20', label: 'Admin' },
  member: { icon: User, color: 'text-low', bg: 'bg-low/10 border-low/20', label: 'Member' },
  viewer: { icon: Eye, color: 'text-text-muted', bg: 'bg-surface border-border', label: 'Viewer' },
};

const planColors = {
  free: 'bg-surface border-border',
  pro: 'bg-primary-500/10 border-primary-500/20',
  enterprise: 'bg-amber-500/10 border-amber-500/20',
};

export default function Tenants() {
  const { tenants, activeTenantId, setActiveTenant } = useApp();
  const [selectedTenant, setSelectedTenant] = useState<string>(activeTenantId);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'usage' | 'settings'>('overview');

  const tenant = tenants.find(t => t.id === selectedTenant);
  if (!tenant) return null;

  const usagePercent = (value: number, limit: number) => Math.min(100, Math.round((value / limit) * 100));
  const usageColor = (percent: number) => percent > 80 ? 'bg-critical' : percent > 60 ? 'bg-medium' : 'bg-low';

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-400" />
            Organizations
          </h1>
          <p className="text-sm text-text-secondary mt-1">Multi-tenant management with isolated data, roles, and billing</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-600/20">
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      {/* Tenant Switcher */}
      <div className="bg-surface-light border border-border rounded-xl p-4">
        <p className="text-xs font-medium text-text-muted uppercase mb-3">Switch Organization</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tenants.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelectedTenant(t.id); setActiveTenant(t.id); }}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedTenant === t.id
                  ? 'bg-primary-500/10 border-primary-500/30 shadow-lg shadow-primary-500/5'
                  : 'bg-surface/50 border-border/50 hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                  t.plan === 'enterprise' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                  t.plan === 'pro' ? 'bg-gradient-to-br from-primary-500 to-primary-700' :
                  'bg-gradient-to-br from-text-muted to-text-muted'
                }`}>
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{t.name}</p>
                  <p className="text-xs text-text-muted">/{t.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${planColors[t.plan]}`}>
                  {t.plan}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                  t.status === 'active' ? 'bg-low/10 text-low' :
                  t.status === 'trial' ? 'bg-medium/10 text-medium' : 'bg-critical/10 text-critical'
                }`}>
                  {t.status}
                </span>
                <span className="text-xs text-text-muted ml-auto">{t.members.length} members</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tenant Detail */}
      <div className="bg-surface-light border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${
              tenant.plan === 'enterprise' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
              tenant.plan === 'pro' ? 'bg-gradient-to-br from-primary-500 to-primary-700' :
              'bg-gradient-to-br from-text-muted to-text-muted'
            }`}>
              {tenant.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{tenant.name}</h2>
                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${planColors[tenant.plan]}`}>
                  {tenant.plan}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {tenant.slug}.testhub.io • Created {new Date(tenant.createdAt).toLocaleDateString()} • Billing: {tenant.billingEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tenant.settings.ssoEnabled && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-low/10 text-low rounded border border-low/20">
                  <Lock className="w-3 h-3" /> SSO
                </span>
              )}
              {tenant.settings.customDomain && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-500/10 text-primary-400 rounded border border-primary-500/20">
                  <Globe className="w-3 h-3" /> {tenant.settings.customDomain}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 border-t border-border pt-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'usage', label: 'Usage', icon: Database },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-primary-500/10 text-primary-400' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-xs text-text-muted">Projects</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{tenant.usage.projectsCount} / {tenant.usage.projectsLimit}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-xs text-text-muted">Scans This Month</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{tenant.usage.scansThisMonth.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-xs text-text-muted">Findings Stored</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{tenant.usage.findingsStored.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                  <p className="text-xs text-text-muted">Team Members</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{tenant.members.length}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Data Isolation Active</p>
                    <p className="text-xs text-text-secondary mt-1">
                      All data for <strong>{tenant.name}</strong> is isolated at the database row level. Other organizations cannot access this tenant's projects, scans, findings, or configurations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary">{tenant.members.length} members</p>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                  <Plus className="w-3 h-3" /> Invite Member
                </button>
              </div>
              {tenant.members.map(member => {
                const role = roleConfig[member.role];
                const RoleIcon = role.icon;
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{member.name}</p>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Last active</p>
                        <p className="text-xs text-text-secondary">{new Date(member.lastActive).toLocaleDateString()}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${role.bg} ${role.color}`}>
                        <RoleIcon className="w-3 h-3" /> {role.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              {[
                { label: 'Scans', value: tenant.usage.scansThisMonth, limit: tenant.usage.scansLimit, unit: '/month' },
                { label: 'Findings Stored', value: tenant.usage.findingsStored, limit: tenant.usage.findingsLimit, unit: ' total' },
                { label: 'Storage', value: tenant.usage.storageUsedMB, limit: tenant.usage.storageLimitMB, unit: ' MB', formatMB: true },
                { label: 'API Calls', value: tenant.usage.apiCallsThisMonth, limit: tenant.usage.apiCallsLimit, unit: '/month' },
                { label: 'Team Members', value: tenant.usage.teamMembers, limit: tenant.usage.teamMembersLimit, unit: '' },
                { label: 'Projects', value: tenant.usage.projectsCount, limit: tenant.usage.projectsLimit, unit: '' },
              ].map(metric => {
                const percent = usagePercent(metric.value, metric.limit);
                return (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-text-primary font-medium">{metric.label}</span>
                      <span className="text-text-secondary">
                        {metric.formatMB ? `${(metric.value / 1024).toFixed(1)} GB` : metric.value.toLocaleString()}
                        {' / '}
                        {metric.formatMB ? `${(metric.limit / 1024).toFixed(0)} GB` : metric.limit.toLocaleString()}
                        {metric.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${usageColor(percent)}`} style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-xs text-text-muted mt-1">{percent}% used</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs font-medium text-text-muted uppercase mb-3">Scan Settings</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Default Depth</span>
                    <span className="text-text-primary font-medium">{tenant.settings.defaultScanDepth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Rate Limit</span>
                    <span className="text-text-primary font-medium">{tenant.settings.rateLimitPerSecond} req/s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Data Retention</span>
                    <span className="text-text-primary font-medium">{tenant.settings.dataRetentionDays} days</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                <p className="text-xs font-medium text-text-muted uppercase mb-3">Security</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-text-secondary">SSO/SAML</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${tenant.settings.ssoEnabled ? 'bg-low/10 text-low' : 'bg-surface text-text-muted'}`}>
                      {tenant.settings.ssoEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-text-secondary">Audit Log</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${tenant.settings.auditLogEnabled ? 'bg-low/10 text-low' : 'bg-surface text-text-muted'}`}>
                      {tenant.settings.auditLogEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">IP Allowlist</span>
                    <span className="text-text-primary font-mono text-xs">{tenant.settings.ipAllowlist.length} ranges</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
