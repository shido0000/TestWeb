// ============================================
// TestHub Shared Types & Validations
// ============================================

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const UserRole = {
  ADMIN: 'ADMIN',
  TESTER: 'TESTER',
  VIEWER: 'VIEWER',
} as const;

export const Environment = {
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT',
} as const;

export const ScanStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const ScanSuite = {
  CONSOLE_ERRORS: 'CONSOLE_ERRORS',
  BROKEN_LINKS: 'BROKEN_LINKS',
  ACCESSIBILITY: 'ACCESSIBILITY',
  PERFORMANCE: 'PERFORMANCE',
  SECURITY: 'SECURITY',
  VISUAL_REGRESSION: 'VISUAL_REGRESSION',
  SEO: 'SEO',
  E2E: 'E2E',
} as const;

export const Severity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
  WARNING: 'WARNING',
} as const;

export const FindingStatus = {
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  FALSE_POSITIVE: 'FALSE_POSITIVE',
  FIXED: 'FIXED',
  RETEST: 'RETEST',
} as const;

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const CreateTargetSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  url: z.string().url(),
  environment: z.nativeEnum(Environment).optional(),
  authRequired: z.boolean().optional(),
  headers: z.record(z.string()).optional(),
  cookies: z.string().optional(),
  scope: z.object({
    allowedDomains: z.array(z.string()),
    excludedPaths: z.array(z.string()),
    maxDepth: z.number().min(1).max(10),
  }),
});

export const UpdateTargetSchema = CreateTargetSchema.partial().omit({ projectId: true });

export const CreateScanSchema = z.object({
  targetId: z.string().uuid(),
  suites: z.array(z.nativeEnum(ScanSuite)).min(1),
  config: z.record(z.any()).optional(),
});

export const UpdateFindingSchema = z.object({
  status: z.nativeEnum(FindingStatus).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const GenerateReportSchema = z.object({
  scanId: z.string().uuid(),
  format: z.enum(['PDF', 'HTML', 'JSON']),
});

// ============================================
// TYPES
// ============================================

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type EnvironmentType = typeof Environment[keyof typeof Environment];
export type ScanStatusType = typeof ScanStatus[keyof typeof ScanStatus];
export type ScanSuiteType = typeof ScanSuite[keyof typeof ScanSuite];
export type SeverityType = typeof Severity[keyof typeof Severity];
export type FindingStatusType = typeof FindingStatus[keyof typeof FindingStatus];

export interface TargetScope {
  allowedDomains: string[];
  excludedPaths: string[];
  maxDepth: number;
}

export interface ScanConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  waitForSelector?: string;
}

export interface FindingSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  warning: number;
}

// ============================================
// JOB PAYLOADS
// ============================================

export interface ScanJobPayload {
  scanId: string;
  targetId: string;
  projectId: string;
  suites: ScanSuiteType[];
  config?: ScanConfig;
}

export interface CrawlJobPayload {
  targetId: string;
  startUrl: string;
  maxDepth: number;
  allowedDomains: string[];
  excludedPaths: string[];
}

export interface ReportJobPayload {
  reportId: string;
  scanId: string;
  format: 'PDF' | 'HTML' | 'JSON';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================
// SCANNER INTERFACES
// ============================================

export interface ScanResult {
  url: string;
  findings: RawFinding[];
  metrics?: Record<string, any>;
}

export interface RawFinding {
  suite: ScanSuiteType;
  severity: SeverityType;
  title: string;
  description: string;
  url: string;
  evidence?: string;
  recommendation?: string;
  cweId?: string;
  cvssScore?: number;
  wcagCriteria?: string;
}

export interface Scanner {
  name: string;
  suite: ScanSuiteType;
  scan(url: string, context: ScanContext): Promise<ScanResult>;
}

export interface ScanContext {
  page?: any; // Playwright Page
  browser?: any; // Playwright Browser
  config?: ScanConfig;
}

// ============================================
// UTILITIES
// ============================================

export function calculateRiskScore(severity: SeverityType, hasEvidence: boolean = true): number {
  const baseScores: Record<SeverityType, number> = {
    CRITICAL: 95,
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25,
    INFO: 10,
    WARNING: 15,
  };

  let score = baseScores[severity];
  if (!hasEvidence) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function normalizeSeverity(severity: string): SeverityType {
  const normalized = severity.toUpperCase();
  if (normalized in Severity) {
    return Severity[normalized as keyof typeof Severity];
  }
  return Severity.MEDIUM;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
