// ============================================
// Integration Service - Slack, Jira, Webhooks
// ============================================

export interface IntegrationEvent {
  type: 'scan_completed' | 'finding_created' | 'critical_finding' | 'scan_failed';
  data: any;
  timestamp: Date;
}

export interface IntegrationConfig {
  id: string;
  type: 'slack' | 'jira' | 'webhook' | 'email';
  enabled: boolean;
  config: Record<string, any>;
  events: string[];
}

// ============================================
// Slack Integration
// ============================================

export class SlackIntegration {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(event: IntegrationEvent): Promise<void> {
    const message = this.formatMessage(event);
    
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  private formatMessage(event: IntegrationEvent): any {
    switch (event.type) {
      case 'scan_completed':
        return {
          text: `✅ Scan completed for ${event.data.targetUrl}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '✅ Scan Completed' },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Target:*\n${event.data.targetUrl}` },
                { type: 'mrkdwn', text: `*Duration:*\n${Math.round(event.data.duration / 60)} minutes` },
                { type: 'mrkdwn', text: `*Pages Scanned:*\n${event.data.pagesScanned}` },
                { type: 'mrkdwn', text: `*Total Findings:*\n${event.data.totalFindings}` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Critical:* ${event.data.findingsSummary.critical} | *High:* ${event.data.findingsSummary.high} | *Medium:* ${event.data.findingsSummary.medium}`,
              },
            },
          ],
        };

      case 'critical_finding':
        return {
          text: `🚨 CRITICAL: ${event.data.title}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '🚨 Critical Finding Detected' },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${event.data.title}*\n${event.data.description}`,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*URL:*\n${event.data.url}` },
                { type: 'mrkdwn', text: `*Severity:*\n${event.data.severity}` },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View Details' },
                  url: event.data.detailsUrl,
                },
              ],
            },
          ],
        };

      case 'scan_failed':
        return {
          text: `❌ Scan failed for ${event.data.targetUrl}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '❌ Scan Failed' },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Target:* ${event.data.targetUrl}\n*Error:* ${event.data.error}`,
              },
            },
          ],
        };

      default:
        return {
          text: `TestHub: ${event.type}`,
        };
    }
  }
}

// ============================================
// Jira Integration
// ============================================

export class JiraIntegration {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private projectKey: string;

  constructor(config: { baseUrl: string; email: string; apiToken: string; projectKey: string }) {
    this.baseUrl = config.baseUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.projectKey = config.projectKey;
  }

  async createIssue(event: IntegrationEvent): Promise<string> {
    const issue = this.formatIssue(event);

    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issue),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jira API failed: ${response.statusText} - ${error}`);
      }

      const data = await response.json();
      return data.key;
    } catch (error) {
      console.error('Failed to create Jira issue:', error);
      throw error;
    }
  }

  private formatIssue(event: IntegrationEvent): any {
    const finding = event.data;

    return {
      fields: {
        project: { key: this.projectKey },
        summary: `[${finding.severity.toUpperCase()}] ${finding.title}`,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: finding.description },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'URL: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: finding.url },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Evidence: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: finding.evidence || 'N/A' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Recommendation: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: finding.recommendation || 'N/A' },
              ],
            },
          ],
        },
        issuetype: { name: 'Bug' },
        priority: { name: this.mapPriority(finding.severity) },
        labels: ['testhub', finding.suite.toLowerCase(), finding.severity.toLowerCase()],
      },
    };
  }

  private mapPriority(severity: string): string {
    const mapping: Record<string, string> = {
      critical: 'Highest',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      info: 'Lowest',
      warning: 'Low',
    };
    return mapping[severity] || 'Medium';
  }
}

// ============================================
// Webhook Integration
// ============================================

export class WebhookIntegration {
  private url: string;
  private secret?: string;

  constructor(url: string, secret?: string) {
    this.url = url;
    this.secret = secret;
  }

  async send(event: IntegrationEvent): Promise<void> {
    const payload = {
      event: event.type,
      timestamp: event.timestamp.toISOString(),
      data: event.data,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add signature if secret is configured
    if (this.secret) {
      const signature = await this.generateSignature(JSON.stringify(payload));
      headers['X-TestHub-Signature'] = signature;
    }

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send webhook:', error);
      throw error;
    }
  }

  private async generateSignature(payload: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto
      .createHmac('sha256', this.secret!)
      .update(payload)
      .digest('hex');
  }
}

// ============================================
// Integration Manager
// ============================================

export class IntegrationManager {
  private integrations: Map<string, IntegrationConfig> = new Map();

  register(config: IntegrationConfig): void {
    this.integrations.set(config.id, config);
  }

  unregister(id: string): void {
    this.integrations.delete(id);
  }

  async notify(event: IntegrationEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const config of this.integrations.values()) {
      if (!config.enabled) continue;
      if (!config.events.includes(event.type)) continue;

      try {
        switch (config.type) {
          case 'slack':
            const slack = new SlackIntegration(config.config.webhookUrl);
            promises.push(slack.send(event));
            break;

          case 'jira':
            if (event.type === 'finding_created' || event.type === 'critical_finding') {
              const jira = new JiraIntegration(config.config);
              promises.push(jira.createIssue(event).then(() => {}));
            }
            break;

          case 'webhook':
            const webhook = new WebhookIntegration(config.config.url, config.config.secret);
            promises.push(webhook.send(event));
            break;

          case 'email':
            // Email integration would be implemented here
            console.log('Email integration not yet implemented');
            break;
        }
      } catch (error) {
        console.error(`Integration ${config.id} failed:`, error);
        // Continue with other integrations
      }
    }

    await Promise.allSettled(promises);
  }
}
