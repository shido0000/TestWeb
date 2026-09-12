// ============================================
// Accessibility Scanner - axe-core integration
// ============================================

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity } from '@testhub/shared';
import type { Page } from 'playwright';

export class AccessibilityScanner implements Scanner {
  name = 'Accessibility Scanner';
  suite = ScanSuite.ACCESSIBILITY;

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const { page } = context;
    if (!page) {
      throw new Error('Playwright page is required for accessibility scanning');
    }

    try {
      // Inject axe-core into the page
      await page.addScriptTag({
        path: require.resolve('axe-core/axe.min.js'),
      });

      // Run axe analysis
      const results = await page.evaluate(() => {
        return (window as any).axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
          },
        });
      });

      // Convert axe results to findings
      const findings: RawFinding[] = [];

      // Process violations
      for (const violation of results.violations) {
        const severity = this.mapImpactToSeverity(violation.impact);
        
        findings.push({
          suite: ScanSuite.ACCESSIBILITY,
          severity,
          title: violation.help,
          description: violation.description,
          url,
          evidence: `${violation.nodes.length} element(s) affected. Example: ${violation.nodes[0]?.html || 'N/A'}`,
          recommendation: violation.help,
          wcagCriteria: this.extractWcagCriteria(violation.tags),
        });
      }

      // Calculate metrics
      const totalRules = results.violations.length + results.passes.length + 
                         results.incomplete.length + results.inapplicable.length;
      const score = Math.round((results.passes.length / totalRules) * 100);

      return {
        url,
        findings,
        metrics: {
          score,
          violations: results.violations.length,
          passes: results.passes.length,
          incomplete: results.incomplete.length,
          inapplicable: results.inapplicable.length,
          wcagAA: this.checkWcagCompliance(results.violations, 'wcag2aa'),
          wcagAAA: this.checkWcagCompliance(results.violations, 'wcag2aaa'),
          contrastIssues: results.violations.filter(v => v.id === 'color-contrast').length,
          violationsDetail: results.violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.length,
            wcagTags: v.tags,
            elements: v.nodes.slice(0, 5).map(n => n.html),
          })),
        },
      };
    } catch (error) {
      console.error(`Accessibility scan failed for ${url}:`, error);
      throw error;
    }
  }

  private mapImpactToSeverity(impact: string): typeof Severity[keyof typeof Severity] {
    const mapping: Record<string, typeof Severity[keyof typeof Severity]> = {
      critical: Severity.CRITICAL,
      serious: Severity.HIGH,
      moderate: Severity.MEDIUM,
      minor: Severity.LOW,
    };
    return mapping[impact] || Severity.MEDIUM;
  }

  private extractWcagCriteria(tags: string[]): string | undefined {
    const wcagTag = tags.find(tag => tag.startsWith('wcag'));
    if (!wcagTag) return undefined;

    // Convert tag like "wcag2aa" to "WCAG 2.1 AA"
    const match = wcagTag.match(/wcag(\d+)(\d+)?([a]+)/);
    if (match) {
      const level = match[3].toUpperCase();
      return `WCAG ${match[1]}.${match[2] || '1'} ${level}`;
    }
    return undefined;
  }

  private checkWcagCompliance(violations: any[], level: string): boolean {
    return !violations.some(v => v.tags.includes(level));
  }
}
