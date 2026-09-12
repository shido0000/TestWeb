// ============================================
// Nuclei Scanner
// ============================================
// Integrates with Nuclei for vulnerability scanning using templates

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity } from '@testhub/shared';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

interface NucleiConfig {
  templatesPath: string;
  severity: string;
  timeout: number;
  rateLimit: number;
}

interface NucleiResult {
  templateID: string;
  info: {
    name: string;
    severity: string;
    description: string;
    tags: string;
    reference?: string;
  };
  matchedAt: string;
  type: string;
  host: string;
  timestamp: string;
}

const SEVERITY_MAP: Record<string, typeof Severity[keyof typeof Severity]> = {
  critical: Severity.CRITICAL,
  high: Severity.HIGH,
  medium: Severity.MEDIUM,
  low: Severity.LOW,
  info: Severity.INFO,
  unknown: Severity.INFO,
};

export class NucleiScanner implements Scanner {
  name = 'Nuclei Scanner';
  suite = ScanSuite.SECURITY;
  
  private config: NucleiConfig;

  constructor(config?: Partial<NucleiConfig>) {
    this.config = {
      templatesPath: config?.templatesPath || process.env.NUCLEI_TEMPLATES_PATH || '/nuclei-templates',
      severity: config?.severity || process.env.NUCLEI_SEVERITY || 'critical,high,medium',
      timeout: config?.timeout || 300, // 5 minutes
      rateLimit: config?.rateLimit || 100,
    };
  }

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const findings: RawFinding[] = [];

    try {
      // Check if Nuclei is available
      const isAvailable = await this.checkNucleiAvailability();
      
      if (!isAvailable) {
        console.warn('Nuclei is not available. Skipping Nuclei scan.');
        return {
          url,
          findings: [{
            suite: ScanSuite.SECURITY,
            severity: Severity.INFO,
            title: 'Nuclei Not Available',
            description: 'Nuclei is not installed or not accessible. Security scan was performed without Nuclei.',
            url,
            recommendation: 'Install Nuclei and ensure it is in the system PATH.',
          }],
          metrics: { nuclei: { available: false, findings: 0 } },
        };
      }

      // Create temporary output file
      const outputFile = path.join(os.tmpdir(), `nuclei-${Date.now()}.json`);

      // Build Nuclei command
      const command = this.buildNucleiCommand(url, outputFile);

      // Execute Nuclei
      try {
        await execAsync(command, { timeout: this.config.timeout * 1000 });
      } catch (error: any) {
        // Nuclei returns non-zero exit code when findings are detected
        // This is expected behavior
        if (error.code !== 1) {
          throw error;
        }
      }

      // Read results
      if (fs.existsSync(outputFile)) {
        const results = fs.readFileSync(outputFile, 'utf-8')
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line) as NucleiResult);

        // Convert Nuclei results to findings
        for (const result of results) {
          findings.push({
            suite: ScanSuite.SECURITY,
            severity: SEVERITY_MAP[result.info.severity.toLowerCase()] || Severity.MEDIUM,
            title: result.info.name,
            description: result.info.description,
            url: result.matchedAt || result.host,
            evidence: `Template: ${result.templateID}\nType: ${result.type}`,
            recommendation: this.getRecommendation(result),
            cweId: this.extractCweId(result.info.tags),
          });
        }

        // Clean up output file
        fs.unlinkSync(outputFile);

        return {
          url,
          findings,
          metrics: {
            nuclei: {
              available: true,
              findings: results.length,
              bySeverity: {
                critical: results.filter(r => r.info.severity === 'critical').length,
                high: results.filter(r => r.info.severity === 'high').length,
                medium: results.filter(r => r.info.severity === 'medium').length,
                low: results.filter(r => r.info.severity === 'low').length,
                info: results.filter(r => r.info.severity === 'info').length,
              },
              templates: Array.from(new Set(results.map(r => r.templateID))),
            },
          },
        };
      }

      return {
        url,
        findings: [],
        metrics: { nuclei: { available: true, findings: 0 } },
      };
    } catch (error) {
      console.error(`Nuclei scan failed for ${url}:`, error);
      
      return {
        url,
        findings: [{
          suite: ScanSuite.SECURITY,
          severity: Severity.INFO,
          title: 'Nuclei Scan Error',
          description: `Nuclei scan encountered an error: ${(error as Error).message}`,
          url,
          recommendation: 'Check Nuclei installation and configuration.',
        }],
        metrics: { nuclei: { available: true, findings: 0, error: (error as Error).message } },
      };
    }
  }

  private async checkNucleiAvailability(): Promise<boolean> {
    try {
      await execAsync('nuclei -version', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private buildNucleiCommand(url: string, outputFile: string): string {
    const args = [
      'nuclei',
      '-target', `"${url}"`,
      '-severity', this.config.severity,
      '-json',
      '-output', `"${outputFile}"`,
      '-timeout', this.config.timeout.toString(),
      '-rate-limit', this.config.rateLimit.toString(),
      '-silent',
    ];

    if (this.config.templatesPath && fs.existsSync(this.config.templatesPath)) {
      args.push('-templates', `"${this.config.templatesPath}"`);
    }

    return args.join(' ');
  }

  private getRecommendation(result: NucleiResult): string {
    // Provide recommendations based on template type
    const templateId = result.templateID.toLowerCase();

    if (templateId.includes('exposed')) {
      return 'Remove or restrict access to exposed resources. Implement proper access controls.';
    }
    
    if (templateId.includes('xss')) {
      return 'Implement input validation and output encoding. Use Content-Security-Policy headers.';
    }
    
    if (templateId.includes('sqli') || templateId.includes('sql-injection')) {
      return 'Use parameterized queries or prepared statements. Implement input validation.';
    }
    
    if (templateId.includes('lfi') || templateId.includes('rfi')) {
      return 'Validate and sanitize file paths. Implement allowlists for file access.';
    }
    
    if (templateId.includes('ssrf')) {
      return 'Validate and sanitize URLs. Implement allowlists for external requests.';
    }
    
    if (templateId.includes('default-credentials')) {
      return 'Change default credentials immediately. Implement strong password policies.';
    }
    
    if (templateId.includes('misconfiguration')) {
      return 'Review and fix server/application configuration. Follow security best practices.';
    }

    if (result.info.reference) {
      return `Refer to: ${result.info.reference}`;
    }

    return 'Review the finding and apply appropriate security measures based on the vulnerability type.';
  }

  private extractCweId(tags: string): string | undefined {
    // Try to extract CWE ID from tags
    const cweMatch = tags.match(/cwe-(\d+)/i);
    if (cweMatch) {
      return `CWE-${cweMatch[1]}`;
    }
    return undefined;
  }
}
