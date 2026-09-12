// ============================================
// TestHub - Core Type Definitions
// ============================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'warning';
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScanSuite = 'console_errors' | 'broken_links' | 'accessibility' | 'performance' | 'security' | 'visual_regression' | 'seo';
export type UserRole = 'admin' | 'tester' | 'viewer';
export type FindingStatus = 'open' | 'accepted' | 'false_positive' | 'fixed' | 'retest';

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
  wcagCriteria?: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
  duplicated: boolean;
  riskScore: number;
}

export interface Evidence {
  id: string;
  findingId: string;
  type: 'screenshot' | 'log' | 'request' | 'response' | 'video' | 'diff';
  url: string;
  description: string;
  createdAt: string;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  speedIndex: number;
  tti: number; // Time to Interactive
  totalBlockingTime: number;
  performanceScore: number;
}

export interface AccessibilityResult {
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  score: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  contrastIssues: number;
}

export interface ScanReport {
  id: string;
  scanId: string;
  projectId: string;
  format: 'pdf' | 'html' | 'json';
  generatedAt: string;
  url: string;
  findingsCount: number;
}

export interface Integration {
  id: string;
  type: 'slack' | 'jira' | 'github' | 'webhook' | 'email';
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  events: string[];
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
