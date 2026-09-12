// ============================================
// E2E Scanner - Playwright-based functional tests
// ============================================
// Executes user-defined test flows using Playwright

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity, E2EStep, E2EStepType } from '@testhub/shared';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface E2EScanConfig {
  flows: E2EFlow[];
  timeout: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  viewports: { width: number; height: number }[];
}

interface E2EFlow {
  id: string;
  name: string;
  description?: string;
  steps: E2EStep[];
  tags?: string[];
}

interface StepResult {
  step: E2EStep;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: Buffer;
}

export class E2EScanner implements Scanner {
  name = 'E2E Scanner';
  suite = ScanSuite.E2E;

  private config: E2EScanConfig;

  constructor(config?: Partial<E2EScanConfig>) {
    this.config = {
      flows: config?.flows || [],
      timeout: config?.timeout || 30000,
      screenshotOnFailure: config?.screenshotOnFailure ?? true,
      videoOnFailure: config?.videoOnFailure ?? false,
      viewports: config?.viewports || [{ width: 1920, height: 1080 }],
    };
  }

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const findings: RawFinding[] = [];
    const browser = await chromium.launch({ headless: true });

    try {
      for (const flow of this.config.flows) {
        const flowResult = await this.executeFlow(browser, url, flow);
        
        // Create findings for failed steps
        for (const result of flowResult) {
          if (result.status === 'failed') {
            findings.push({
              suite: ScanSuite.E2E,
              severity: Severity.HIGH,
              title: `E2E Test Failed: ${flow.name} - Step: ${result.step.description}`,
              description: `E2E test step failed: ${result.step.type} ${result.step.selector || ''} ${result.step.value || ''}`,
              url,
              evidence: result.error || 'Step assertion failed',
              recommendation: this.getRecommendation(result.step),
            });
          }
        }

        // Check if entire flow passed
        const failedSteps = flowResult.filter(r => r.status === 'failed');
        if (failedSteps.length === 0) {
          findings.push({
            suite: ScanSuite.E2E,
            severity: Severity.INFO,
            title: `E2E Test Passed: ${flow.name}`,
            description: `All ${flowResult.length} steps passed successfully.`,
            url,
            evidence: `Duration: ${flowResult.reduce((sum, r) => sum + r.duration, 0)}ms`,
          });
        }
      }

      return {
        url,
        findings,
        metrics: {
          e2e: {
            flows: this.config.flows.length,
            totalSteps: this.config.flows.reduce((sum, f) => sum + f.steps.length, 0),
            passed: findings.filter(f => f.severity === Severity.INFO).length,
            failed: findings.filter(f => f.severity !== Severity.INFO).length,
          },
        },
      };
    } finally {
      await browser.close();
    }
  }

  private async executeFlow(browser: Browser, baseUrl: string, flow: E2EFlow): Promise<StepResult[]> {
    const results: StepResult[] = [];
    const context = await browser.newContext({
      viewport: this.config.viewports[0],
    });
    const page = await context.newPage();

    try {
      for (const step of flow.steps) {
        const startTime = Date.now();
        
        try {
          await this.executeStep(page, baseUrl, step);
          
          results.push({
            step,
            status: 'passed',
            duration: Date.now() - startTime,
          });
        } catch (error) {
          const errorMessage = (error as Error).message;
          
          // Take screenshot on failure
          let screenshot: Buffer | undefined;
          if (this.config.screenshotOnFailure) {
            try {
              screenshot = await page.screenshot({ fullPage: true });
            } catch {
              // Ignore screenshot errors
            }
          }

          results.push({
            step,
            status: 'failed',
            duration: Date.now() - startTime,
            error: errorMessage,
            screenshot,
          });

          // Stop flow on failure
          break;
        }
      }
    } finally {
      await context.close();
    }

    return results;
  }

  private async executeStep(page: Page, baseUrl: string, step: E2EStep): Promise<void> {
    switch (step.type) {
      case 'navigate':
        await page.goto(step.value || baseUrl, {
          waitUntil: step.waitUntil || 'networkidle',
          timeout: step.timeout || this.config.timeout,
        });
        break;

      case 'click':
        if (!step.selector) throw new Error('Click step requires a selector');
        await page.click(step.selector, { timeout: step.timeout || this.config.timeout });
        break;

      case 'type':
        if (!step.selector) throw new Error('Type step requires a selector');
        await page.fill(step.selector, step.value || '', { timeout: step.timeout || this.config.timeout });
        break;

      case 'wait':
        if (step.selector) {
          await page.waitForSelector(step.selector, {
            state: 'visible',
            timeout: step.timeout || this.config.timeout,
          });
        } else {
          await page.waitForTimeout(step.timeout || 1000);
        }
        break;

      case 'assert':
        if (!step.assertion) throw new Error('Assert step requires an assertion');
        await this.executeAssertion(page, step);
        break;

      case 'screenshot':
        // Screenshots are handled automatically on failure
        break;

      case 'hover':
        if (!step.selector) throw new Error('Hover step requires a selector');
        await page.hover(step.selector, { timeout: step.timeout || this.config.timeout });
        break;

      case 'select':
        if (!step.selector) throw new Error('Select step requires a selector');
        await page.selectOption(step.selector, step.value || '', { timeout: step.timeout || this.config.timeout });
        break;

      case 'scroll':
        if (step.selector) {
          await page.locator(step.selector).scrollIntoViewIfNeeded({ timeout: step.timeout || this.config.timeout });
        } else {
          await page.evaluate(() => window.scrollBy(0, 500));
        }
        break;

      default:
        throw new Error(`Unknown step type: ${(step as any).type}`);
    }
  }

  private async executeAssertion(page: Page, step: E2EStep): Promise<void> {
    const assertion = step.assertion!;
    const timeout = assertion.timeout || step.timeout || this.config.timeout;

    switch (assertion.type) {
      case 'visible':
        if (!step.selector) throw new Error('Visible assertion requires a selector');
        await page.waitForSelector(step.selector, { state: 'visible', timeout });
        break;

      case 'hidden':
        if (!step.selector) throw new Error('Hidden assertion requires a selector');
        await page.waitForSelector(step.selector, { state: 'hidden', timeout });
        break;

      case 'text':
        if (!step.selector) throw new Error('Text assertion requires a selector');
        const text = await page.textContent(step.selector, { timeout });
        if (text !== assertion.expected) {
          throw new Error(`Expected text "${assertion.expected}" but got "${text}"`);
        }
        break;

      case 'url':
        const url = page.url();
        if (assertion.expected && !url.includes(assertion.expected)) {
          throw new Error(`Expected URL to contain "${assertion.expected}" but got "${url}"`);
        }
        break;

      case 'title':
        const title = await page.title();
        if (assertion.expected && title !== assertion.expected) {
          throw new Error(`Expected title "${assertion.expected}" but got "${title}"`);
        }
        break;

      case 'attribute':
        if (!step.selector) throw new Error('Attribute assertion requires a selector');
        const attr = await page.getAttribute(step.selector, assertion.expected?.split('=')[0] || '', { timeout });
        const expectedValue = assertion.expected?.split('=')[1];
        if (expectedValue && attr !== expectedValue) {
          throw new Error(`Expected attribute value "${expectedValue}" but got "${attr}"`);
        }
        break;

      case 'count':
        if (!step.selector) throw new Error('Count assertion requires a selector');
        const count = await page.locator(step.selector).count();
        if (assertion.expected && count !== parseInt(assertion.expected)) {
          throw new Error(`Expected ${assertion.expected} elements but found ${count}`);
        }
        break;

      default:
        throw new Error(`Unknown assertion type: ${assertion.type}`);
    }
  }

  private getRecommendation(step: E2EStep): string {
    switch (step.type) {
      case 'navigate':
        return 'Check if the URL is correct and accessible. Verify network connectivity.';
      case 'click':
        return 'Verify the element exists and is clickable. Check for overlays or loading states.';
      case 'type':
        return 'Verify the input field exists and is editable. Check for form validation errors.';
      case 'assert':
        return 'Review the assertion criteria. The page state may not match expectations.';
      default:
        return 'Review the test step and ensure the application behaves as expected.';
    }
  }
}
