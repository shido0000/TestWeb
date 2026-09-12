// ============================================
// OWASP ZAP Scanner
// ============================================
// Integrates with OWASP ZAP API for vulnerability scanning

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity } from '@testhub/shared';

interface ZapConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
}

interface ZapAlert {
  alert: string;
  name: string;
  riskcode: string;
  confidence: string;
  riskdesc: string;
  description: string;
  solution: string;
  reference: string;
  cweid: string;
  wascid: string;
  url: string;
  param: string;
  evidence: string;
}

const RISK_MAP: Record<string, typeof Severity[keyof typeof Severity]> = {
  '0': Severity.INFO,
  '1': Severity.LOW,
  '2': Severity.MEDIUM,
  '3': Severity.HIGH,
  '4': Severity.CRITICAL,
};

const CONFIDENCE_MAP: Record<string, 'high' | 'medium' | 'low'> = {
  '0': 'low',
  '1': 'medium',
  '2': 'high',
  '3': 'high',
};

export class ZapScanner implements Scanner {
  name = 'OWASP ZAP Scanner';
  suite = ScanSuite.SECURITY;
  
  private config: ZapConfig;

  constructor(config?: Partial<ZapConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.ZAP_API_URL || 'http://localhost:8080',
      apiKey: config?.apiKey || process.env.ZAP_API_KEY || '',
      timeout: config?.timeout || 300000, // 5 minutes
    };
  }

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const findings: RawFinding[] = [];

    try {
      // Check if ZAP is available
      const isAvailable = await this.checkZapAvailability();
      
      if (!isAvailable) {
        console.warn('OWASP ZAP is not available. Skipping ZAP scan.');
        return {
          url,
          findings: [{
            suite: ScanSuite.SECURITY,
            severity: Severity.INFO,
            title: 'OWASP ZAP Not Available',
            description: 'OWASP ZAP service is not running or not accessible. Security scan was performed without ZAP.',
            url,
            evidence: `ZAP API URL: ${this.config.apiUrl}`,
            recommendation: 'Ensure OWASP ZAP is running and accessible at the configured URL.',
          }],
          metrics: { zap: { available: false, alerts: 0 } },
        };
      }

      // Create a new ZAP session
      const sessionId = await this.createSession(url);

      // Start spider (crawl)
      await this.startSpider(url);
      await this.waitForSpider(sessionId);

      // Start active scan
      await this.startActiveScan(url);
      await this.waitForActiveScan(sessionId);

      // Get alerts
      const alerts = await this.getAlerts(url);

      // Convert ZAP alerts to findings
      for (const alert of alerts) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: RISK_MAP[alert.riskcode] || Severity.MEDIUM,
          title: alert.name || alert.alert,
          description: alert.description,
          url: alert.url || url,
          evidence: alert.evidence || `Parameter: ${alert.param}`,
          recommendation: alert.solution,
          cweId: alert.cweid ? `CWE-${alert.cweid}` : undefined,
        });
      }

      // Delete session
      await this.deleteSession(sessionId);

      return {
        url,
        findings,
        metrics: {
          zap: {
            available: true,
            alerts: alerts.length,
            byRisk: {
              critical: alerts.filter(a => a.riskcode === '4').length,
              high: alerts.filter(a => a.riskcode === '3').length,
              medium: alerts.filter(a => a.riskcode === '2').length,
              low: alerts.filter(a => a.riskcode === '1').length,
              info: alerts.filter(a => a.riskcode === '0').length,
            },
          },
        },
      };
    } catch (error) {
      console.error(`ZAP scan failed for ${url}:`, error);
      
      // Return findings with error info rather than throwing
      return {
        url,
        findings: [{
          suite: ScanSuite.SECURITY,
          severity: Severity.INFO,
          title: 'ZAP Scan Error',
          description: `ZAP scan encountered an error: ${(error as Error).message}`,
          url,
          recommendation: 'Check ZAP configuration and try again.',
        }],
        metrics: { zap: { available: true, alerts: 0, error: (error as Error).message } },
      };
    }
  }

  private async checkZapAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/JSON/core/view/version/`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async createSession(url: string): Promise<string> {
    const response = await fetch(
      `${this.config.apiUrl}/JSON/core/action/newSession/?name=testhub-${Date.now()}`,
      { headers: this.getHeaders() }
    );
    const data = await response.json();
    return data.sessionId || 'default';
  }

  private async startSpider(url: string): Promise<void> {
    await fetch(
      `${this.config.apiUrl}/JSON/spider/action/scan/?url=${encodeURIComponent(url)}`,
      { headers: this.getHeaders() }
    );
  }

  private async waitForSpider(sessionId: string): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.timeout) {
      const response = await fetch(
        `${this.config.apiUrl}/JSON/spider/view/status/?scanId=0`,
        { headers: this.getHeaders() }
      );
      const data = await response.json();
      
      if (parseInt(data.status) >= 100) break;
      await this.sleep(2000);
    }
  }

  private async startActiveScan(url: string): Promise<void> {
    await fetch(
      `${this.config.apiUrl}/JSON/ascan/action/scan/?url=${encodeURIComponent(url)}`,
      { headers: this.getHeaders() }
    );
  }

  private async waitForActiveScan(sessionId: string): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.timeout) {
      const response = await fetch(
        `${this.config.apiUrl}/JSON/ascan/view/status/?scanId=0`,
        { headers: this.getHeaders() }
      );
      const data = await response.json();
      
      if (parseInt(data.status) >= 100) break;
      await this.sleep(5000);
    }
  }

  private async getAlerts(url: string): Promise<ZapAlert[]> {
    const response = await fetch(
      `${this.config.apiUrl}/JSON/core/view/alerts/?baseurl=${encodeURIComponent(url)}&start=0&count=1000`,
      { headers: this.getHeaders() }
    );
    const data = await response.json();
    return data.alerts || [];
  }

  private async deleteSession(sessionId: string): Promise<void> {
    try {
      await fetch(
        `${this.config.apiUrl}/JSON/core/action/saveSession/?name=${sessionId}`,
        { headers: this.getHeaders() }
      );
    } catch {
      // Ignore cleanup errors
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.config.apiKey) {
      headers['X-ZAP-API-Key'] = this.config.apiKey;
    }
    
    return headers;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
