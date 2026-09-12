import {
  Project, Scan, Finding, DashboardStats, User, Target, Integration,
  CrawlResult, PerformanceMetrics, AccessibilityResult, SecurityResult,
  VisualDiff, E2EFlow, CICDConfig, ApiKey
} from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@testhub.io',
  role: 'admin',
};

export const projects: Project[] = [
  {
    id: 'p1',
    name: 'E-Commerce Platform',
    description: 'Main production e-commerce application with payment processing',
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    targets: [],
    findingsCount: { critical: 3, high: 7, medium: 12, low: 23, info: 8, warning: 5 },
    lastScanDate: '2026-01-20T14:30:00Z',
    tags: ['production', 'critical'],
  },
  {
    id: 'p2',
    name: 'Corporate Website',
    description: 'Public-facing marketing website with CMS',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-19T09:15:00Z',
    targets: [],
    findingsCount: { critical: 0, high: 2, medium: 8, low: 15, info: 12, warning: 3 },
    lastScanDate: '2026-01-19T09:15:00Z',
    tags: ['marketing', 'public'],
  },
  {
    id: 'p3',
    name: 'Admin Dashboard',
    description: 'Internal admin panel for operations team',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-18T16:45:00Z',
    targets: [],
    findingsCount: { critical: 1, high: 4, medium: 6, low: 9, info: 4, warning: 2 },
    lastScanDate: '2026-01-18T16:45:00Z',
    tags: ['internal', 'admin'],
  },
  {
    id: 'p4',
    name: 'Mobile API Docs',
    description: 'API documentation portal for mobile developers',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-17T11:20:00Z',
    targets: [],
    findingsCount: { critical: 0, high: 1, medium: 3, low: 7, info: 15, warning: 1 },
    lastScanDate: '2026-01-17T11:20:00Z',
    tags: ['documentation', 'api'],
  },
];

export const targets: Target[] = [
  {
    id: 't1', projectId: 'p1', url: 'https://shop.example.com', name: 'Production Store',
    environment: 'production', authRequired: false,
    scope: { allowedDomains: ['shop.example.com', 'cdn.example.com'], excludedPaths: ['/admin', '/api/internal'], maxDepth: 5 },
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 't2', projectId: 'p1', url: 'https://staging-shop.example.com', name: 'Staging Store',
    environment: 'staging', authRequired: true,
    headers: { 'Authorization': 'Bearer staging-token' },
    scope: { allowedDomains: ['staging-shop.example.com'], excludedPaths: ['/debug'], maxDepth: 4 },
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 't3', projectId: 'p2', url: 'https://www.example-corp.com', name: 'Corporate Site',
    environment: 'production', authRequired: false,
    scope: { allowedDomains: ['www.example-corp.com'], excludedPaths: [], maxDepth: 3 },
    createdAt: '2025-12-01T08:00:00Z',
  },
  {
    id: 't4', projectId: 'p3', url: 'https://admin.example.com', name: 'Admin Panel',
    environment: 'production', authRequired: true,
    headers: { 'X-Internal-Token': 'admin-secret' },
    scope: { allowedDomains: ['admin.example.com'], excludedPaths: ['/health'], maxDepth: 4 },
    createdAt: '2026-01-05T11:00:00Z',
  },
  {
    id: 't5', projectId: 'p4', url: 'https://docs.api.example.com', name: 'API Docs Portal',
    environment: 'production', authRequired: false,
    scope: { allowedDomains: ['docs.api.example.com'], excludedPaths: [], maxDepth: 3 },
    createdAt: '2026-01-10T09:00:00Z',
  },
];

export const scans: Scan[] = [
  {
    id: 's1', projectId: 'p1', targetId: 't1', targetUrl: 'https://shop.example.com',
    suites: ['console_errors', 'broken_links', 'accessibility', 'performance', 'security', 'visual_regression'],
    status: 'completed', progress: 100,
    startedAt: '2026-01-20T14:00:00Z', completedAt: '2026-01-20T14:30:00Z', duration: 1800,
    findingsSummary: { critical: 3, high: 7, medium: 12, low: 23, info: 8, warning: 5 },
    triggeredBy: 'Alex Rivera', pagesScanned: 47, totalRequests: 1283,
  },
  {
    id: 's2', projectId: 'p2', targetId: 't3', targetUrl: 'https://www.example-corp.com',
    suites: ['broken_links', 'accessibility', 'seo', 'performance'],
    status: 'completed', progress: 100,
    startedAt: '2026-01-19T08:45:00Z', completedAt: '2026-01-19T09:15:00Z', duration: 1800,
    findingsSummary: { critical: 0, high: 2, medium: 8, low: 15, info: 12, warning: 3 },
    triggeredBy: 'Scheduled', pagesScanned: 23, totalRequests: 654,
  },
  {
    id: 's3', projectId: 'p3', targetId: 't4', targetUrl: 'https://admin.example.com',
    suites: ['console_errors', 'accessibility', 'security', 'visual_regression'],
    status: 'running', progress: 67,
    startedAt: '2026-01-21T10:00:00Z',
    findingsSummary: { critical: 1, high: 2, medium: 3, low: 4, info: 1, warning: 1 },
    triggeredBy: 'Alex Rivera', pagesScanned: 12, totalRequests: 340,
  },
  {
    id: 's4', projectId: 'p1', targetId: 't2', targetUrl: 'https://staging-shop.example.com',
    suites: ['console_errors', 'broken_links', 'accessibility', 'performance'],
    status: 'pending', progress: 0,
    startedAt: '2026-01-21T11:00:00Z',
    findingsSummary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 },
    triggeredBy: 'CI/CD Pipeline', pagesScanned: 0, totalRequests: 0,
  },
  {
    id: 's5', projectId: 'p4', targetId: 't5', targetUrl: 'https://docs.api.example.com',
    suites: ['broken_links', 'seo', 'accessibility'],
    status: 'failed', progress: 45,
    startedAt: '2026-01-17T10:30:00Z', completedAt: '2026-01-17T11:20:00Z', duration: 3000,
    findingsSummary: { critical: 0, high: 1, medium: 3, low: 7, info: 15, warning: 1 },
    triggeredBy: 'Alex Rivera', pagesScanned: 18, totalRequests: 420,
  },
];

export const findings: Finding[] = [
  {
    id: 'f1', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'critical', status: 'open',
    title: 'Missing Content-Security-Policy Header',
    description: 'The application does not set a Content-Security-Policy header, leaving it vulnerable to XSS attacks and data injection.',
    url: 'https://shop.example.com/', evidence: 'Response headers do not include CSP directive',
    recommendation: 'Implement a strict Content-Security-Policy header. Start with report-only mode and gradually enforce restrictions.',
    cweId: 'CWE-693', cvssScore: 8.2, createdAt: '2026-01-20T14:15:00Z', updatedAt: '2026-01-20T14:15:00Z', duplicated: false, riskScore: 95,
  },
  {
    id: 'f2', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'critical', status: 'open',
    title: 'SQL Injection Vulnerability in Search',
    description: 'The search endpoint is vulnerable to SQL injection through the "q" parameter.',
    url: 'https://shop.example.com/search?q=test', evidence: 'Payload: \' OR 1=1-- returns all products',
    recommendation: 'Use parameterized queries or prepared statements. Implement input validation and WAF rules.',
    cweId: 'CWE-89', cvssScore: 9.8, createdAt: '2026-01-20T14:18:00Z', updatedAt: '2026-01-20T14:18:00Z', duplicated: false, riskScore: 98,
  },
  {
    id: 'f3', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'critical', status: 'open',
    title: 'Exposed .env File',
    description: 'The .env file is publicly accessible and contains database credentials and API keys.',
    url: 'https://shop.example.com/.env', evidence: 'HTTP 200 response with environment variables including DB_PASSWORD and STRIPE_SECRET_KEY',
    recommendation: 'Remove .env from web root immediately. Configure web server to deny access to dotfiles. Rotate all exposed credentials.',
    cweId: 'CWE-538', cvssScore: 9.1, createdAt: '2026-01-20T14:20:00Z', updatedAt: '2026-01-20T14:20:00Z', duplicated: false, riskScore: 100,
  },
  {
    id: 'f4', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'accessibility', severity: 'high', status: 'open',
    title: 'Images Missing Alt Attributes',
    description: '12 product images on the homepage are missing alt attributes, making them inaccessible to screen readers.',
    url: 'https://shop.example.com/', evidence: 'Found 12 <img> elements without alt attribute',
    recommendation: 'Add descriptive alt text to all images. Use empty alt="" for decorative images.',
    wcagCriteria: 'WCAG 1.1.1', createdAt: '2026-01-20T14:22:00Z', updatedAt: '2026-01-20T14:22:00Z', duplicated: false, riskScore: 72,
  },
  {
    id: 'f5', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'accessibility', severity: 'high', status: 'open',
    title: 'Insufficient Color Contrast on CTA Buttons',
    description: 'Call-to-action buttons use light gray text (#999) on white background (#fff), failing WCAG AA contrast ratio.',
    url: 'https://shop.example.com/products', evidence: 'Contrast ratio: 2.84:1 (minimum required: 4.5:1 for normal text)',
    recommendation: 'Change button text color to at least #767676 for AA compliance or #595959 for AAA.',
    wcagCriteria: 'WCAG 1.4.3', createdAt: '2026-01-20T14:23:00Z', updatedAt: '2026-01-20T14:23:00Z', duplicated: false, riskScore: 68,
  },
  {
    id: 'f6', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'performance', severity: 'high', status: 'open',
    title: 'Largest Contentful Paint exceeds 4s',
    description: 'LCP is 4.8s on the homepage, well above the 2.5s threshold for "Good" rating.',
    url: 'https://shop.example.com/', evidence: 'LCP: 4823ms | Hero image: 2.3MB PNG (should be WebP <200KB)',
    recommendation: 'Convert hero image to WebP/AVIF, implement responsive images with srcset, add lazy loading.',
    createdAt: '2026-01-20T14:25:00Z', updatedAt: '2026-01-20T14:25:00Z', duplicated: false, riskScore: 75,
  },
  {
    id: 'f7', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'console_errors', severity: 'medium', status: 'open',
    title: 'Unhandled Promise Rejection in Checkout',
    description: 'The checkout flow has an unhandled promise rejection that causes the payment form to freeze.',
    url: 'https://shop.example.com/checkout', evidence: 'Uncaught (in promise) TypeError: Cannot read properties of undefined (reading \'token\')',
    recommendation: 'Add proper error handling with try/catch blocks and display user-friendly error messages.',
    createdAt: '2026-01-20T14:26:00Z', updatedAt: '2026-01-20T14:26:00Z', duplicated: false, riskScore: 55,
  },
  {
    id: 'f8', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'broken_links', severity: 'medium', status: 'open',
    title: '8 Broken Internal Links Detected',
    description: 'Multiple internal links return 404 errors, affecting user experience and SEO.',
    url: 'https://shop.example.com/products/sale', evidence: '404 errors on: /products/summer-collection, /about/team, /blog/2025/launch',
    recommendation: 'Fix or remove broken links. Implement redirect rules for moved pages.',
    createdAt: '2026-01-20T14:27:00Z', updatedAt: '2026-01-20T14:27:00Z', duplicated: false, riskScore: 45,
  },
  {
    id: 'f9', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'visual_regression', severity: 'medium', status: 'open',
    title: 'Visual Diff: Product Card Layout Shift',
    description: 'Product cards on the listing page have shifted 15px to the right compared to baseline.',
    url: 'https://shop.example.com/products', evidence: 'Pixel diff shows 12.3% of pixels changed. Layout shift in product grid container.',
    recommendation: 'Review recent CSS changes to product card component. Check for missing flex/grid properties.',
    createdAt: '2026-01-20T14:28:00Z', updatedAt: '2026-01-20T14:28:00Z', duplicated: false, riskScore: 50,
  },
  {
    id: 'f10', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'console_errors', severity: 'low', status: 'open',
    title: 'Deprecated API Usage: document.execCommand',
    description: 'The rich text editor uses the deprecated document.execCommand API.',
    url: 'https://shop.example.com/admin/products/edit', evidence: '[Deprecation] document.execCommand() is deprecated.',
    recommendation: 'Migrate to the modern Clipboard API and Input Events API.',
    createdAt: '2026-01-20T14:29:00Z', updatedAt: '2026-01-20T14:29:00Z', duplicated: false, riskScore: 25,
  },
  {
    id: 'f11', scanId: 's2', projectId: 'p2', targetId: 't3', suite: 'accessibility', severity: 'high', status: 'open',
    title: 'Form Inputs Without Associated Labels',
    description: 'Contact form has 3 input fields without associated <label> elements.',
    url: 'https://www.example-corp.com/contact', evidence: 'Inputs: #name, #email, #message lack labels',
    recommendation: 'Add <label> elements with matching for/id attributes.',
    wcagCriteria: 'WCAG 1.3.1', createdAt: '2026-01-19T08:55:00Z', updatedAt: '2026-01-19T08:55:00Z', duplicated: false, riskScore: 70,
  },
  {
    id: 'f12', scanId: 's2', projectId: 'p2', targetId: 't3', suite: 'seo', severity: 'high', status: 'open',
    title: 'Missing Meta Description on 5 Pages',
    description: 'Five pages lack meta description tags, negatively impacting search engine rankings.',
    url: 'https://www.example-corp.com/services', evidence: 'Pages without meta description: /services, /about, /team, /careers, /blog',
    recommendation: 'Add unique, descriptive meta descriptions (150-160 characters) to all pages.',
    createdAt: '2026-01-19T09:00:00Z', updatedAt: '2026-01-19T09:00:00Z', duplicated: false, riskScore: 60,
  },
  {
    id: 'f13', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'warning', status: 'open',
    title: 'Cookies Without Secure Flag',
    description: '3 cookies are set without the Secure flag.',
    url: 'https://shop.example.com/', evidence: 'Cookies without Secure flag: session_id, cart_token, analytics_uid',
    recommendation: 'Set the Secure flag on all cookies. Ensure all traffic is served over HTTPS.',
    createdAt: '2026-01-20T14:30:00Z', updatedAt: '2026-01-20T14:30:00Z', duplicated: false, riskScore: 40,
  },
  {
    id: 'f14', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'performance', severity: 'info', status: 'open',
    title: 'Unused JavaScript Detected (45KB)',
    description: 'Lighthouse detected 45KB of unused JavaScript.',
    url: 'https://shop.example.com/', evidence: 'Unused JS bundles: vendor-charts.js (23KB), analytics-extra.js (12KB)',
    recommendation: 'Implement code splitting and dynamic imports.',
    createdAt: '2026-01-20T14:30:00Z', updatedAt: '2026-01-20T14:30:00Z', duplicated: false, riskScore: 20,
  },
  {
    id: 'f15', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'high', status: 'open',
    title: 'Missing X-Frame-Options Header',
    description: 'The site can be embedded in iframes, enabling clickjacking attacks.',
    url: 'https://shop.example.com/', evidence: 'X-Frame-Options header not present in response',
    recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN header to all responses.',
    cweId: 'CWE-1021', cvssScore: 6.1, createdAt: '2026-01-20T14:16:00Z', updatedAt: '2026-01-20T14:16:00Z', duplicated: false, riskScore: 78,
  },
  {
    id: 'f16', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'high', status: 'open',
    title: 'TLS 1.0 and 1.1 Still Enabled',
    description: 'The server accepts connections using deprecated TLS 1.0 and 1.1 protocols.',
    url: 'https://shop.example.com/', evidence: 'SSL Labs scan shows TLS 1.0 and TLS 1.1 enabled',
    recommendation: 'Disable TLS 1.0 and 1.1. Only allow TLS 1.2 and 1.3.',
    cweId: 'CWE-326', cvssScore: 7.4, createdAt: '2026-01-20T14:17:00Z', updatedAt: '2026-01-20T14:17:00Z', duplicated: false, riskScore: 82,
  },
  {
    id: 'f17', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'medium', status: 'open',
    title: 'Server Version Disclosure',
    description: 'The server discloses its version in the Server header (nginx/1.18.0).',
    url: 'https://shop.example.com/', evidence: 'Server: nginx/1.18.0',
    recommendation: 'Configure server_tokens off in nginx configuration.',
    createdAt: '2026-01-20T14:19:00Z', updatedAt: '2026-01-20T14:19:00Z', duplicated: false, riskScore: 35,
  },
  {
    id: 'f18', scanId: 's1', projectId: 'p1', targetId: 't1', suite: 'security', severity: 'high', status: 'open',
    title: 'Nuclei: phpMyAdmin Login Panel Exposed',
    description: 'A phpMyAdmin login panel was detected at /phpmyadmin/ which could be targeted by brute-force attacks.',
    url: 'https://shop.example.com/phpmyadmin/', evidence: 'Matched template: exposed-panels/phpmyadmin-panel.yaml',
    recommendation: 'Remove phpMyAdmin from public access or restrict to internal IPs only.',
    cweId: 'CWE-200', cvssScore: 7.5, createdAt: '2026-01-20T14:21:00Z', updatedAt: '2026-01-20T14:21:00Z', duplicated: false, riskScore: 85,
  },
];

// ===== CRAWL RESULTS =====
export const crawlResults: CrawlResult[] = [
  { id: 'c1', targetId: 't1', url: 'https://shop.example.com/', title: 'Shop - Home', status: 200, depth: 0, contentType: 'text/html', linksFound: 45, resources: 28, loadTime: 1200, discoveredAt: '2026-01-20T14:01:00Z', children: ['c2', 'c3', 'c4', 'c5'], forms: 1, inputs: 3 },
  { id: 'c2', targetId: 't1', url: 'https://shop.example.com/products', title: 'Products', status: 200, depth: 1, contentType: 'text/html', linksFound: 120, resources: 35, loadTime: 980, discoveredAt: '2026-01-20T14:02:00Z', children: ['c6', 'c7'], forms: 2, inputs: 5 },
  { id: 'c3', targetId: 't1', url: 'https://shop.example.com/cart', title: 'Shopping Cart', status: 200, depth: 1, contentType: 'text/html', linksFound: 8, resources: 12, loadTime: 450, discoveredAt: '2026-01-20T14:02:30Z', children: [], forms: 0, inputs: 0 },
  { id: 'c4', targetId: 't1', url: 'https://shop.example.com/checkout', title: 'Checkout', status: 200, depth: 1, contentType: 'text/html', linksFound: 5, resources: 18, loadTime: 670, discoveredAt: '2026-01-20T14:03:00Z', children: [], forms: 3, inputs: 12 },
  { id: 'c5', targetId: 't1', url: 'https://shop.example.com/about', title: 'About Us', status: 200, depth: 1, contentType: 'text/html', linksFound: 12, resources: 8, loadTime: 320, discoveredAt: '2026-01-20T14:03:30Z', children: [], forms: 0, inputs: 0 },
  { id: 'c6', targetId: 't1', url: 'https://shop.example.com/products/laptop-pro', title: 'Laptop Pro', status: 200, depth: 2, contentType: 'text/html', linksFound: 15, resources: 22, loadTime: 890, discoveredAt: '2026-01-20T14:04:00Z', children: [], forms: 1, inputs: 2 },
  { id: 'c7', targetId: 't1', url: 'https://shop.example.com/products/summer-collection', title: 'Summer Collection', status: 404, depth: 2, contentType: 'text/html', linksFound: 3, resources: 5, loadTime: 120, discoveredAt: '2026-01-20T14:04:30Z', children: [], forms: 0, inputs: 0 },
  { id: 'c8', targetId: 't1', url: 'https://shop.example.com/blog', title: 'Blog', status: 200, depth: 1, contentType: 'text/html', linksFound: 30, resources: 15, loadTime: 560, discoveredAt: '2026-01-20T14:05:00Z', children: [], forms: 1, inputs: 2 },
  { id: 'c9', targetId: 't1', url: 'https://shop.example.com/search', title: 'Search', status: 200, depth: 1, contentType: 'text/html', linksFound: 0, resources: 8, loadTime: 230, discoveredAt: '2026-01-20T14:05:30Z', children: [], forms: 1, inputs: 1 },
  { id: 'c10', targetId: 't1', url: 'https://shop.example.com/.env', title: '', status: 200, depth: 2, contentType: 'text/plain', linksFound: 0, resources: 0, loadTime: 50, discoveredAt: '2026-01-20T14:06:00Z', children: [], forms: 0, inputs: 0 },
  { id: 'c11', targetId: 't1', url: 'https://shop.example.com/faq', title: 'FAQ', status: 200, depth: 1, contentType: 'text/html', linksFound: 8, resources: 6, loadTime: 280, discoveredAt: '2026-01-20T14:06:30Z', children: [], forms: 0, inputs: 0 },
  { id: 'c12', targetId: 't1', url: 'https://shop.example.com/contact', title: 'Contact', status: 200, depth: 1, contentType: 'text/html', linksFound: 5, resources: 7, loadTime: 310, discoveredAt: '2026-01-20T14:07:00Z', children: [], forms: 1, inputs: 4 },
];

// ===== PERFORMANCE METRICS =====
export const performanceMetrics: PerformanceMetrics[] = [
  {
    url: 'https://shop.example.com/', fcp: 1200, lcp: 4823, fid: 180, cls: 0.25, ttfb: 450, speedIndex: 3200, tti: 5100, totalBlockingTime: 890,
    performanceScore: 42, accessibilityScore: 68, bestPracticesScore: 75, seoScore: 82, pwaScore: 35,
    totalWeight: 4200000, requests: 87, domNodes: 1842, jsExecutionTime: 2300,
    resources: [
      { type: 'JavaScript', count: 24, transferSize: 1800000, resourceSize: 5400000 },
      { type: 'CSS', count: 8, transferSize: 120000, resourceSize: 380000 },
      { type: 'Image', count: 32, transferSize: 2100000, resourceSize: 3800000 },
      { type: 'Font', count: 4, transferSize: 180000, resourceSize: 240000 },
      { type: 'Document', count: 1, transferSize: 45000, resourceSize: 120000 },
      { type: 'Other', count: 18, transferSize: 95000, resourceSize: 150000 },
    ],
  },
  {
    url: 'https://shop.example.com/products', fcp: 980, lcp: 3200, fid: 120, cls: 0.18, ttfb: 380, speedIndex: 2400, tti: 3800, totalBlockingTime: 620,
    performanceScore: 55, accessibilityScore: 62, bestPracticesScore: 78, seoScore: 88, pwaScore: 35,
    totalWeight: 3100000, requests: 65, domNodes: 1456, jsExecutionTime: 1800,
    resources: [
      { type: 'JavaScript', count: 20, transferSize: 1400000, resourceSize: 4200000 },
      { type: 'CSS', count: 6, transferSize: 95000, resourceSize: 280000 },
      { type: 'Image', count: 28, transferSize: 1500000, resourceSize: 2800000 },
      { type: 'Font', count: 3, transferSize: 105000, resourceSize: 180000 },
    ],
  },
  {
    url: 'https://www.example-corp.com/', fcp: 800, lcp: 1800, fid: 45, cls: 0.05, ttfb: 200, speedIndex: 1200, tti: 2100, totalBlockingTime: 180,
    performanceScore: 82, accessibilityScore: 71, bestPracticesScore: 90, seoScore: 65, pwaScore: 50,
    totalWeight: 1800000, requests: 42, domNodes: 890, jsExecutionTime: 900,
    resources: [
      { type: 'JavaScript', count: 12, transferSize: 680000, resourceSize: 2100000 },
      { type: 'CSS', count: 4, transferSize: 65000, resourceSize: 180000 },
      { type: 'Image', count: 18, transferSize: 950000, resourceSize: 1600000 },
      { type: 'Font', count: 2, transferSize: 85000, resourceSize: 120000 },
    ],
  },
];

// ===== ACCESSIBILITY RESULTS =====
export const accessibilityResults: AccessibilityResult[] = [
  {
    url: 'https://shop.example.com/', violations: 12, passes: 87, incomplete: 5, inapplicable: 23, score: 68, wcagAA: false, wcagAAA: false, contrastIssues: 4,
    violations_detail: [
      { id: 'image-alt', impact: 'critical', description: 'Images must have alternate text', help: 'Ensures <img> elements have alternate text', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/image-alt', nodes: 12, wcagTags: ['wcag2a', 'wcag111'], elements: ['img.product-hero', 'img.thumbnail-1', 'img.thumbnail-2'] },
      { id: 'color-contrast', impact: 'serious', description: 'Elements must have sufficient color contrast', help: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast', nodes: 8, wcagTags: ['wcag2aa', 'wcag143'], elements: ['.btn-cta', '.text-muted', '.nav-link'] },
      { id: 'label', impact: 'serious', description: 'Form elements must have labels', help: 'Ensures every form element has a label', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/label', nodes: 3, wcagTags: ['wcag2a', 'wcag412'], elements: ['#search-input', '#newsletter-email', '#quantity'] },
      { id: 'link-name', impact: 'moderate', description: 'Links must have discernible text', help: 'Ensures links have discernible text', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/link-name', nodes: 5, wcagTags: ['wcag2a', 'wcag412'], elements: ['a.social-icon', 'a.icon-only'] },
      { id: 'heading-order', impact: 'minor', description: 'Heading levels should only increase by one', help: 'Ensures the order of headings is semantically correct', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/heading-order', nodes: 2, wcagTags: ['wcag2a', 'wcag131'], elements: ['h4#skip-h2', 'h5#skip-h3'] },
    ],
  },
  {
    url: 'https://www.example-corp.com/', violations: 7, passes: 94, incomplete: 3, inapplicable: 18, score: 71, wcagAA: false, wcagAAA: false, contrastIssues: 2,
    violations_detail: [
      { id: 'color-contrast', impact: 'serious', description: 'Elements must have sufficient color contrast', help: 'Ensures contrast meets WCAG 2 AA', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast', nodes: 4, wcagTags: ['wcag2aa', 'wcag143'], elements: ['.footer-link', '.breadcrumb'] },
      { id: 'landmark-one-main', impact: 'moderate', description: 'Document must have one main landmark', help: 'Ensures the document has a main landmark', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/landmark-one-main', nodes: 1, wcagTags: ['best-practice'], elements: ['body'] },
      { id: 'region', impact: 'moderate', description: 'All page content should be contained by landmarks', help: 'Ensures all content is within landmarks', helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/region', nodes: 3, wcagTags: ['best-practice'], elements: ['.promo-banner', '.cookie-notice'] },
    ],
  },
];

// ===== SECURITY RESULTS =====
export const securityResults: SecurityResult[] = [
  {
    url: 'https://shop.example.com/', overallGrade: 'C', cookiesSecure: false, mixedContent: true,
    headers: [
      { name: 'Content-Security-Policy', present: false, severity: 'critical', recommendation: 'Add CSP header to prevent XSS and data injection attacks' },
      { name: 'X-Frame-Options', present: false, severity: 'high', recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking' },
      { name: 'X-Content-Type-Options', present: true, value: 'nosniff', severity: 'info' },
      { name: 'Strict-Transport-Security', present: true, value: 'max-age=31536000; includeSubDomains', severity: 'info' },
      { name: 'X-XSS-Protection', present: false, severity: 'low', recommendation: 'Add X-XSS-Protection: 1; mode=block (deprecated but still recommended for older browsers)' },
      { name: 'Referrer-Policy', present: false, severity: 'medium', recommendation: 'Add Referrer-Policy: strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', present: false, severity: 'medium', recommendation: 'Add Permissions-Policy to restrict browser features' },
      { name: 'X-Permitted-Cross-Domain-Policies', present: false, severity: 'low', recommendation: 'Add X-Permitted-Cross-Domain-Policies: none' },
    ],
    ssl: {
      grade: 'B', protocol: 'TLS 1.3', cipher: 'TLS_AES_256_GCM_SHA384', issuer: "Let's Encrypt",
      validFrom: '2025-10-15', validTo: '2026-04-15', daysUntilExpiry: 84,
      supportsHSTS: true, supportsHPKP: false, supportsOCSP: true,
      vulnerableToHeartbleed: false, vulnerableToCCS: false, vulnerableToRenego: false,
      vulnerableToCrime: false, vulnerableToPoodle: false, vulnerableToFreak: false,
      vulnerableToLogjam: false, vulnerableToDrown: false,
    },
    zapAlerts: [
      { id: 'z1', name: 'SQL Injection', risk: 'critical', confidence: 'high', description: 'SQL injection may be possible.', solution: 'Use parameterized queries', url: 'https://shop.example.com/search', cweId: 89, wascid: 1 },
      { id: 'z2', name: 'Cross Site Scripting (Reflected)', risk: 'high', confidence: 'medium', description: 'XSS may be possible via URL parameters.', solution: 'Validate and encode all user input', url: 'https://shop.example.com/search', cweId: 79, wascid: 40 },
      { id: 'z3', name: 'Directory Browsing Enabled', risk: 'medium', confidence: 'high', description: 'Directory listing is enabled on the web server.', solution: 'Disable directory browsing in server configuration', url: 'https://shop.example.com/images/', cweId: 548, wascid: 16 },
      { id: 'z4', name: 'Server Leaks Version Information', risk: 'low', confidence: 'medium', description: 'The web server sends version information in headers.', solution: 'Configure server to not disclose version', url: 'https://shop.example.com/', cweId: 200, wascid: 13 },
    ],
    nucleiFindings: [
      { id: 'n1', templateId: 'exposed-panels/phpmyadmin-panel', name: 'phpMyAdmin Panel Detected', severity: 'medium', type: 'http', url: 'https://shop.example.com/phpmyadmin/', matchedAt: 'https://shop.example.com/phpmyadmin/', description: 'phpMyAdmin administration panel was detected.', reference: ['https://github.com/phpmyadmin/phpmyadmin'], tags: ['panel', 'phpmyadmin'] },
      { id: 'n2', templateId: 'exposed-tokens/dotenv', name: '.env File Exposed', severity: 'critical', type: 'http', url: 'https://shop.example.com/.env', matchedAt: 'https://shop.example.com/.env', description: 'Environment configuration file is publicly accessible.', reference: ['https://cwe.mitre.org/data/definitions/538.html'], tags: ['exposure', 'config'] },
      { id: 'n3', templateId: 'technologies/nginx-detect', name: 'Nginx Detected', severity: 'info', type: 'http', url: 'https://shop.example.com/', matchedAt: 'Server: nginx/1.18.0', description: 'Nginx web server detected with version disclosure.', reference: [], tags: ['tech', 'nginx'] },
    ],
  },
];

// ===== VISUAL DIFFS =====
export const visualDiffs: VisualDiff[] = [
  { id: 'vd1', url: 'https://shop.example.com/', viewport: '1920x1080', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 2.1, missingPixels: 4200, extraPixels: 8400, status: 'warning', timestamp: '2026-01-20T14:28:00Z' },
  { id: 'vd2', url: 'https://shop.example.com/products', viewport: '1920x1080', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 12.3, missingPixels: 24600, extraPixels: 18400, status: 'failed', timestamp: '2026-01-20T14:28:30Z' },
  { id: 'vd3', url: 'https://shop.example.com/checkout', viewport: '1920x1080', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 0.3, missingPixels: 600, extraPixels: 1200, status: 'passed', timestamp: '2026-01-20T14:29:00Z' },
  { id: 'vd4', url: 'https://shop.example.com/', viewport: '375x812', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 8.7, missingPixels: 12400, extraPixels: 9800, status: 'failed', timestamp: '2026-01-20T14:29:30Z' },
  { id: 'vd5', url: 'https://shop.example.com/products', viewport: '375x812', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 1.2, missingPixels: 2400, extraPixels: 3600, status: 'passed', timestamp: '2026-01-20T14:30:00Z' },
  { id: 'vd6', url: 'https://shop.example.com/cart', viewport: '1920x1080', baselineUrl: '', currentUrl: '', diffUrl: '', mismatchPercentage: 0.0, missingPixels: 0, extraPixels: 0, status: 'passed', timestamp: '2026-01-20T14:30:30Z' },
];

// ===== E2E FLOWS =====
export const e2eFlows: E2EFlow[] = [
  {
    id: 'e2e1', name: 'User Login Flow', description: 'Test complete login process with valid credentials',
    projectId: 'p1', targetId: 't1', lastRun: '2026-01-20T15:00:00Z', lastStatus: 'passed',
    createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-01-15T09:00:00Z', tags: ['auth', 'smoke'],
    steps: [
      { id: 'es1', type: 'navigate', value: 'https://shop.example.com/login', description: 'Navigate to login page' },
      { id: 'es2', type: 'assert', selector: 'h1', description: 'Verify login page loaded', assertion: { type: 'text', expected: 'Sign In' } },
      { id: 'es3', type: 'type', selector: '#email', value: 'test@example.com', description: 'Enter email address' },
      { id: 'es4', type: 'type', selector: '#password', value: 'SecurePass123!', description: 'Enter password' },
      { id: 'es5', type: 'click', selector: 'button[type="submit"]', description: 'Click login button' },
      { id: 'es6', type: 'wait', description: 'Wait for navigation', waitUntil: 'networkidle', timeout: 5000 },
      { id: 'es7', type: 'assert', selector: '.user-menu', description: 'Verify user is logged in', assertion: { type: 'visible', timeout: 3000 } },
      { id: 'es8', type: 'screenshot', description: 'Capture logged-in state' },
    ],
  },
  {
    id: 'e2e2', name: 'Add to Cart & Checkout', description: 'Test adding product to cart and completing checkout',
    projectId: 'p1', targetId: 't1', lastRun: '2026-01-20T15:05:00Z', lastStatus: 'failed',
    createdAt: '2025-12-10T10:00:00Z', updatedAt: '2026-01-18T14:00:00Z', tags: ['checkout', 'critical-path'],
    steps: [
      { id: 'es9', type: 'navigate', value: 'https://shop.example.com/products/laptop-pro', description: 'Navigate to product page' },
      { id: 'es10', type: 'click', selector: '.add-to-cart-btn', description: 'Click Add to Cart' },
      { id: 'es11', type: 'assert', selector: '.cart-badge', description: 'Verify cart count updated', assertion: { type: 'text', expected: '1' } },
      { id: 'es12', type: 'click', selector: '.cart-icon', description: 'Open cart' },
      { id: 'es13', type: 'assert', selector: '.cart-item', description: 'Verify product in cart', assertion: { type: 'visible' } },
      { id: 'es14', type: 'click', selector: '.checkout-btn', description: 'Proceed to checkout' },
      { id: 'es15', type: 'type', selector: '#card-number', value: '4242424242424242', description: 'Enter card number' },
      { id: 'es16', type: 'type', selector: '#card-expiry', value: '12/28', description: 'Enter expiry' },
      { id: 'es17', type: 'type', selector: '#card-cvc', value: '123', description: 'Enter CVC' },
      { id: 'es18', type: 'click', selector: '#place-order', description: 'Place order' },
      { id: 'es19', type: 'assert', selector: '.order-confirmation', description: 'Verify order placed', assertion: { type: 'visible', timeout: 10000 } },
      { id: 'es20', type: 'screenshot', description: 'Capture confirmation' },
    ],
  },
  {
    id: 'e2e3', name: 'Search & Filter Products', description: 'Test product search and filtering functionality',
    projectId: 'p1', targetId: 't1', lastRun: '2026-01-19T10:00:00Z', lastStatus: 'passed',
    createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-19T10:00:00Z', tags: ['search', 'regression'],
    steps: [
      { id: 'es21', type: 'navigate', value: 'https://shop.example.com/products', description: 'Go to products page' },
      { id: 'es22', type: 'type', selector: '#search-input', value: 'laptop', description: 'Search for laptops' },
      { id: 'es23', type: 'click', selector: '#search-submit', description: 'Submit search' },
      { id: 'es24', type: 'assert', selector: '.product-count', description: 'Verify results shown', assertion: { type: 'visible' } },
      { id: 'es25', type: 'click', selector: '.filter-price-range', description: 'Apply price filter' },
      { id: 'es26', type: 'select', selector: '#sort-by', value: 'price-asc', description: 'Sort by price ascending' },
      { id: 'es27', type: 'assert', selector: '.product-card', description: 'Verify filtered results', assertion: { type: 'count', expected: '5' } },
      { id: 'es28', type: 'screenshot', description: 'Capture filtered results' },
    ],
  },
];

// ===== CI/CD CONFIGS =====
export const cicdConfigs: CICDConfig[] = [
  {
    id: 'ci1', projectId: 'p1', provider: 'github_actions', name: 'Production CI Pipeline',
    enabled: true, config: { repo: 'company/shop-frontend', workflow: 'ci.yml', branch: 'main' },
    triggerOn: ['push', 'pull_request'], failOnSeverity: 'high', lastRun: '2026-01-21T09:00:00Z', lastStatus: 'passed',
  },
  {
    id: 'ci2', projectId: 'p1', provider: 'github_actions', name: 'Staging Deploy Gate',
    enabled: true, config: { repo: 'company/shop-frontend', workflow: 'staging-gate.yml', branch: 'develop' },
    triggerOn: ['pull_request'], failOnSeverity: 'medium', lastRun: '2026-01-20T16:30:00Z', lastStatus: 'passed',
  },
  {
    id: 'ci3', projectId: 'p2', provider: 'gitlab_ci', name: 'Corporate Site Pipeline',
    enabled: true, config: { project: 'company/corporate-site', stage: 'test' },
    triggerOn: ['merge_request', 'push'], failOnSeverity: 'medium', lastRun: '2026-01-19T14:00:00Z', lastStatus: 'passed',
  },
  {
    id: 'ci4', projectId: 'p3', provider: 'jenkins', name: 'Admin Dashboard Nightly',
    enabled: false, config: { job: 'admin-dashboard-tests', cron: 'H 2 * * *' },
    triggerOn: ['schedule'], failOnSeverity: 'high',
  },
];

// ===== API KEYS =====
export const apiKeys: ApiKey[] = [
  { id: 'ak1', name: 'Production API Key', key: 'thub_prod_xK9mN2pQ7rT4wY6zA8bC0dE1fG3hJ5', prefix: 'thub_prod', createdAt: '2025-11-15T10:00:00Z', lastUsed: '2026-01-21T09:30:00Z', permissions: ['scans:read', 'scans:write', 'findings:read', 'projects:read', 'projects:write'], active: true },
  { id: 'ak2', name: 'CI/CD Pipeline Key', key: 'thub_ci_mP3qR5sT7uV9wX1yA3bC5dE7fG9hJ1', prefix: 'thub_ci', createdAt: '2025-12-01T08:00:00Z', lastUsed: '2026-01-21T08:00:00Z', permissions: ['scans:write', 'findings:read'], active: true },
  { id: 'ak3', name: 'Read-Only Dashboard', key: 'thub_ro_kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0', prefix: 'thub_ro', createdAt: '2026-01-10T09:00:00Z', lastUsed: '2026-01-20T22:00:00Z', permissions: ['scans:read', 'findings:read', 'projects:read'], active: true },
];

export const integrations: Integration[] = [
  { id: 'i1', type: 'slack', name: '#security-alerts', enabled: true, config: { webhook: 'https://hooks.slack.com/services/T00/B00/xxx' }, events: ['scan_completed', 'critical_finding'] },
  { id: 'i2', type: 'jira', name: 'SEC Project', enabled: true, config: { projectKey: 'SEC', baseUrl: 'https://company.atlassian.net' }, events: ['finding_created'] },
  { id: 'i3', type: 'github', name: 'GitHub Issues', enabled: false, config: { repo: 'company/web-app' }, events: ['finding_created'] },
  { id: 'i4', type: 'webhook', name: 'Custom Webhook', enabled: true, config: { url: 'https://api.company.com/webhooks/testhub' }, events: ['scan_completed', 'finding_created', 'scan_failed'] },
  { id: 'i5', type: 'email', name: 'Team Notifications', enabled: true, config: { recipients: 'team@company.com' }, events: ['scan_completed', 'critical_finding'] },
  { id: 'i6', type: 'teams', name: 'DevOps Channel', enabled: false, config: { webhook: 'https://outlook.office.com/webhook/...' }, events: ['scan_completed'] },
  { id: 'i7', type: 'pagerduty', name: 'Critical Alerts', enabled: true, config: { serviceKey: 'pd-service-key-xxx' }, events: ['critical_finding'] },
];

export const dashboardStats: DashboardStats = {
  totalProjects: 4, totalScans: 5, totalFindings: 58, criticalFindings: 3, highFindings: 14, scansThisWeek: 3,
  findingsTrend: [
    { date: 'Jan 14', critical: 1, high: 3, medium: 5, low: 8 },
    { date: 'Jan 15', critical: 2, high: 4, medium: 6, low: 10 },
    { date: 'Jan 16', critical: 1, high: 3, medium: 4, low: 7 },
    { date: 'Jan 17', critical: 0, high: 2, medium: 5, low: 9 },
    { date: 'Jan 18', critical: 2, high: 5, medium: 7, low: 11 },
    { date: 'Jan 19', critical: 1, high: 3, medium: 6, low: 8 },
    { date: 'Jan 20', critical: 3, high: 7, medium: 12, low: 15 },
  ],
  suiteDistribution: [
    { suite: 'Security', count: 22 }, { suite: 'Accessibility', count: 14 }, { suite: 'Performance', count: 8 },
    { suite: 'Console Errors', count: 7 }, { suite: 'Broken Links', count: 5 }, { suite: 'Visual Regression', count: 4 },
    { suite: 'SEO', count: 2 }, { suite: 'E2E Tests', count: 3 },
  ],
  severityDistribution: [
    { severity: 'Critical', count: 4, color: '#ef4444' }, { severity: 'High', count: 14, color: '#f97316' },
    { severity: 'Medium', count: 23, color: '#eab308' }, { severity: 'Low', count: 54, color: '#22c55e' },
    { severity: 'Info', count: 39, color: '#3b82f6' }, { severity: 'Warning', count: 12, color: '#a855f7' },
  ],
};
