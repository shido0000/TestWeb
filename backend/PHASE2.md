# TestHub Backend - Phase 2 Implementation

This document describes the Phase 2 backend implementation for TestHub, which adds advanced security scanning, E2E testing, and CI/CD integration capabilities.

## 🎯 Phase 2 Features

### 1. Advanced Security Scanning

#### Security Headers Scanner
- Checks 11 security headers (CSP, HSTS, X-Frame-Options, etc.)
- Validates header configurations
- Detects information disclosure
- Identifies mixed content issues
- Validates cookie security flags

**File**: `packages/scanners/src/security/headers-scanner.ts`

#### SSL/TLS Scanner
- Certificate validation and expiry checking
- Protocol version detection (TLS 1.0/1.1/1.2/1.3)
- Cipher suite strength analysis
- HSTS header validation
- Known vulnerability detection (Heartbleed, POODLE, etc.)
- SSL grade calculation (A+ to F)

**File**: `packages/scanners/src/security/ssl-scanner.ts`

#### OWASP ZAP Integration
- Automated spider/crawling
- Active vulnerability scanning
- Alert collection and normalization
- Session management
- Configurable scan policies

**File**: `packages/scanners/src/security/zap-scanner.ts`

**Docker Service**: `zap` (port 8080)

#### Nuclei Integration
- Template-based vulnerability scanning
- Multiple severity levels (critical, high, medium, low, info)
- Custom template support
- Rate limiting and timeout configuration
- JSON output parsing

**File**: `packages/scanners/src/security/nuclei-scanner.ts`

**Docker Service**: `nuclei` (profile: tools)

### 2. E2E Testing with Playwright

#### E2E Scanner
- User-defined test flows (YAML/JSON)
- 9 step types: navigate, click, type, wait, assert, screenshot, hover, select, scroll
- Assertion support: visible, hidden, text, url, title, attribute, count
- Screenshot capture on failure
- Video recording support
- Multiple viewport testing

**File**: `packages/scanners/src/e2e/index.ts`

**Example Flow**:
```yaml
name: User Login Flow
steps:
  - action: navigate
    value: https://example.com/login
  - action: type
    selector: "#email"
    value: "user@example.com"
  - action: type
    selector: "#password"
    value: "password123"
  - action: click
    selector: "button[type='submit']"
  - action: assert
    selector: ".dashboard"
    assertion:
      type: visible
      timeout: 5000
```

### 3. Integration System

#### Slack Integration
- Scan completion notifications
- Critical finding alerts
- Scan failure notifications
- Rich message formatting with blocks
- Action buttons for quick access

**File**: `backend/apps/api/src/integrations/integration.service.ts`

#### Jira Integration
- Automatic issue creation for findings
- Priority mapping (critical → Highest, high → High, etc.)
- Label assignment (testhub, suite, severity)
- Rich descriptions with evidence
- Project key configuration

#### Webhook Integration
- Custom webhook support
- HMAC signature verification
- Event-based triggering
- Configurable payloads

#### Integration Manager
- Centralized integration management
- Event-based notification system
- Configuration storage in database
- Enable/disable per integration
- Event filtering

**Database Model**: `Integration` (in Prisma schema)

### 4. CI/CD Integration

#### Supported Providers
- GitHub Actions
- GitLab CI/CD
- Jenkins
- Azure DevOps
- CircleCI

#### Features
- Quality gates based on severity thresholds
- Automatic scan triggering on push/PR
- Pipeline status reporting
- Configurable fail conditions

**Database Model**: `CICDConfig` (in Prisma schema)

**Example GitHub Actions Workflow**:
```yaml
name: TestHub Security Gate
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run TestHub Scan
        uses: testhub/action@v1
        with:
          api-key: ${{ secrets.TESTHUB_API_KEY }}
          target: https://staging.example.com
          suites: accessibility,security,performance
          fail-on: high
```

## 🏗️ Architecture

### Scanner Registry

All scanners are registered in a central registry:

```typescript
export const scanners: Record<string, Scanner> = {
  [ScanSuite.ACCESSIBILITY]: new AccessibilityScanner(),
  [ScanSuite.PERFORMANCE]: new PerformanceScanner(),
  [ScanSuite.SECURITY]: new SecurityHeadersScanner(),
  [ScanSuite.E2E]: new E2EScanner(),
};

export const securityScanners = {
  headers: new SecurityHeadersScanner(),
  ssl: new SSLScanner(),
  zap: new ZapScanner(),
  nuclei: new NucleiScanner(),
};
```

### Worker Processing

The worker processes scans using the following flow:

1. **Crawl** - Discover pages using Playwright
2. **Scan** - Execute selected suites on each page
3. **Normalize** - Convert scanner results to common Finding format
4. **Store** - Save findings to database
5. **Notify** - Trigger integrations based on events

### Docker Services

```yaml
services:
  postgres    # Database
  redis       # Job queue
  minio       # File storage
  api         # NestJS API
  worker      # Playwright + Scanners
  zap         # OWASP ZAP (Phase 2)
  nuclei      # Nuclei templates (Phase 2)
  web         # Frontend
```

## 📊 Database Schema (Phase 2 Additions)

### Integration Model
```prisma
model Integration {
  id        String   @id @default(uuid())
  projectId String?
  type      String   // slack, jira, webhook, email
  name      String
  enabled   Boolean  @default(true)
  config    Json
  events    String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### CICDConfig Model
```prisma
model CICDConfig {
  id             String   @id @default(uuid())
  projectId      String
  provider       String   // github_actions, gitlab_ci, jenkins
  name           String
  enabled        Boolean  @default(true)
  config         Json
  triggerOn      String[]
  failOnSeverity String   @default("HIGH")
  lastRun        DateTime?
  lastStatus     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### E2EFlow Model
```prisma
model E2EFlow {
  id          String   @id @default(uuid())
  projectId   String
  targetId    String
  name        String
  description String?
  steps       Json     // Array of E2EStep objects
  tags        String[]
  lastRun     DateTime?
  lastStatus  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔧 Configuration

### Environment Variables (Phase 2)

```bash
# OWASP ZAP
ZAP_API_URL=http://zap:8080
ZAP_API_KEY=testhub-zap-key

# Nuclei
NUCLEI_TEMPLATES_PATH=/nuclei-templates
NUCLEI_SEVERITY=critical,high,medium

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Jira
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_USER_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=SEC

# Webhook
WEBHOOK_URL=https://your-domain.com/webhooks/testhub
WEBHOOK_SECRET=your-webhook-secret
```

## 🚀 Usage

### Running Security Scans

```typescript
// Create a scan with security suites
const scan = await api.post('/scans', {
  targetId: 'target-uuid',
  suites: ['SECURITY'],
  config: {
    securityScanners: ['headers', 'ssl', 'zap', 'nuclei'],
  },
});
```

### Running E2E Tests

```typescript
// Create an E2E flow
const flow = await api.post('/e2e-flows', {
  projectId: 'project-uuid',
  targetId: 'target-uuid',
  name: 'Login Flow',
  steps: [
    { type: 'navigate', value: 'https://example.com/login' },
    { type: 'type', selector: '#email', value: 'user@example.com' },
    { type: 'click', selector: 'button[type="submit"]' },
    { type: 'assert', selector: '.dashboard', assertion: { type: 'visible' } },
  ],
});

// Execute the flow
const scan = await api.post('/scans', {
  targetId: 'target-uuid',
  suites: ['E2E'],
  config: { flowId: flow.id },
});
```

### Configuring Integrations

```typescript
// Add Slack integration
await api.post('/integrations', {
  type: 'slack',
  name: 'Security Alerts',
  config: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK',
  },
  events: ['scan_completed', 'critical_finding'],
});

// Add Jira integration
await api.post('/integrations', {
  type: 'jira',
  name: 'Security Issues',
  config: {
    baseUrl: 'https://your-domain.atlassian.net',
    email: 'your-email@domain.com',
    apiToken: 'your-api-token',
    projectKey: 'SEC',
  },
  events: ['finding_created'],
});
```

## 📈 Metrics

### Security Scan Metrics

```typescript
{
  headers: {
    headersPresent: 8,
    headersTotal: 11,
    requiredHeadersPresent: 6,
    requiredHeadersTotal: 6,
    mixedContentCount: 0,
    insecureCookies: 0,
  },
  ssl: {
    grade: 'A',
    protocol: 'TLSv1.3',
    cipher: 'TLS_AES_256_GCM_SHA384',
    daysUntilExpiry: 84,
    supportsHSTS: true,
    vulnerableToHeartbleed: false,
    // ... more metrics
  },
  zap: {
    available: true,
    alerts: 12,
    byRisk: {
      critical: 0,
      high: 2,
      medium: 5,
      low: 3,
      info: 2,
    },
  },
  nuclei: {
    available: true,
    findings: 8,
    bySeverity: {
      critical: 1,
      high: 2,
      medium: 3,
      low: 1,
      info: 1,
    },
  },
}
```

### E2E Test Metrics

```typescript
{
  e2e: {
    flows: 3,
    totalSteps: 24,
    passed: 2,
    failed: 1,
  },
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run security scanner tests
npm test -- --grep "Security"

# Run E2E scanner tests
npm test -- --grep "E2E"

# Run integration tests
npm test -- --grep "Integration"
```

## 📝 Migration Guide

### From Phase 1 to Phase 2

1. **Update dependencies**:
   ```bash
   npm install
   ```

2. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Update environment variables**:
   ```bash
   cp .env.example .env
   # Add Phase 2 variables
   ```

4. **Rebuild Docker images**:
   ```bash
   docker-compose build
   ```

5. **Start services**:
   ```bash
   docker-compose up -d
   ```

## 🔐 Security Considerations

### OWASP ZAP
- Runs in daemon mode with API key authentication
- Isolated in separate Docker container
- Network access restricted to test targets only

### Nuclei
- Template-based scanning reduces false positives
- Rate limiting prevents overwhelming targets
- Severity filtering focuses on critical issues

### SSL/TLS Scanner
- Non-invasive certificate checking
- No private key access required
- Graceful degradation on connection failures

### E2E Scanner
- Playwright runs in headless mode
- Isolated browser contexts per test
- Automatic cleanup on failure

## 🐛 Troubleshooting

### ZAP Connection Issues
```bash
# Check ZAP status
curl http://localhost:8080/JSON/core/view/version/

# Restart ZAP
docker-compose restart zap
```

### Nuclei Template Issues
```bash
# Update templates
docker-compose run nuclei nuclei -update-templates

# Check template path
docker-compose exec worker ls -la /nuclei-templates
```

### E2E Test Failures
```bash
# Check Playwright logs
docker-compose logs worker | grep "E2E"

# Run in headed mode for debugging
# Set PLAYWRIGHT_HEADLESS=false in .env
```

## 📚 Additional Resources

- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Nuclei Documentation](https://nuclei.projectdiscovery.io/)
- [Playwright Documentation](https://playwright.dev/)
- [testssl.sh Documentation](https://testssl.sh/)

---

**Phase 2 Status**: ✅ Complete

**Next**: Phase 3 - AI Insights, Anomaly Detection, Multi-tenant, Billing
