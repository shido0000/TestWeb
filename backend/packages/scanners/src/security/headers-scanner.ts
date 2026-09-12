// ============================================
// Security Headers Scanner
// ============================================
// Checks HTTP security headers against best practices

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity } from '@testhub/shared';

interface HeaderCheck {
  name: string;
  required: boolean;
  severity: typeof Severity[keyof typeof Severity];
  recommendation: string;
  validate?: (value: string) => boolean;
}

const SECURITY_HEADERS: HeaderCheck[] = [
  {
    name: 'Content-Security-Policy',
    required: true,
    severity: Severity.CRITICAL,
    recommendation: 'Implement CSP to prevent XSS and data injection attacks. Start with report-only mode.',
  },
  {
    name: 'X-Frame-Options',
    required: true,
    severity: Severity.HIGH,
    recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking attacks.',
  },
  {
    name: 'Strict-Transport-Security',
    required: true,
    severity: Severity.HIGH,
    recommendation: 'Add HSTS header with max-age of at least 31536000 (1 year) and includeSubDomains.',
    validate: (value: string) => {
      const maxAgeMatch = value.match(/max-age=(\d+)/);
      return maxAgeMatch ? parseInt(maxAgeMatch[1]) >= 31536000 : false;
    },
  },
  {
    name: 'X-Content-Type-Options',
    required: true,
    severity: Severity.MEDIUM,
    recommendation: 'Add X-Content-Type-Options: nosniff to prevent MIME type sniffing.',
    validate: (value: string) => value === 'nosniff',
  },
  {
    name: 'Referrer-Policy',
    required: true,
    severity: Severity.MEDIUM,
    recommendation: 'Add Referrer-Policy: strict-origin-when-cross-origin or no-referrer.',
    validate: (value: string) => {
      const validPolicies = ['no-referrer', 'no-referrer-when-downgrade', 'strict-origin', 'strict-origin-when-cross-origin', 'same-origin'];
      return validPolicies.includes(value.toLowerCase());
    },
  },
  {
    name: 'Permissions-Policy',
    required: true,
    severity: Severity.MEDIUM,
    recommendation: 'Add Permissions-Policy to restrict browser features (camera, microphone, geolocation).',
  },
  {
    name: 'X-XSS-Protection',
    required: false,
    severity: Severity.LOW,
    recommendation: 'Add X-XSS-Protection: 1; mode=block (deprecated but still recommended for older browsers).',
  },
  {
    name: 'X-Permitted-Cross-Domain-Policies',
    required: false,
    severity: Severity.LOW,
    recommendation: 'Add X-Permitted-Cross-Domain-Policies: none to prevent Flash/PDF cross-domain access.',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    required: false,
    severity: Severity.LOW,
    recommendation: 'Add Cross-Origin-Opener-Policy: same-origin for process isolation.',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    required: false,
    severity: Severity.LOW,
    recommendation: 'Add Cross-Origin-Resource-Policy: same-origin to prevent cross-origin resource embedding.',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    required: false,
    severity: Severity.LOW,
    recommendation: 'Add Cross-Origin-Embedder-Policy: require-corp for enhanced security.',
  },
];

export class SecurityHeadersScanner implements Scanner {
  name = 'Security Headers Scanner';
  suite = ScanSuite.SECURITY;

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const { page } = context;
    if (!page) {
      throw new Error('Playwright page is required for security headers scanning');
    }

    try {
      // Navigate and capture response headers
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      if (!response) {
        throw new Error(`No response received from ${url}`);
      }

      const headers = response.headers();
      const findings: RawFinding[] = [];
      const headerResults: any[] = [];

      // Check each security header
      for (const check of SECURITY_HEADERS) {
        const headerValue = headers[check.name.toLowerCase()];
        const present = !!headerValue;
        const valid = present && (!check.validate || check.validate(headerValue));

        headerResults.push({
          name: check.name,
          present,
          value: headerValue || null,
          valid,
          severity: check.severity,
          recommendation: check.recommendation,
        });

        if (!present && check.required) {
          findings.push({
            suite: ScanSuite.SECURITY,
            severity: check.severity,
            title: `Missing ${check.name} Header`,
            description: `The ${check.name} security header is not present in the response.`,
            url,
            evidence: `Response headers do not include ${check.name}`,
            recommendation: check.recommendation,
          });
        } else if (present && check.validate && !check.validate(headerValue)) {
          findings.push({
            suite: ScanSuite.SECURITY,
            severity: check.severity,
            title: `Invalid ${check.name} Configuration`,
            description: `The ${check.name} header is present but has an invalid or weak configuration.`,
            url,
            evidence: `${check.name}: ${headerValue}`,
            recommendation: check.recommendation,
          });
        }
      }

      // Check for information disclosure
      const serverHeader = headers['server'];
      if (serverHeader && /\/\d/.test(serverHeader)) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.LOW,
          title: 'Server Version Disclosure',
          description: `The server discloses its version in the Server header (${serverHeader}).`,
          url,
          evidence: `Server: ${serverHeader}`,
          recommendation: 'Configure the server to not disclose version information.',
        });
      }

      const poweredBy = headers['x-powered-by'];
      if (poweredBy) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.LOW,
          title: 'X-Powered-By Header Disclosure',
          description: `The X-Powered-By header reveals technology stack (${poweredBy}).`,
          url,
          evidence: `X-Powered-By: ${poweredBy}`,
          recommendation: 'Remove X-Powered-By header to avoid technology fingerprinting.',
        });
      }

      // Check for mixed content
      const mixedContent = await page.evaluate(() => {
        const resources = [
          ...Array.from(document.querySelectorAll('img[src^="http:"]')),
          ...Array.from(document.querySelectorAll('script[src^="http:"]')),
          ...Array.from(document.querySelectorAll('link[href^="http:"]')),
        ];
        return resources.map(el => (el as HTMLElement).getAttribute('src') || (el as HTMLElement).getAttribute('href'));
      });

      if (mixedContent.length > 0) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.HIGH,
          title: 'Mixed Content Detected',
          description: `${mixedContent.length} HTTP resource(s) loaded on HTTPS page.`,
          url,
          evidence: mixedContent.slice(0, 5).join('\n'),
          recommendation: 'Serve all resources over HTTPS to prevent man-in-the-middle attacks.',
        });
      }

      // Check cookies security
      const cookies = await page.context().cookies();
      const insecureCookies = cookies.filter(c => 
        url.startsWith('https://') && !c.secure
      );

      if (insecureCookies.length > 0) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.MEDIUM,
          title: 'Cookies Without Secure Flag',
          description: `${insecureCookies.length} cookie(s) set without the Secure flag on HTTPS page.`,
          url,
          evidence: insecureCookies.map(c => c.name).join(', '),
          recommendation: 'Set the Secure flag on all cookies to ensure they are only sent over HTTPS.',
        });
      }

      const noHttpOnlyCookies = cookies.filter(c => !c.httpOnly && !c.name.startsWith('_ga'));
      if (noHttpOnlyCookies.length > 0) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.MEDIUM,
          title: 'Cookies Without HttpOnly Flag',
          description: `${noHttpOnlyCookies.length} cookie(s) accessible via JavaScript.`,
          url,
          evidence: noHttpOnlyCookies.map(c => c.name).join(', '),
          recommendation: 'Set HttpOnly flag on session cookies to prevent XSS-based cookie theft.',
        });
      }

      return {
        url,
        findings,
        metrics: {
          headers: headerResults,
          headersPresent: headerResults.filter(h => h.present).length,
          headersTotal: headerResults.length,
          requiredHeadersPresent: headerResults.filter(h => h.present && SECURITY_HEADERS.find(c => c.name === h.name)?.required).length,
          requiredHeadersTotal: SECURITY_HEADERS.filter(h => h.required).length,
          mixedContentCount: mixedContent.length,
          insecureCookies: insecureCookies.length,
          cookiesSecure: insecureCookies.length === 0,
          mixedContent: mixedContent.length > 0,
        },
      };
    } catch (error) {
      console.error(`Security headers scan failed for ${url}:`, error);
      throw error;
    }
  }
}
