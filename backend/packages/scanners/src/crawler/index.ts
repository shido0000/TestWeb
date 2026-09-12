// ============================================
// Web Crawler - Playwright-based
// ============================================

import { chromium, Browser, Page } from 'playwright';
import { TargetScope } from '@testhub/shared';

export interface CrawlResult {
  url: string;
  title: string | null;
  statusCode: number;
  depth: number;
  contentType: string | null;
  linksFound: number;
  resources: number;
  loadTime: number;
  forms: number;
  inputs: number;
  discoveredAt: Date;
}

export interface CrawlerOptions {
  maxDepth: number;
  allowedDomains: string[];
  excludedPaths: string[];
  respectRobotsTxt: boolean;
  rateLimit: number; // requests per second
  timeout: number;
  headless: boolean;
}

export class Crawler {
  private browser: Browser | null = null;
  private visited = new Set<string>();
  private results: CrawlResult[] = [];
  private options: CrawlerOptions;

  constructor(options: Partial<CrawlerOptions> = {}) {
    this.options = {
      maxDepth: options.maxDepth ?? 5,
      allowedDomains: options.allowedDomains ?? [],
      excludedPaths: options.excludedPaths ?? [],
      respectRobotsTxt: options.respectRobotsTxt ?? true,
      rateLimit: options.rateLimit ?? 10,
      timeout: options.timeout ?? 30000,
      headless: options.headless ?? true,
    };
  }

  async crawl(startUrl: string): Promise<CrawlResult[]> {
    console.log(`🕷️  Starting crawl: ${startUrl}`);
    console.log(`   Max depth: ${this.options.maxDepth}`);
    console.log(`   Allowed domains: ${this.options.allowedDomains.join(', ')}`);

    try {
      // Launch browser
      this.browser = await chromium.launch({
        headless: this.options.headless,
      });

      const context = await this.browser.newContext({
        userAgent: 'TestHub-Crawler/1.0',
      });

      // Check robots.txt if required
      let disallowedPaths: string[] = [];
      if (this.options.respectRobotsTxt) {
        disallowedPaths = await this.fetchRobotsTxt(startUrl);
      }

      // Start crawling
      await this.crawlUrl(startUrl, 0, context, disallowedPaths);

      console.log(`✅ Crawl completed. Found ${this.results.length} pages.`);
      return this.results;
    } catch (error) {
      console.error('❌ Crawl failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async crawlUrl(
    url: string,
    depth: number,
    context: any,
    disallowedPaths: string[]
  ): Promise<void> {
    // Check if already visited
    if (this.visited.has(url)) return;

    // Check depth limit
    if (depth > this.options.maxDepth) return;

    // Check if URL is allowed
    if (!this.isUrlAllowed(url, disallowedPaths)) return;

    // Rate limiting
    await this.rateLimit();

    console.log(`   [${depth}] Crawling: ${url}`);

    const page = await context.newPage();
    const startTime = Date.now();

    try {
      // Navigate to URL
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout,
      });

      if (!response) {
        await page.close();
        return;
      }

      // Mark as visited
      this.visited.add(url);

      // Extract page data
      const title = await page.title();
      const links = await this.extractLinks(page, url);
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input, select, textarea').count();
      const loadTime = Date.now() - startTime;

      // Get content type
      const contentType = response.headers()['content-type'] || null;

      // Count resources (images, scripts, stylesheets)
      const resources = await page.evaluate(() => {
        return document.images.length + 
               document.scripts.length + 
               document.styleSheets.length;
      });

      // Store result
      const result: CrawlResult = {
        url,
        title,
        statusCode: response.status(),
        depth,
        contentType,
        linksFound: links.length,
        resources,
        loadTime,
        forms,
        inputs,
        discoveredAt: new Date(),
      };

      this.results.push(result);

      // Crawl discovered links
      for (const link of links) {
        if (!this.visited.has(link)) {
          await this.crawlUrl(link, depth + 1, context, disallowedPaths);
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed to crawl ${url}:`, error);
    } finally {
      await page.close();
    }
  }

  private async extractLinks(page: Page, baseUrl: string): Promise<string[]> {
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(a => (a as HTMLAnchorElement).href);
    });

    // Filter and normalize links
    const baseUrlObj = new URL(baseUrl);
    const filteredLinks = links
      .map(link => {
        try {
          return new URL(link, baseUrl).href;
        } catch {
          return null;
        }
      })
      .filter((link): link is string => {
        if (!link) return false;
        const linkUrl = new URL(link);
        
        // Only follow links from allowed domains
        if (this.options.allowedDomains.length > 0) {
          return this.options.allowedDomains.some(domain => 
            linkUrl.hostname === domain || linkUrl.hostname.endsWith(`.${domain}`)
          );
        }
        
        // If no allowed domains specified, only follow same domain
        return linkUrl.hostname === baseUrlObj.hostname;
      })
      .filter(link => {
        // Remove fragments
        const urlWithoutFragment = link.split('#')[0];
        
        // Check excluded paths
        return !this.options.excludedPaths.some(path => 
          urlWithoutFragment.includes(path)
        );
      });

    // Remove duplicates
    return Array.from(new Set(filteredLinks));
  }

  private async fetchRobotsTxt(startUrl: string): Promise<string[]> {
    try {
      const robotsUrl = new URL('/robots.txt', startUrl).href;
      const page = await this.browser!.newPage();
      const response = await page.goto(robotsUrl, { timeout: 5000 });
      
      if (!response || response.status() !== 200) {
        await page.close();
        return [];
      }

      const content = await page.textContent('body');
      await page.close();

      if (!content) return [];

      // Parse robots.txt
      const disallowedPaths: string[] = [];
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Disallow:')) {
          const path = trimmed.replace('Disallow:', '').trim();
          if (path && path !== '/') {
            disallowedPaths.push(path);
          }
        }
      }

      console.log(`   📜 Robots.txt: ${disallowedPaths.length} paths disallowed`);
      return disallowedPaths;
    } catch (error) {
      console.log('   ⚠️  Could not fetch robots.txt, continuing without it');
      return [];
    }
  }

  private isUrlAllowed(url: string, disallowedPaths: string[]): boolean {
    const urlObj = new URL(url);
    
    // Check disallowed paths from robots.txt
    for (const path of disallowedPaths) {
      if (urlObj.pathname.startsWith(path)) {
        return false;
      }
    }

    // Check excluded paths from config
    for (const path of this.options.excludedPaths) {
      if (urlObj.pathname.includes(path)) {
        return false;
      }
    }

    return true;
  }

  private async rateLimit(): Promise<void> {
    const delay = 1000 / this.options.rateLimit;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  getResults(): CrawlResult[] {
    return this.results;
  }
}
