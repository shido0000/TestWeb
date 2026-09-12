// ============================================
// TestHub Scanners - Main Export (Phase 1 + Phase 2)
// ============================================

// Phase 1 Scanners
export { AccessibilityScanner } from './accessibility';
export { PerformanceScanner } from './performance';
export { Crawler } from './crawler';

// Phase 2 Scanners - Security
export { SecurityHeadersScanner } from './security/headers-scanner';
export { SSLScanner } from './security/ssl-scanner';
export { ZapScanner } from './security/zap-scanner';
export { NucleiScanner } from './security/nuclei-scanner';

// Phase 2 Scanners - E2E
export { E2EScanner } from './e2e';

// Import all scanners
import { AccessibilityScanner } from './accessibility';
import { PerformanceScanner } from './performance';
import { Crawler } from './crawler';
import { SecurityHeadersScanner } from './security/headers-scanner';
import { SSLScanner } from './security/ssl-scanner';
import { ZapScanner } from './security/zap-scanner';
import { NucleiScanner } from './security/nuclei-scanner';
import { E2EScanner } from './e2e';
import { Scanner, ScanSuite } from '@testhub/shared';

// ============================================
// SCANNER REGISTRY (Phase 1 + Phase 2)
// ============================================

export const scanners: Record<string, Scanner> = {
  // Phase 1
  [ScanSuite.ACCESSIBILITY]: new AccessibilityScanner(),
  [ScanSuite.PERFORMANCE]: new PerformanceScanner(),
  
  // Phase 2 - Security (multiple scanners for the SECURITY suite)
  [ScanSuite.SECURITY]: new SecurityHeadersScanner(),
  
  // Phase 2 - E2E
  [ScanSuite.E2E]: new E2EScanner(),
};

// Additional security scanners (used in combination)
export const securityScanners = {
  headers: new SecurityHeadersScanner(),
  ssl: new SSLScanner(),
  zap: new ZapScanner(),
  nuclei: new NucleiScanner(),
};

// ============================================
// SCANNER FACTORY
// ============================================

export function getScanner(suite: string): Scanner | undefined {
  return scanners[suite];
}

export function getAllScanners(): Scanner[] {
  return Object.values(scanners);
}

export function getAvailableSuites(): string[] {
  return Object.keys(scanners);
}

export function getSecurityScanners() {
  return Object.values(securityScanners);
}

// ============================================
// CRAWLER FACTORY
// ============================================

export function createCrawler(options?: any): Crawler {
  return new Crawler(options);
}

// Re-export types
export type { Scanner } from '@testhub/shared';
