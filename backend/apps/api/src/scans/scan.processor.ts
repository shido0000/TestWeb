// ============================================
// Scan Processor - Worker
// ============================================

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ScansService } from './scans.service';
import { ScanJobPayload, Severity, ScanSuite, calculateRiskScore } from '@testhub/shared';
import { chromium, Browser } from 'playwright';
import { AccessibilityScanner, PerformanceScanner, Crawler } from '@testhub/scanners';

@Processor('scan-queue')
export class ScanProcessor {
  private readonly logger = new Logger(ScanProcessor.name);
  private browser: Browser | null = null;

  constructor(
    private prisma: PrismaService,
    private scansService: ScansService,
  ) {}

  @Process('process-scan')
  async handleScan(job: Job<ScanJobPayload>) {
    const { scanId, targetId, projectId, suites, config } = job.data;
    
    this.logger.log(`🔍 Starting scan ${scanId} for target ${targetId}`);
    this.logger.log(`   Suites: ${suites.join(', ')}`);

    try {
      // Get target details
      const target = await this.prisma.target.findUnique({
        where: { id: targetId },
      });

      if (!target) {
        throw new Error('Target not found');
      }

      // Launch browser
      this.browser = await chromium.launch({
        headless: config?.headless ?? true,
      });

      const context = await this.browser.newContext({
        viewport: config?.viewport || { width: 1920, height: 1080 },
      });

      // Step 1: Crawl the target
      this.logger.log('   📄 Step 1: Crawling target...');
      const crawler = new Crawler({
        maxDepth: (target.scope as any).maxDepth || 3,
        allowedDomains: (target.scope as any).allowedDomains || [],
        excludedPaths: (target.scope as any).excludedPaths || [],
      });

      const crawlResults = await crawler.crawl(target.url);
      
      // Save crawl results
      await this.prisma.crawlResult.createMany({
        data: crawlResults.map(result => ({
          targetId: target.id,
          url: result.url,
          title: result.title,
          statusCode: result.statusCode,
          depth: result.depth,
          contentType: result.contentType,
          linksFound: result.linksFound,
          resources: result.resources,
          loadTime: result.loadTime,
          forms: result.forms,
          inputs: result.inputs,
        })),
      });

      this.logger.log(`   ✅ Found ${crawlResults.length} pages`);

      // Update scan progress
      await this.scansService.updateProgress(scanId, 20, crawlResults.length, 0);

      // Step 2: Run scanners on each page
      const allFindings: any[] = [];
      let totalRequests = 0;

      for (let i = 0; i < crawlResults.length; i++) {
        const page = crawlResults[i];
        const progress = 20 + Math.round((i / crawlResults.length) * 70);
        
        await this.scansService.updateProgress(scanId, progress, i + 1, totalRequests);

        const browserPage = await context.newPage();

        try {
          // Navigate to page
          await browserPage.goto(page.url, { 
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          totalRequests += page.resources;

          // Run each suite
          for (const suite of suites) {
            this.logger.log(`   🔬 Running ${suite} on ${page.url}`);

            try {
              const findings = await this.runScanner(suite, browserPage, page.url);
              allFindings.push(...findings);
            } catch (error) {
              this.logger.error(`   ❌ Scanner ${suite} failed:`, error);
            }
          }
        } catch (error) {
          this.logger.error(`   ❌ Failed to scan page ${page.url}:`, error);
        } finally {
          await browserPage.close();
        }
      }

      // Step 3: Save findings
      this.logger.log(`   💾 Saving ${allFindings.length} findings...`);
      
      const findingsSummary = {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        warningCount: 0,
      };

      for (const finding of allFindings) {
        await this.prisma.finding.create({
          data: {
            scanId,
            projectId,
            targetId,
            suite: finding.suite,
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            url: finding.url,
            evidence: finding.evidence,
            recommendation: finding.recommendation,
            cweId: finding.cweId,
            cvssScore: finding.cvssScore,
            wcagCriteria: finding.wcagCriteria,
            riskScore: calculateRiskScore(finding.severity, !!finding.evidence),
          },
        });

        // Update summary
        const severityKey = `${finding.severity.toLowerCase()}Count` as keyof typeof findingsSummary;
        findingsSummary[severityKey]++;
      }

      // Step 4: Complete scan
      await this.scansService.complete(scanId, findingsSummary);

      this.logger.log(`✅ Scan ${scanId} completed successfully`);
      this.logger.log(`   Findings: ${allFindings.length} total`);
      this.logger.log(`   Critical: ${findingsSummary.criticalCount}`);
      this.logger.log(`   High: ${findingsSummary.highCount}`);
      this.logger.log(`   Medium: ${findingsSummary.mediumCount}`);

    } catch (error) {
      this.logger.error(`❌ Scan ${scanId} failed:`, error);
      await this.scansService.fail(scanId, error.message);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async runScanner(suite: string, page: any, url: string): Promise<any[]> {
    const context = { page, browser: this.browser };

    switch (suite) {
      case ScanSuite.ACCESSIBILITY: {
        const scanner = new AccessibilityScanner();
        const result = await scanner.scan(url, context);
        return result.findings;
      }

      case ScanSuite.PERFORMANCE: {
        const scanner = new PerformanceScanner();
        const result = await scanner.scan(url, context);
        
        // Save performance metrics
        if (result.metrics) {
          await this.prisma.performanceResult.create({
            data: {
              scanId: (page as any).scanId, // This would need to be passed properly
              url,
              ...result.metrics,
            },
          });
        }
        
        return result.findings;
      }

      case ScanSuite.CONSOLE_ERRORS: {
        return await this.scanConsoleErrors(page, url);
      }

      case ScanSuite.BROKEN_LINKS: {
        return await this.scanBrokenLinks(page, url);
      }

      default:
        this.logger.warn(`Unknown suite: ${suite}`);
        return [];
    }
  }

  private async scanConsoleErrors(page: any, url: string): Promise<any[]> {
    const findings: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Listen for console messages
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', (error: Error) => {
      errors.push(error.message);
    });

    // Reload page to capture errors
    await page.reload({ waitUntil: 'networkidle' });

    // Create findings for errors
    if (errors.length > 0) {
      findings.push({
        suite: ScanSuite.CONSOLE_ERRORS,
        severity: Severity.HIGH,
        title: `${errors.length} JavaScript error(s) detected`,
        description: 'Console errors were detected on the page.',
        url,
        evidence: errors.slice(0, 5).join('\n'),
        recommendation: 'Fix JavaScript errors to improve user experience and prevent potential functionality issues.',
      });
    }

    // Create findings for warnings
    if (warnings.length > 3) {
      findings.push({
        suite: ScanSuite.CONSOLE_ERRORS,
        severity: Severity.MEDIUM,
        title: `${warnings.length} console warnings detected`,
        description: 'Multiple console warnings were detected.',
        url,
        evidence: warnings.slice(0, 3).join('\n'),
        recommendation: 'Review and address console warnings to improve code quality.',
      });
    }

    return findings;
  }

  private async scanBrokenLinks(page: any, url: string): Promise<any[]> {
    const findings: any[] = [];

    // Extract all links
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(a => ({
        href: (a as HTMLAnchorElement).href,
        text: (a as HTMLAnchorElement).textContent || '',
      }));
    });

    // Check links (sample first 10 for demo)
    const brokenLinks: string[] = [];
    const linksToCheck = links.slice(0, 10);

    for (const link of linksToCheck) {
      try {
        const response = await page.request.head(link.href, { timeout: 5000 });
        if (response.status() >= 400) {
          brokenLinks.push(`${link.href} (${response.status()})`);
        }
      } catch (error) {
        brokenLinks.push(`${link.href} (timeout/error)`);
      }
    }

    if (brokenLinks.length > 0) {
      findings.push({
        suite: ScanSuite.BROKEN_LINKS,
        severity: Severity.MEDIUM,
        title: `${brokenLinks.length} broken link(s) detected`,
        description: 'Links returning 4xx or 5xx status codes were found.',
        url,
        evidence: brokenLinks.join('\n'),
        recommendation: 'Fix or remove broken links to improve user experience and SEO.',
      });
    }

    return findings;
  }
}
