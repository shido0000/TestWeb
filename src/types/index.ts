// ============================================
// TestHub - Core Type Definitions (Extended)
// ============================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'warning';
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScanSuite = 'console_errors' | 'broken_links' | 'accessibility' | 'performance' | 'security' | 'visual_regression' | 'seo' | 'e2e';
export type UserRole = 'admin' | 'tester' | 'viewer';
export type FindingStatus = 'open' | 'accepted' | 'false_positive' | 'fixed' | 'retest';
export type ColorVisionMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
export type SslGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'T';
export type E2EStepType = 'navigate' | 'click' | 'type' | 'wait' | 'assert' | 'screenshot' | 'hover' | 'select' | 'scroll';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  targets: Target[];
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    warning: number;
  };
  lastScanDate?: string;
  tags: string[];
}

export interface Target {
  id: string;
  projectId: string;
  url: string;
  name: string;
  environment: 'production' | 'staging' | 'development';
  authRequired: boolean;
  headers?: Record<string, string>;
  cookies?: string;
  scope: {
    allowedDomains: string[];
    excludedPaths: string[];
    maxDepth: number;
  };
  createdAt: string;
}

export interface CrawlResult {
  id: string;
  targetId: string;
  url: string;
  title: string;
  status: number;
  depth: number;
  contentType: string;
  linksFound: number;
  resources: number;
  loadTime: number;
  discoveredAt: string;
  children: string[];
  forms: number;
  inputs: number;
}

export interface Scan {
  id: string;
  projectId: string;
  targetId: string;
  targetUrl: string;
  suites: ScanSuite[];
  status: ScanStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  findingsSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    warning: number;
  };
  triggeredBy: string;
  pagesScanned: number;
  totalRequests: number;
}

export interface Finding {
  id: string;
  scanId: string;
  projectId: string;
  targetId: string;
  suite: ScanSuite;
  severity: Severity;
  status: FindingStatus;
  title: string;
  description: string;
  url: string;
  evidence?: string;
  recommendation?: string;
  cweId?: string;
  cvssScore?: number;
  wcagCriteria?: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
  duplicated: boolean;
  riskScore: number;
}

export interface PerformanceMetrics {
  url: string;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  speedIndex: number;
  tti: number;
  totalBlockingTime: number;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  pwaScore: number;
  totalWeight: number;
  requests: number;
  domNodes: number;
  jsExecutionTime: number;
  resources: ResourceMetric[];
}

export interface ResourceMetric {
  type: string;
  count: number;
  transferSize: number;
  resourceSize: number;
}

export interface AccessibilityResult {
  url: string;
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  score: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  contrastIssues: number;
  violations_detail: A11yViolation[];
}

export interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  wcagTags: string[];
  elements: string[];
}

export interface SecurityResult {
  url: string;
  headers: SecurityHeader[];
  ssl: SSLResult;
  zapAlerts: ZapAlert[];
  nucleiFindings: NucleiFinding[];
  overallGrade: SslGrade;
  cookiesSecure: boolean;
  mixedContent: boolean;
}

export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
  recommendation?: string;
  severity: Severity;
}

export interface SSLResult {
  grade: SslGrade;
  protocol: string;
  cipher: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  supportsHSTS: boolean;
  supportsHPKP: boolean;
  supportsOCSP: boolean;
  vulnerableToHeartbleed: boolean;
  vulnerableToCCS: boolean;
  vulnerableToRenego: boolean;
  vulnerableToCrime: boolean;
  vulnerableToPoodle: boolean;
  vulnerableToFreak: boolean;
  vulnerableToLogjam: boolean;
  vulnerableToDrown: boolean;
}

export interface ZapAlert {
  id: string;
  name: string;
  risk: Severity;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  solution: string;
  url: string;
  cweId: number;
  wascid: number;
}

export interface NucleiFinding {
  id: string;
  templateId: string;
  name: string;
  severity: Severity;
  type: string;
  url: string;
  matchedAt: string;
  description: string;
  reference: string[];
  tags: string[];
}

export interface VisualDiff {
  id: string;
  url: string;
  viewport: string;
  baselineUrl: string;
  currentUrl: string;
  diffUrl: string;
  mismatchPercentage: number;
  missingPixels: number;
  extraPixels: number;
  status: 'passed' | 'failed' | 'warning';
  timestamp: string;
}

export interface E2EFlow {
  id: string;
  name: string;
  description: string;
  projectId: string;
  targetId: string;
  steps: E2EStep[];
  lastRun?: string;
  lastStatus?: 'passed' | 'failed' | 'skipped';
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface E2EStep {
  id: string;
  type: E2EStepType;
  selector?: string;
  value?: string;
  description: string;
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  assertion?: {
    type: 'visible' | 'hidden' | 'text' | 'url' | 'title' | 'attribute' | 'count';
    expected?: string;
    timeout?: number;
  };
}

export interface CICDConfig {
  id: string;
  projectId: string;
  provider: 'github_actions' | 'gitlab_ci' | 'jenkins' | 'azure_devops' | 'circleci';
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  triggerOn: string[];
  failOnSeverity: Severity;
  lastRun?: string;
  lastStatus?: 'passed' | 'failed' | 'skipped';
}

export interface Integration {
  id: string;
  type: 'slack' | 'jira' | 'github' | 'webhook' | 'email' | 'teams' | 'pagerduty';
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  events: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
  active: boolean;
}

export interface DashboardStats {
  totalProjects: number;
  totalScans: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  scansThisWeek: number;
  findingsTrend: { date: string; critical: number; high: number; medium: number; low: number }[];
  suiteDistribution: { suite: string; count: number }[];
  severityDistribution: { severity: string; count: number; color: string }[];
}
