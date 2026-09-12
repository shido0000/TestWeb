// ============================================
// Performance Scanner - Lighthouse integration
// ============================================

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity } from '@testhub/shared';
import lighthouse from 'lighthouse';
import type { Page } from 'playwright';

export class PerformanceScanner implements Scanner {
  name = 'Performance Scanner';
  suite = ScanSuite.PERFORMANCE;

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const { browser } = context;
    if (!browser) {
      throw new Error('Playwright browser is required for performance scanning');
    }

    try {
      // Get the CDP endpoint from Playwright browser
      const cdpEndpoint = (browser as any)._wsEndpoint || (browser as any)._connection?._transport?._ws?._url;
      
      // Run Lighthouse
      const result = await lighthouse(url, {
        port: new URL(cdpEndpoint).port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      });

      if (!result || !result.lhr) {
        throw new Error('Lighthouse did not return results');
      }

      const lhr = result.lhr;
      const findings: RawFinding[] = [];

      // Check Core Web Vitals
      const audits = lhr.audits;

      // LCP Check
      if (audits['largest-contentful-paint']?.numericValue > 4000) {
        findings.push({
          suite: ScanSuite.PERFORMANCE,
          severity: Severity.HIGH,
          title: 'Largest Contentful Paint exceeds 4s',
          description: `LCP is ${(audits['largest-contentful-paint'].numericValue / 1000).toFixed(1)}s, well above the 2.5s threshold.`,
          url,
          evidence: `LCP: ${audits['largest-contentful-paint'].numericValue.toFixed(0)}ms`,
          recommendation: audits['largest-contentful-paint'].details?.debugData?.items?.[0]?.optimizations || 
                         'Optimize largest contentful element. Consider lazy loading, image optimization, or preloading critical resources.',
        });
      }

      // FID Check
      if (audits['max-potential-fid']?.numericValue > 300) {
        findings.push({
          suite: ScanSuite.PERFORMANCE,
          severity: Severity.MEDIUM,
          title: 'First Input Delay is too high',
          description: `FID is ${audits['max-potential-fid'].numericValue.toFixed(0)}ms, above the 100ms threshold.`,
          url,
          evidence: `FID: ${audits['max-potential-fid'].numericValue.toFixed(0)}ms`,
          recommendation: 'Reduce JavaScript execution time. Break up long tasks and defer non-critical JavaScript.',
        });
      }

      // CLS Check
      if (audits['cumulative-layout-shift']?.numericValue > 0.25) {
        findings.push({
          suite: ScanSuite.PERFORMANCE,
          severity: Severity.MEDIUM,
          title: 'Cumulative Layout Shift is too high',
          description: `CLS is ${audits['cumulative-layout-shift'].numericValue.toFixed(3)}, above the 0.1 threshold.`,
          url,
          evidence: `CLS: ${audits['cumulative-layout-shift'].numericValue.toFixed(3)}`,
          recommendation: 'Avoid layout shifts by setting explicit dimensions for images and ads, and avoiding dynamic content injection.',
        });
      }

      // Check for unused JavaScript
      if (audits['unused-javascript']?.numericValue > 50000) {
        findings.push({
          suite: ScanSuite.PERFORMANCE,
          severity: Severity.LOW,
          title: 'Unused JavaScript detected',
          description: `${(audits['unused-javascript'].numericValue / 1024).toFixed(0)}KB of unused JavaScript detected.`,
          url,
          evidence: `Unused JS: ${(audits['unused-javascript'].numericValue / 1024).toFixed(0)}KB`,
          recommendation: 'Remove unused JavaScript or implement code splitting to reduce bundle size.',
        });
      }

      // Check for unoptimized images
      if (audits['uses-optimized-images']?.score < 1) {
        findings.push({
          suite: ScanSuite.PERFORMANCE,
          severity: Severity.MEDIUM,
          title: 'Images are not optimized',
          description: 'Images could be optimized to reduce load time.',
          url,
          evidence: audits['uses-optimized-images'].displayValue || 'Multiple images need optimization',
          recommendation: 'Compress and optimize images. Consider using WebP or AVIF format.',
        });
      }

      // Extract metrics
      const metrics = {
        performanceScore: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibilityScore: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        bestPracticesScore: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        seoScore: Math.round((lhr.categories.seo?.score || 0) * 100),
        pwaScore: Math.round((lhr.categories.pwa?.score || 0) * 100),
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        ttfb: audits['server-response-time']?.numericValue || 0,
        tbt: audits['total-blocking-time']?.numericValue || 0,
        si: audits['speed-index']?.numericValue || 0,
        tti: audits['interactive']?.numericValue || 0,
        totalWeight: lhr.audits['total-byte-weight']?.numericValue || 0,
        totalRequests: lhr.audits['network-requests']?.details?.items?.length || 0,
        domNodes: audits['dom-size']?.numericValue || 0,
      };

      return {
        url,
        findings,
        metrics,
      };
    } catch (error) {
      console.error(`Performance scan failed for ${url}:`, error);
      throw error;
    }
  }
}
