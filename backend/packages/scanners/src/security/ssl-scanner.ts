// ============================================
// SSL/TLS Scanner
// ============================================
// Checks SSL/TLS configuration and vulnerabilities

import { Scanner, ScanResult, ScanContext, RawFinding, ScanSuite, Severity, SslGrade } from '@testhub/shared';
import * as tls from 'tls';
import * as https from 'https';

interface SSLCheck {
  name: string;
  description: string;
  check: (cert: any, socket: any) => boolean;
  severity: typeof Severity[keyof typeof Severity];
  recommendation: string;
}

export class SSLScanner implements Scanner {
  name = 'SSL/TLS Scanner';
  suite = ScanSuite.SECURITY;

  async scan(url: string, context: ScanContext): Promise<ScanResult> {
    const findings: RawFinding[] = [];
    
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.CRITICAL,
          title: 'No HTTPS Connection',
          description: 'The site does not use HTTPS, leaving all data unencrypted.',
          url,
          evidence: `Protocol: ${urlObj.protocol}`,
          recommendation: 'Implement HTTPS with a valid SSL/TLS certificate immediately.',
        });

        return {
          url,
          findings,
          metrics: {
            ssl: {
              grade: 'F' as SslGrade,
              protocol: 'None',
              cipher: 'None',
              issuer: 'None',
              validFrom: '',
              validTo: '',
              daysUntilExpiry: 0,
              supportsHSTS: false,
              supportsHPKP: false,
              supportsOCSP: false,
              vulnerableToHeartbleed: false,
              vulnerableToCCS: false,
              vulnerableToRenego: false,
              vulnerableToCrime: false,
              vulnerableToPoodle: false,
              vulnerableToFreak: false,
              vulnerableToLogjam: false,
              vulnerableToDrown: false,
            },
          },
        };
      }

      // Perform SSL/TLS checks
      const sslInfo = await this.checkSSL(urlObj.hostname, urlObj.port || '443');
      
      // Check certificate validity
      if (sslInfo.daysUntilExpiry < 0) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.CRITICAL,
          title: 'Expired SSL Certificate',
          description: `The SSL certificate expired ${Math.abs(sslInfo.daysUntilExpiry)} days ago.`,
          url,
          evidence: `Valid until: ${sslInfo.validTo}`,
          recommendation: 'Renew the SSL certificate immediately.',
        });
      } else if (sslInfo.daysUntilExpiry < 30) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.HIGH,
          title: 'SSL Certificate Expiring Soon',
          description: `The SSL certificate expires in ${sslInfo.daysUntilExpiry} days.`,
          url,
          evidence: `Valid until: ${sslInfo.validTo}`,
          recommendation: 'Renew the SSL certificate before it expires.',
        });
      }

      // Check for weak protocols
      if (sslInfo.protocol === 'TLSv1.0' || sslInfo.protocol === 'TLSv1.1') {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.HIGH,
          title: 'Deprecated TLS Version in Use',
          description: `The server is using ${sslInfo.protocol}, which is deprecated and insecure.`,
          url,
          evidence: `Protocol: ${sslInfo.protocol}`,
          recommendation: 'Disable TLS 1.0 and 1.1. Only allow TLS 1.2 and 1.3.',
        });
      }

      // Check for weak ciphers
      if (this.isWeakCipher(sslInfo.cipher)) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.HIGH,
          title: 'Weak Cipher Suite',
          description: `The server is using a weak cipher suite: ${sslInfo.cipher}`,
          url,
          evidence: `Cipher: ${sslInfo.cipher}`,
          recommendation: 'Disable weak cipher suites and use only strong, modern ciphers.',
        });
      }

      // Check HSTS
      if (!sslInfo.supportsHSTS) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.MEDIUM,
          title: 'Missing HSTS Header',
          description: 'The site does not implement HTTP Strict Transport Security.',
          url,
          evidence: 'Strict-Transport-Security header not present',
          recommendation: 'Implement HSTS with a max-age of at least 31536000 seconds (1 year).',
        });
      }

      // Check for known vulnerabilities
      if (sslInfo.vulnerableToHeartbleed) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.CRITICAL,
          title: 'Vulnerable to Heartbleed',
          description: 'The server is vulnerable to the Heartbleed bug (CVE-2014-0160).',
          url,
          evidence: 'Heartbleed vulnerability detected',
          recommendation: 'Update OpenSSL to a patched version immediately.',
        });
      }

      if (sslInfo.vulnerableToPoodle) {
        findings.push({
          suite: ScanSuite.SECURITY,
          severity: Severity.HIGH,
          title: 'Vulnerable to POODLE',
          description: 'The server is vulnerable to the POODLE attack (CVE-2014-3566).',
          url,
          evidence: 'POODLE vulnerability detected',
          recommendation: 'Disable SSLv3 and update OpenSSL.',
        });
      }

      return {
        url,
        findings,
        metrics: {
          ssl: sslInfo,
        },
      };
    } catch (error) {
      console.error(`SSL scan failed for ${url}:`, error);
      throw error;
    }
  }

  private async checkSSL(hostname: string, port: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        {
          host: hostname,
          port: parseInt(port),
          servername: hostname,
          rejectUnauthorized: false,
        },
        () => {
          const cert = socket.getPeerCertificate();
          const cipher = socket.getCipher();
          
          // Calculate days until expiry
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Check for HSTS
          const httpsAgent = new https.Agent({ rejectUnauthorized: false });
          https.get(`https://${hostname}`, { agent: httpsAgent }, (res) => {
            const hsts = res.headers['strict-transport-security'];
            
            resolve({
              grade: this.calculateGrade(cert, cipher, daysUntilExpiry),
              protocol: socket.getProtocol(),
              cipher: cipher?.name || 'Unknown',
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysUntilExpiry,
              supportsHSTS: !!hsts,
              supportsHPKP: !!res.headers['public-key-pins'],
              supportsOCSP: !!cert.OCSP,
              vulnerableToHeartbleed: false, // Would need actual vulnerability testing
              vulnerableToCCS: false,
              vulnerableToRenego: false,
              vulnerableToCrime: false,
              vulnerableToPoodle: false,
              vulnerableToFreak: false,
              vulnerableToLogjam: false,
              vulnerableToDrown: false,
            });

            socket.destroy();
          }).on('error', () => {
            resolve({
              grade: this.calculateGrade(cert, cipher, daysUntilExpiry),
              protocol: socket.getProtocol(),
              cipher: cipher?.name || 'Unknown',
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysUntilExpiry,
              supportsHSTS: false,
              supportsHPKP: false,
              supportsOCSP: !!cert.OCSP,
              vulnerableToHeartbleed: false,
              vulnerableToCCS: false,
              vulnerableToRenego: false,
              vulnerableToCrime: false,
              vulnerableToPoodle: false,
              vulnerableToFreak: false,
              vulnerableToLogjam: false,
              vulnerableToDrown: false,
            });
            socket.destroy();
          });
        }
      );

      socket.on('error', (error) => {
        reject(error);
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
    });
  }

  private calculateGrade(cert: any, cipher: any, daysUntilExpiry: number): SslGrade {
    let score = 100;

    // Deduct for certificate issues
    if (daysUntilExpiry < 0) score -= 50;
    else if (daysUntilExpiry < 30) score -= 20;

    // Deduct for weak protocols
    if (cipher?.version === 'TLSv1.0' || cipher?.version === 'TLSv1.1') {
      score -= 30;
    }

    // Deduct for weak ciphers
    if (this.isWeakCipher(cipher?.name)) {
      score -= 25;
    }

    // Convert score to grade
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private isWeakCipher(cipher: string): boolean {
    if (!cipher) return true;
    
    const weakCiphers = [
      'RC4',
      'DES',
      '3DES',
      'MD5',
      'NULL',
      'EXPORT',
      'anon',
    ];

    return weakCiphers.some(weak => cipher.toUpperCase().includes(weak));
  }
}
