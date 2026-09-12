import { useState } from 'react';
import { useApp } from '../store/useStore';
import { CreditCard, Check, Crown, Zap, Building2, Download, Plus, MoreVertical, Receipt, TrendingUp, Calendar } from 'lucide-react';

export default function Billing() {
  const { tenants, activeTenantId, billingPlans, invoices, paymentMethods } = useApp();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const tenant = tenants.find(t => t.id === activeTenantId);
  const currentPlan = billingPlans.find(p => p.id === tenant?.plan);
  const tenantInvoices = invoices.filter(i => i.tenantId === activeTenantId);

  if (!tenant || !currentPlan) return null;

  const totalSpent = tenantInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary-400" />
            Billing & Plans
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage subscription, payment methods, and invoices for {tenant.name}</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-primary-500/10 via-surface-light to-surface-light border border-primary-500/20 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">Current Plan</span>
              {currentPlan.popular && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded">POPULAR</span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-text-primary">{currentPlan.name}</h2>
            <p className="text-sm text-text-secondary mt-1">
              ${billingInterval === 'monthly' ? currentPlan.price.monthly : (currentPlan.price.yearly / 12).toFixed(0)}
              <span className="text-text-muted">/month</span>
              {billingInterval === 'yearly' && <span className="ml-2 text-xs text-low">Save 17% with annual billing</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Next billing date</p>
            <p className="text-sm font-medium text-text-primary">Feb 1, 2026</p>
            <p className="text-xs text-text-muted mt-2">Total spent (YTD)</p>
            <p className="text-lg font-bold text-text-primary">${totalSpent}</p>
          </div>
        </div>

        {/* Usage Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
          {[
            { label: 'Scans', used: tenant.usage.scansThisMonth, limit: currentPlan.limits.scans },
            { label: 'Findings', used: tenant.usage.findingsStored, limit: currentPlan.limits.findings },
            { label: 'Storage', used: tenant.usage.storageUsedMB, limit: currentPlan.limits.storageMB, isMB: true },
            { label: 'Team', used: tenant.usage.teamMembers, limit: currentPlan.limits.teamMembers },
          ].map(u => {
            const percent = Math.round((u.used / u.limit) * 100);
            return (
              <div key={u.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">{u.label}</span>
                  <span className="text-text-secondary font-medium">{percent}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percent > 80 ? 'bg-critical' : percent > 60 ? 'bg-medium' : 'bg-low'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  {u.isMB ? `${(u.used / 1024).toFixed(1)}GB` : u.used.toLocaleString()} / {u.isMB ? `${(u.limit / 1024).toFixed(0)}GB` : u.limit.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-2 bg-surface-light border border-border rounded-xl p-2 w-fit mx-auto">
        <button
          onClick={() => setBillingInterval('monthly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            billingInterval === 'monthly' ? 'bg-primary-500/10 text-primary-400' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingInterval('yearly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            billingInterval === 'yearly' ? 'bg-primary-500/10 text-primary-400' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Yearly <span className="text-xs text-low ml-1">-17%</span>
        </button>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {billingPlans.map(plan => {
          const isCurrent = plan.id === tenant.plan;
          const price = billingInterval === 'monthly' ? plan.price.monthly : (plan.price.yearly / 12);
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isCurrent ? 'bg-primary-500/5 border-primary-500/30 shadow-lg shadow-primary-500/5' :
                plan.popular ? 'bg-surface-light border-border' : 'bg-surface-light border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <Check className="w-5 h-5 text-low" />
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'enterprise' ? <Crown className="w-5 h-5 text-amber-400" /> :
                   plan.id === 'pro' ? <Zap className="w-5 h-5 text-primary-400" /> :
                   <Building2 className="w-5 h-5 text-text-muted" />}
                  <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">${price}</span>
                  <span className="text-sm text-text-muted">/month</span>
                </div>
                {billingInterval === 'yearly' && plan.price.yearly > 0 && (
                  <p className="text-xs text-text-muted mt-1">${plan.price.yearly} billed annually</p>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-low flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent ? 'bg-surface text-text-muted cursor-not-allowed' :
                  plan.popular ? 'bg-primary-600 hover:bg-primary-700 text-white' :
                  'bg-surface border border-border hover:border-border-light text-text-primary'
                }`}
              >
                {isCurrent ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Methods & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Payment Methods</h3>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-primary-400 hover:text-primary-300">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/50">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-[10px] font-bold">
                  {pm.type === 'card' ? pm.brand?.charAt(0) : '🏦'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    {pm.type === 'card' ? `${pm.brand} •••• ${pm.last4}` : 'Bank Transfer'}
                  </p>
                  {pm.type === 'card' && (
                    <p className="text-xs text-text-muted">Expires {pm.expMonth}/{pm.expYear}</p>
                  )}
                </div>
                {pm.isDefault && (
                  <span className="px-2 py-0.5 text-[10px] bg-low/10 text-low rounded border border-low/20">Default</span>
                )}
                <button className="p-1 text-text-muted hover:text-text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-surface-light border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Invoice History</h3>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-primary-400 hover:text-primary-300">
              <Download className="w-3 h-3" /> Export All
            </button>
          </div>
          <div className="space-y-2">
            {tenantInvoices.map(invoice => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(selectedInvoice === invoice.id ? null : invoice.id)}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-border cursor-pointer transition-colors"
              >
                <Receipt className="w-4 h-4 text-text-muted" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary font-mono">{invoice.number}</p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                      invoice.status === 'paid' ? 'bg-low/10 text-low' :
                      invoice.status === 'pending' ? 'bg-medium/10 text-medium' :
                      invoice.status === 'failed' ? 'bg-critical/10 text-critical' : 'bg-text-muted/10 text-text-muted'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(invoice.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">${invoice.amount}</p>
                  <button className="text-xs text-primary-400 hover:text-primary-300 mt-0.5">PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-surface-light border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" /> Billing Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Current MRR</p>
            <p className="text-xl font-bold text-text-primary mt-1">${currentPlan.price.monthly}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Annual Value</p>
            <p className="text-xl font-bold text-text-primary mt-1">${currentPlan.price.yearly}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Total Invoices</p>
            <p className="text-xl font-bold text-text-primary mt-1">{tenantInvoices.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
            <p className="text-xs text-text-muted">Total Paid</p>
            <p className="text-xl font-bold text-low mt-1">${totalSpent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
