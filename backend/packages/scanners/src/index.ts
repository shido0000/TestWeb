// ============================================
// TestHub Scanners - Main Export
// ============================================

export { AccessibilityScanner } from './accessibility';
export { PerformanceScanner } from './performance';
export { Crawler } from './crawler';

// Import all scanners
import { AccessibilityScanner } from './accessibility';
import { PerformanceScanner } from './performance';
import { Crawler } from './crawler';
import { Scanner, ScanSuite } from '@testhub/shared';

// ============================================
// SCANNER REGISTRY
// ============================================

export const scanners: Record<string, Scanner> = {
  [ScanSuite.ACCESSIBILITY]: new AccessibilityScanner(),
  [ScanSuite.PERFORMANCE]: new PerformanceScanner(),
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

// ============================================
// CRAWLER FACTORY
// ============================================

export function createCrawler(options?: any): Crawler {
  return new Crawler(options);
}

// Re-export types
export type { Scanner } from '@testhub/shared';
