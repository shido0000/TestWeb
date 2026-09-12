import {
  AIInsight, AIPattern, AIPrediction, VisualAnomaly,
  Tenant, BillingPlan, Invoice, PaymentMethod
} from '../types';

// ===== AI INSIGHTS =====
export const aiInsights: AIInsight[] = [
  {
    id: 'ai1', type: 'prioritization', category: 'Security',
    title: 'Critical Security Cluster Detected',
    description: 'Three critical findings share a common root cause: missing server-side input validation. Fixing the validation layer will likely resolve all three.',
    confidence: 'very-high', confidenceScore: 94,
    affectedFindings: ['f1', 'f2', 'f3'],
    impact: 'critical',
    reasoning: 'ML model detected semantic similarity (cosine 0.87) between findings and traced them to /api/search endpoint. Historical data shows input validation fixes resolve 92% of similar clusters.',
    features: [
      { name: 'CWE proximity', weight: 0.32 },
      { name: 'URL path overlap', weight: 0.28 },
      { name: 'Historical resolution', weight: 0.22 },
      { name: 'Code proximity', weight: 0.18 },
    ],
    createdAt: '2026-01-21T09:00:00Z', actionUrl: '/findings',
  },
  {
    id: 'ai2', type: 'pattern', category: 'Accessibility',
    title: 'Recurring A11y Pattern: Missing Labels',
    description: 'Form inputs without labels appear in 67% of scanned pages. This is a systemic issue, not isolated incidents.',
    confidence: 'high', confidenceScore: 87,
    affectedFindings: ['f4', 'f11'],
    impact: 'high',
    reasoning: 'Pattern detection across 47 pages shows 12 instances of unlabeled inputs, concentrated in forms built with custom components. Component library audit recommended.',
    features: [
      { name: 'Frequency', weight: 0.35 },
      { name: 'Component reuse', weight: 0.30 },
      { name: 'WCAG impact', weight: 0.20 },
      { name: 'User reports', weight: 0.15 },
    ],
    createdAt: '2026-01-21T09:05:00Z',
  },
  {
    id: 'ai3', type: 'prediction', category: 'Performance',
    title: 'Performance Degradation Predicted',
    description: 'Based on 30-day trend, LCP will exceed 5s within 7 days if current image optimization trajectory continues.',
    confidence: 'high', confidenceScore: 82,
    affectedFindings: ['f6'],
    impact: 'high',
    reasoning: 'Linear regression on LCP values shows +180ms/week growth. Main contributor is hero image size increasing with each product addition. Without intervention, threshold breach is imminent.',
    features: [
      { name: 'Trend slope', weight: 0.40 },
      { name: 'Asset growth rate', weight: 0.30 },
      { name: 'Seasonal pattern', weight: 0.15 },
      { name: 'Code churn', weight: 0.15 },
    ],
    createdAt: '2026-01-21T09:10:00Z',
  },
  {
    id: 'ai4', type: 'correlation', category: 'Cross-functional',
    title: 'Security Findings Correlate with Deploy Frequency',
    description: '85% of security findings appear within 48h of deployments to staging. CI/CD gate is missing security suite.',
    confidence: 'very-high', confidenceScore: 91,
    affectedFindings: ['f1', 'f2', 'f15', 'f16'],
    impact: 'critical',
    reasoning: 'Temporal correlation analysis (Pearson r=0.85) between deployment timestamps and security finding discovery. Current CI pipeline only runs accessibility + performance suites.',
    features: [
      { name: 'Temporal correlation', weight: 0.38 },
      { name: 'Deploy frequency', weight: 0.25 },
      { name: 'Suite coverage gap', weight: 0.22 },
      { name: 'Historical pattern', weight: 0.15 },
    ],
    createdAt: '2026-01-21T09:15:00Z', actionUrl: '/cicd',
  },
  {
    id: 'ai5', type: 'recommendation', category: 'Testing',
    title: 'Expand Visual Regression Coverage',
    description: 'Only 23% of pages have visual baselines. Pages without baselines have 3x more user-reported UI bugs.',
    confidence: 'medium', confidenceScore: 73,
    affectedFindings: ['f9'],
    impact: 'medium',
    reasoning: 'Comparing pages with/without visual baselines shows statistically significant difference in UI bug reports (p<0.01). Recommendation: enable visual regression on all high-traffic pages.',
    features: [
      { name: 'Coverage gap', weight: 0.35 },
      { name: 'Bug correlation', weight: 0.30 },
      { name: 'Traffic weight', weight: 0.20 },
      { name: 'Change frequency', weight: 0.15 },
    ],
    createdAt: '2026-01-21T09:20:00Z', actionUrl: '/visual-regression',
  },
  {
    id: 'ai6', type: 'prioritization', category: 'UX',
    title: 'Checkout Flow at Risk',
    description: 'Combining console errors, visual regressions, and performance issues, the checkout flow has the highest compound risk score.',
    confidence: 'high', confidenceScore: 88,
    affectedFindings: ['f6', 'f7', 'f9'],
    impact: 'critical',
    reasoning: 'Multi-suite risk aggregation shows checkout has findings in 3 suites simultaneously. Revenue impact analysis estimates $12K/day at risk based on conversion rate sensitivity.',
    features: [
      { name: 'Multi-suite overlap', weight: 0.30 },
      { name: 'Revenue impact', weight: 0.35 },
      { name: 'User flow criticality', weight: 0.20 },
      { name: 'Finding age', weight: 0.15 },
    ],
    createdAt: '2026-01-21T09:25:00Z',
  },
];

export const aiPatterns: AIPattern[] = [
  { id: 'pat1', name: 'Missing Alt Text Cluster', description: 'Images in product grids consistently lack alt attributes', occurrences: 12, severity: 'high', relatedUrls: ['/products', '/products/laptop-pro', '/collections'], suggestion: 'Update Image component to require alt prop', confidence: 92 },
  { id: 'pat2', name: 'Contrast Failure Pattern', description: 'Gray text on white backgrounds fails WCAG in multiple components', occurrences: 8, severity: 'high', relatedUrls: ['/products', '/checkout', '/account'], suggestion: 'Update design tokens: change text-muted from #999 to #666', confidence: 88 },
  { id: 'pat3', name: 'Console Error Spike', description: 'Unhandled promise rejections increasing 15% week-over-week', occurrences: 23, severity: 'medium', relatedUrls: ['/checkout', '/account/orders'], suggestion: 'Add global error boundary and Promise rejection handler', confidence: 79 },
  { id: 'pat4', name: '404 Link Decay', description: 'Internal links breaking after content restructure', occurrences: 8, severity: 'medium', relatedUrls: ['/products/sale', '/blog/2025'], suggestion: 'Implement redirect map for old URLs', confidence: 85 },
];

export const aiPredictions: AIPrediction[] = [
  { id: 'pred1', title: 'LCP threshold breach', probability: 87, timeframe: '7 days', description: 'LCP will exceed 5s based on current asset growth trajectory', preventiveAction: 'Implement automatic image optimization pipeline', relatedComponents: ['HeroImage', 'ProductGrid'], historicalBasis: 92 },
  { id: 'pred2', title: 'New accessibility violation', probability: 72, timeframe: '14 days', description: 'New form component likely to miss label requirements based on dev patterns', preventiveAction: 'Add a11y linting rules and component templates', relatedComponents: ['ContactForm', 'NewsletterSignup'], historicalBasis: 78 },
  { id: 'pred3', title: 'Security header regression', probability: 65, timeframe: '30 days', description: 'CSP header likely to be weakened during upcoming feature work', preventiveAction: 'Add CSP regression test to CI pipeline', relatedComponents: ['nginx.conf', 'security-headers'], historicalBasis: 70 },
  { id: 'pred4', title: 'Visual regression in checkout', probability: 58, timeframe: '21 days', description: 'Payment form redesign may introduce layout shifts', preventiveAction: 'Lock visual baseline before redesign begins', relatedComponents: ['PaymentForm', 'CheckoutLayout'], historicalBasis: 65 },
];

// ===== VISUAL ANOMALIES =====
export const visualAnomalies: VisualAnomaly[] = [
  {
    id: 'va1', type: 'layout_shift', severity: 'major',
    url: 'https://shop.example.com/products', viewport: '1920x1080',
    title: 'Product Grid Misalignment',
    description: 'Product cards shifted 15px right, breaking 4-column grid alignment',
    detectedAt: '2026-01-21T08:00:00Z', introducedAt: '2026-01-20T16:30:00Z',
    baselineValue: 'grid-template-columns: repeat(4, 1fr)', currentValue: 'grid-template-columns: repeat(4, 1fr) + margin-left: 15px',
    delta: '+15px horizontal offset', confidence: 94,
    affectedElements: ['.product-card', '.product-grid'], status: 'new',
  },
  {
    id: 'va2', type: 'color_drift', severity: 'minor',
    url: 'https://shop.example.com/', viewport: '1920x1080',
    title: 'CTA Button Color Shift',
    description: 'Primary button color shifted from #2563EB to #3B82F6 (lighter blue)',
    detectedAt: '2026-01-21T08:05:00Z', introducedAt: '2026-01-20T14:00:00Z',
    baselineValue: '#2563EB', currentValue: '#3B82F6',
    delta: 'ΔE = 8.2 (perceptible)', confidence: 88,
    affectedElements: ['.btn-primary', '.cta-button'], status: 'acknowledged',
  },
  {
    id: 'va3', type: 'typography_mismatch', severity: 'major',
    url: 'https://shop.example.com/checkout', viewport: '1920x1080',
    title: 'Font Family Inconsistency',
    description: 'Checkout form switched from Inter to system-ui, breaking brand consistency',
    detectedAt: '2026-01-21T08:10:00Z', introducedAt: '2026-01-20T18:00:00Z',
    baselineValue: 'font-family: Inter, sans-serif', currentValue: 'font-family: system-ui',
    delta: 'Font family changed', confidence: 96,
    affectedElements: ['body', '.checkout-form', 'input'], status: 'new',
  },
  {
    id: 'va4', type: 'missing_element', severity: 'critical',
    url: 'https://shop.example.com/products/laptop-pro', viewport: '375x812',
    title: 'Add to Cart Button Missing on Mobile',
    description: 'Primary CTA button not rendered on mobile viewport',
    detectedAt: '2026-01-21T08:15:00Z', introducedAt: '2026-01-21T02:00:00Z',
    baselineValue: 'button.add-to-cart visible', currentValue: 'element not in DOM',
    delta: 'Element missing', confidence: 99,
    affectedElements: ['.add-to-cart-btn'], status: 'new',
  },
  {
    id: 'va5', type: 'spacing_anomaly', severity: 'minor',
    url: 'https://shop.example.com/', viewport: '1920x1080',
    title: 'Hero Section Padding Increase',
    description: 'Hero section top padding increased from 80px to 120px',
    detectedAt: '2026-01-21T08:20:00Z',
    baselineValue: 'padding-top: 80px', currentValue: 'padding-top: 120px',
    delta: '+40px', confidence: 82,
    affectedElements: ['.hero-section'], status: 'ignored',
  },
  {
    id: 'va6', type: 'responsive_break', severity: 'major',
    url: 'https://shop.example.com/cart', viewport: '768x1024',
    title: 'Cart Table Overflow on Tablet',
    description: 'Cart table exceeds viewport width, causing horizontal scroll',
    detectedAt: '2026-01-21T08:25:00Z', introducedAt: '2026-01-20T20:00:00Z',
    baselineValue: 'width: 100%, overflow: hidden', currentValue: 'width: 1024px, overflow: visible',
    delta: '+256px overflow', confidence: 91,
    affectedElements: ['.cart-table', '.cart-container'], status: 'new',
  },
  {
    id: 'va7', type: 'new_element', severity: 'cosmetic',
    url: 'https://shop.example.com/', viewport: '1920x1080',
    title: 'Unexpected Banner Appeared',
    description: 'New promotional banner appeared above navigation without design review',
    detectedAt: '2026-01-21T08:30:00Z', introducedAt: '2026-01-21T06:00:00Z',
    baselineValue: 'No banner element', currentValue: '.promo-banner visible (height: 48px)',
    delta: 'New element added', confidence: 85,
    affectedElements: ['.promo-banner'], status: 'acknowledged',
  },
  {
    id: 'va8', type: 'motion_anomaly', severity: 'minor',
    url: 'https://shop.example.com/products', viewport: '1920x1080',
    title: 'Animation Duration Increased',
    description: 'Product card hover animation duration changed from 200ms to 800ms',
    detectedAt: '2026-01-21T08:35:00Z',
    baselineValue: 'transition: all 200ms ease', currentValue: 'transition: all 800ms ease',
    delta: '+600ms duration', confidence: 78,
    affectedElements: ['.product-card'], status: 'acknowledged',
  },
];

// ===== TENANTS =====
export const tenants: Tenant[] = [
  {
    id: 'tenant1', name: 'Acme Corporation', slug: 'acme-corp', plan: 'enterprise', status: 'active',
    createdAt: '2025-06-15T10:00:00Z', billingEmail: 'billing@acme.com',
    members: [
      { id: 'm1', userId: 'u1', name: 'Alex Rivera', email: 'alex@acme.com', role: 'owner', joinedAt: '2025-06-15T10:00:00Z', lastActive: '2026-01-21T09:00:00Z' },
      { id: 'm2', userId: 'u2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'admin', joinedAt: '2025-07-01T10:00:00Z', lastActive: '2026-01-21T08:30:00Z' },
      { id: 'm3', userId: 'u3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'member', joinedAt: '2025-08-15T10:00:00Z', lastActive: '2026-01-20T16:00:00Z' },
      { id: 'm4', userId: 'u4', name: 'Lisa Park', email: 'lisa@acme.com', role: 'viewer', joinedAt: '2025-10-01T10:00:00Z', lastActive: '2026-01-19T12:00:00Z' },
      { id: 'm5', userId: 'u5', name: 'Tom Wilson', email: 'tom@acme.com', role: 'member', joinedAt: '2025-11-10T10:00:00Z', lastActive: '2026-01-21T07:45:00Z' },
    ],
    usage: { scansThisMonth: 847, scansLimit: 5000, findingsStored: 2340, findingsLimit: 50000, storageUsedMB: 12400, storageLimitMB: 100000, apiCallsThisMonth: 23400, apiCallsLimit: 500000, teamMembers: 5, teamMembersLimit: 50, projectsCount: 12, projectsLimit: 100 },
    settings: { defaultScanDepth: 5, rateLimitPerSecond: 20, dataRetentionDays: 365, ssoEnabled: true, auditLogEnabled: true, customDomain: 'testing.acme.com', ipAllowlist: ['10.0.0.0/8', '172.16.0.0/12'] },
  },
  {
    id: 'tenant2', name: 'StartupXYZ', slug: 'startupxyz', plan: 'pro', status: 'active',
    createdAt: '2025-11-01T10:00:00Z', billingEmail: 'dev@startupxyz.io',
    members: [
      { id: 'm6', userId: 'u6', name: 'Jamie Lee', email: 'jamie@startupxyz.io', role: 'owner', joinedAt: '2025-11-01T10:00:00Z', lastActive: '2026-01-21T09:15:00Z' },
      { id: 'm7', userId: 'u7', name: 'Robin Garcia', email: 'robin@startupxyz.io', role: 'member', joinedAt: '2025-12-01T10:00:00Z', lastActive: '2026-01-20T18:00:00Z' },
    ],
    usage: { scansThisMonth: 234, scansLimit: 1000, findingsStored: 580, findingsLimit: 10000, storageUsedMB: 2100, storageLimitMB: 20000, apiCallsThisMonth: 8900, apiCallsLimit: 100000, teamMembers: 2, teamMembersLimit: 10, projectsCount: 4, projectsLimit: 20 },
    settings: { defaultScanDepth: 3, rateLimitPerSecond: 10, dataRetentionDays: 90, ssoEnabled: false, auditLogEnabled: false, ipAllowlist: [] },
  },
  {
    id: 'tenant3', name: 'DevAgency', slug: 'devagency', plan: 'free', status: 'trial',
    createdAt: '2026-01-10T10:00:00Z', billingEmail: 'hello@devagency.co',
    members: [
      { id: 'm8', userId: 'u8', name: 'Casey Brown', email: 'casey@devagency.co', role: 'owner', joinedAt: '2026-01-10T10:00:00Z', lastActive: '2026-01-21T10:00:00Z' },
    ],
    usage: { scansThisMonth: 12, scansLimit: 50, findingsStored: 45, findingsLimit: 500, storageUsedMB: 120, storageLimitMB: 1000, apiCallsThisMonth: 340, apiCallsLimit: 5000, teamMembers: 1, teamMembersLimit: 2, projectsCount: 1, projectsLimit: 3 },
    settings: { defaultScanDepth: 2, rateLimitPerSecond: 5, dataRetentionDays: 30, ssoEnabled: false, auditLogEnabled: false, ipAllowlist: [] },
  },
];

// ===== BILLING PLANS =====
export const billingPlans: BillingPlan[] = [
  {
    id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 },
    limits: { scans: 50, findings: 500, storageMB: 1000, apiCalls: 5000, teamMembers: 2, projects: 3 },
    features: ['50 scans/month', '500 findings stored', '1 GB storage', '5,000 API calls', '2 team members', '3 projects', 'Community support', 'Basic suites (A11y, Links, SEO)'],
  },
  {
    id: 'pro', name: 'Pro', price: { monthly: 99, yearly: 990 },
    limits: { scans: 1000, findings: 10000, storageMB: 20000, apiCalls: 100000, teamMembers: 10, projects: 20 },
    features: ['1,000 scans/month', '10,000 findings', '20 GB storage', '100K API calls', '10 team members', '20 projects', 'All test suites', 'AI prioritization', 'CI/CD integrations', 'Email support', 'Custom reports'],
    popular: true,
  },
  {
    id: 'enterprise', name: 'Enterprise', price: { monthly: 499, yearly: 4990 },
    limits: { scans: 5000, findings: 50000, storageMB: 100000, apiCalls: 500000, teamMembers: 50, projects: 100 },
    features: ['5,000 scans/month', '50,000 findings', '100 GB storage', '500K API calls', '50 team members', '100 projects', 'All Pro features', 'SSO/SAML', 'Audit logs', 'Custom domain', 'Dedicated support', 'SLA 99.9%', 'On-premise option', 'Custom integrations'],
  },
];

// ===== INVOICES =====
export const invoices: Invoice[] = [
  {
    id: 'inv1', tenantId: 'tenant1', number: 'TH-2026-001', date: '2026-01-01T00:00:00Z', dueDate: '2026-01-15T00:00:00Z',
    status: 'paid', amount: 499, currency: 'USD',
    items: [
      { description: 'Enterprise Plan (January 2026)', quantity: 1, unitPrice: 499, total: 499 },
    ],
  },
  {
    id: 'inv2', tenantId: 'tenant1', number: 'TH-2025-012', date: '2025-12-01T00:00:00Z', dueDate: '2025-12-15T00:00:00Z',
    status: 'paid', amount: 499, currency: 'USD',
    items: [
      { description: 'Enterprise Plan (December 2025)', quantity: 1, unitPrice: 499, total: 499 },
    ],
  },
  {
    id: 'inv3', tenantId: 'tenant1', number: 'TH-2025-011', date: '2025-11-01T00:00:00Z', dueDate: '2025-11-15T00:00:00Z',
    status: 'paid', amount: 589, currency: 'USD',
    items: [
      { description: 'Enterprise Plan (November 2025)', quantity: 1, unitPrice: 499, total: 499 },
      { description: 'Additional storage (50 GB)', quantity: 1, unitPrice: 90, total: 90 },
    ],
  },
  {
    id: 'inv4', tenantId: 'tenant2', number: 'TH-2026-002', date: '2026-01-01T00:00:00Z', dueDate: '2026-01-15T00:00:00Z',
    status: 'paid', amount: 99, currency: 'USD',
    items: [
      { description: 'Pro Plan (January 2026)', quantity: 1, unitPrice: 99, total: 99 },
    ],
  },
  {
    id: 'inv5', tenantId: 'tenant1', number: 'TH-2025-010', date: '2025-10-01T00:00:00Z', dueDate: '2025-10-15T00:00:00Z',
    status: 'refunded', amount: 499, currency: 'USD',
    items: [
      { description: 'Enterprise Plan (October 2025)', quantity: 1, unitPrice: 499, total: 499 },
    ],
  },
];

// ===== PAYMENT METHODS =====
export const paymentMethods: PaymentMethod[] = [
  { id: 'pm1', type: 'card', brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2028, isDefault: true },
  { id: 'pm2', type: 'card', brand: 'Mastercard', last4: '8888', expMonth: 6, expYear: 2027, isDefault: false },
  { id: 'pm3', type: 'bank_transfer', isDefault: false },
];
