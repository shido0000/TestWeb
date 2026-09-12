# TestHub Backend - Phase 3 Implementation

This document describes the Phase 3 backend implementation for TestHub, which adds AI-powered insights, visual anomaly detection, multi-tenant architecture, and billing integration.

## 🎯 Phase 3 Features

### 1. AI-Powered Insights

The AI module provides intelligent analysis of findings to help teams prioritize and understand patterns.

#### Key Features

- **Finding Prioritization**: ML-based risk scoring using multiple factors
- **Pattern Detection**: Identifies recurring issues across scans
- **Predictions**: Forecasts potential quality degradation
- **Correlation Analysis**: Links findings to deployment patterns

#### Risk Score Calculation

The AI service calculates risk scores based on:

```typescript
{
  severity: 0.25,           // CRITICAL=1.0, HIGH=0.75, etc.
  suite: 0.10,              // SECURITY=1.0, ACCESSIBILITY=0.7, etc.
  urlDepth: 0.05,           // Deeper URLs = lower priority
  hasEvidence: 0.10,        // Findings with evidence score higher
  isDuplicate: -0.15,       // Duplicates reduce score
  ageInHours: 0.05,         // Older findings score higher
  affectedPages: 0.10,      // More affected pages = higher score
  cvssScore: 0.15,          // CVSS score for security findings
  historicalFrequency: 0.10, // Recurring issues score higher
  businessCriticality: 0.15, // Checkout/payment pages score higher
}
```

#### Pattern Detection

Identifies patterns when:
- Same title appears 3+ times across scans
- Suite-specific findings average risk score > 60
- Similar findings cluster together (cosine similarity > 0.7)

#### Predictions

Generates predictions for:
- Performance degradation (based on trend analysis)
- Security regression (based on recent findings)
- Accessibility compliance (based on finding count)

**Files**:
- `apps/api/src/ai/ai-prioritization.service.ts`
- `apps/api/src/ai/ai.controller.ts`
- `apps/api/src/ai/ai.module.ts`

### 2. Visual Anomaly Detection

AI-powered detection of visual changes between screenshots.

#### Anomaly Types

- **Layout Shift**: Major layout changes (>20% difference)
- **Color Drift**: Color palette changes (10-20% difference)
- **Typography Mismatch**: Font or text styling changes
- **Missing Element**: Expected element not found
- **New Element**: Unexpected element appeared
- **Spacing Anomaly**: Padding/margin changes (5-10% difference)
- **Motion Anomaly**: Animation timing changes
- **Responsive Break**: Layout breaks at specific viewport

#### Detection Process

1. **Screenshot Capture**: Playwright captures screenshots at multiple viewports
2. **Perceptual Hashing**: Calculate hash for baseline and current screenshots
3. **Comparison**: Compare hashes using Hamming distance
4. **Bounding Box Detection**: Identify regions with differences
5. **Classification**: Determine anomaly type based on characteristics
6. **Heatmap Generation**: Create heatmap of changed regions

#### Baseline Management

- Automatic baseline creation on first scan
- Baseline updates after each successful scan
- Manual baseline approval workflow

**Files**:
- `apps/api/src/anomaly-detection/anomaly-detection.service.ts`
- `apps/api/src/anomaly-detection/anomaly-detection.controller.ts`
- `apps/api/src/anomaly-detection/anomaly-detection.module.ts`

### 3. Multi-Tenant Architecture

Complete tenant isolation with role-based access control.

#### Tenant Structure

```
Tenant
├── Members (owner, admin, member, viewer)
├── Projects
│   ├── Targets
│   ├── Scans
│   └── Findings
└── Settings (plan-specific)
```

#### Role Hierarchy

```
owner (4) > admin (3) > member (2) > viewer (1)
```

#### Data Isolation

- All queries filtered by `tenantId`
- Foreign key constraints ensure data integrity
- Cascade deletes when tenant is removed

#### Usage Tracking

Real-time tracking of:
- Scans per month
- Findings stored
- Storage used (MB)
- API calls
- Team members
- Projects

#### Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Scans/month | 50 | 1,000 | 5,000 |
| Findings | 500 | 10,000 | 50,000 |
| Storage | 1 GB | 20 GB | 100 GB |
| API Calls | 5,000 | 100,000 | 500,000 |
| Team Members | 2 | 10 | 50 |
| Projects | 3 | 20 | 100 |

**Files**:
- `apps/api/src/multi-tenant/multi-tenant.service.ts`
- `apps/api/src/multi-tenant/multi-tenant.controller.ts`
- `apps/api/src/multi-tenant/multi-tenant.module.ts`

### 4. Billing Integration (Stripe)

Complete subscription management with Stripe.

#### Features

- **Plan Management**: Free, Pro, Enterprise tiers
- **Subscription Lifecycle**: Create, update, cancel, change plans
- **Payment Methods**: Add, remove, set default
- **Invoicing**: Automatic invoice generation, PDF download
- **Webhooks**: Handle Stripe events (payment success/failure, subscription updates)

#### Subscription Flow

1. User selects plan and interval (monthly/yearly)
2. System creates Stripe customer (if not exists)
3. Payment method attached to customer
4. Subscription created in Stripe
5. Subscription saved to database
6. Tenant plan updated

#### Webhook Events

- `invoice.paid`: Mark invoice as paid
- `invoice.payment_failed`: Mark as failed, update subscription status
- `customer.subscription.updated`: Sync subscription state
- `customer.subscription.deleted`: Mark as canceled

#### Proration

Plan changes use Stripe's proration:
- Upgrades: Immediate charge for remaining period
- Downgrades: Credit applied to next invoice

**Files**:
- `apps/api/src/billing/billing.service.ts`
- `apps/api/src/billing/billing.controller.ts`
- `apps/api/src/billing/billing.module.ts`

## 🗄️ Database Schema (Phase 3 Additions)

### AI Insights
```prisma
model AIInsight {
  id               String   @id @default(uuid())
  projectId        String
  type             String   // prioritization, pattern, prediction, correlation, recommendation
  title            String
  description      String
  confidence       Int      // 0-100
  impact           String   // critical, high, medium, low
  affectedFindings String[]
  reasoning        String
  features         Json
  createdAt        DateTime @default(now())
}
```

### Visual Anomalies
```prisma
model VisualAnomaly {
  id               String   @id @default(uuid())
  targetId         String
  type             String   // layout_shift, color_drift, etc.
  severity         String   // critical, major, minor, cosmetic
  url              String
  viewport         String
  title            String
  description      String
  detectedAt       DateTime @default(now())
  introducedAt     DateTime?
  baselineValue    String
  currentValue     String
  delta            String
  confidence       Int
  affectedElements String[]
  heatmapData      Json?
  status           String   @default("new")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Multi-Tenant
```prisma
model Tenant {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  plan            String   @default("free")
  status          String   @default("trial")
  billingEmail    String?
  stripeCustomerId String? @unique
  settings        Json
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members         TenantMember[]
  projects        Project[]
}

model TenantMember {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String
  role      String   @default("member")
  joinedAt  DateTime @default(now())

  tenant    Tenant @relation(fields: [tenantId], references: [id])
  user      User   @relation(fields: [userId], references: [id])

  @@unique([tenantId, userId])
}
```

### Billing
```prisma
model Subscription {
  id                    String   @id @default(uuid())
  tenantId              String
  planId                String
  status                String   @default("active")
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean  @default(false)
  stripeSubscriptionId  String?  @unique
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  invoices              Invoice[]
}

model Invoice {
  id              String   @id @default(uuid())
  tenantId        String
  subscriptionId  String
  amount          Float
  currency        String   @default("USD")
  status          String   @default("pending")
  invoiceDate     DateTime
  dueDate         DateTime
  pdfUrl          String?
  stripeInvoiceId String?  @unique
  createdAt       DateTime @default(now())

  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
}

model PaymentMethod {
  id                    String   @id @default(uuid())
  tenantId              String
  type                  String
  last4                 String?
  brand                 String?
  expMonth              Int?
  expYear               Int?
  isDefault             Boolean  @default(false)
  stripePaymentMethodId String?  @unique
  createdAt             DateTime @default(now())
}
```

## 🔧 Configuration

### Environment Variables (Phase 3)

```bash
# AI & ML
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
AI_CONFIDENCE_THRESHOLD=70
AI_PATTERN_MIN_OCCURRENCES=3

# Stripe Billing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_id
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_id
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly_id

# Multi-Tenant
DEFAULT_PLAN=free
MAX_TENANTS_PER_USER=5
TENANT_SLUG_MIN_LENGTH=3
TENANT_SLUG_MAX_LENGTH=30
```

## 🚀 Usage

### AI Insights

```typescript
// Get insights for a project
const insights = await api.get('/ai/insights/project-uuid');

// Get detected patterns
const patterns = await api.get('/ai/patterns/project-uuid');

// Get predictions
const predictions = await api.get('/ai/predictions/project-uuid');

// Manually trigger prioritization
await api.post('/ai/prioritize/project-uuid');
```

### Visual Anomalies

```typescript
// Get anomalies for a target
const anomalies = await api.get('/anomalies?targetId=target-uuid');

// Get anomaly statistics
const stats = await api.get('/anomalies/stats/target-uuid');

// Update anomaly status
await api.put('/anomalies/anomaly-id/status', {
  status: 'acknowledged',
});
```

### Multi-Tenant

```typescript
// Create tenant
const tenant = await api.post('/tenants', {
  name: 'Acme Corp',
  slug: 'acme-corp',
  ownerId: 'user-uuid',
  plan: 'pro',
});

// Add member
await api.post('/tenants/tenant-uuid/members', {
  userId: 'user-uuid',
  role: 'admin',
});

// Check usage limits
const limits = await api.get('/tenants/tenant-uuid/limits');
if (!limits.allowed) {
  console.log('Limit reached:', limits.reason);
}
```

### Billing

```typescript
// Get available plans
const plans = await api.get('/billing/plans');

// Create subscription
const subscription = await api.post('/billing/subscriptions', {
  tenantId: 'tenant-uuid',
  planId: 'pro',
  interval: 'monthly',
  paymentMethodId: 'pm_xxx',
});

// Add payment method
await api.post('/billing/payment-methods', {
  tenantId: 'tenant-uuid',
  stripePaymentMethodId: 'pm_xxx',
});

// Get invoices
const invoices = await api.get('/billing/invoices/tenant-uuid');

// Download invoice PDF
const pdf = await api.get('/billing/invoices/invoice-uuid/pdf');
```

## 📊 API Endpoints (Phase 3)

### AI Insights
- `GET /ai/insights/:projectId` - Get AI insights
- `GET /ai/patterns/:projectId` - Get detected patterns
- `GET /ai/predictions/:projectId` - Get predictions
- `POST /ai/prioritize/:projectId` - Trigger prioritization

### Anomaly Detection
- `GET /anomalies` - List anomalies (filter by targetId, status)
- `GET /anomalies/stats/:targetId` - Get anomaly statistics
- `PUT /anomalies/:id/status` - Update anomaly status

### Multi-Tenant
- `POST /tenants` - Create tenant
- `GET /tenants/:id` - Get tenant details
- `PUT /tenants/:id` - Update tenant
- `DELETE /tenants/:id` - Delete tenant
- `GET /tenants/:id/members` - List members
- `POST /tenants/:id/members` - Add member
- `DELETE /tenants/:id/members/:userId` - Remove member
- `PUT /tenants/:id/members/:userId/role` - Update member role
- `GET /tenants/user/:userId` - Get user's tenants
- `GET /tenants/:id/usage` - Get usage statistics
- `GET /tenants/:id/limits` - Check usage limits

### Billing
- `GET /billing/plans` - List available plans
- `GET /billing/plans/:id` - Get plan details
- `POST /billing/subscriptions` - Create subscription
- `GET /billing/subscriptions/:tenantId` - Get subscription
- `POST /billing/subscriptions/:tenantId/cancel` - Cancel subscription
- `PUT /billing/subscriptions/:tenantId/change-plan` - Change plan
- `POST /billing/payment-methods` - Add payment method
- `GET /billing/payment-methods/:tenantId` - List payment methods
- `PUT /billing/payment-methods/:tenantId/:id/default` - Set default
- `DELETE /billing/payment-methods/:tenantId/:id` - Remove payment method
- `GET /billing/invoices/:tenantId` - List invoices
- `GET /billing/invoices/:id/pdf` - Download invoice PDF
- `POST /billing/webhooks/stripe` - Stripe webhook handler

## 🧪 Testing

```bash
# Run AI service tests
npm test -- --grep "AI"

# Run anomaly detection tests
npm test -- --grep "Anomaly"

# Run multi-tenant tests
npm test -- --grep "Tenant"

# Run billing tests
npm test -- --grep "Billing"

# Run all Phase 3 tests
npm test -- --grep "Phase 3"
```

## 📈 Migration Guide

### From Phase 2 to Phase 3

1. **Update dependencies**:
   ```bash
   npm install stripe @types/stripe
   ```

2. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Update environment variables**:
   ```bash
   cp .env.example .env
   # Add Phase 3 variables (Stripe, AI, etc.)
   ```

4. **Create Stripe products and prices**:
   - Create Pro and Enterprise plans in Stripe Dashboard
   - Set up monthly and yearly prices
   - Update environment variables with price IDs

5. **Configure Stripe webhooks**:
   - Add webhook endpoint in Stripe Dashboard
   - URL: `https://your-domain.com/api/billing/webhooks/stripe`
   - Events: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.*`

6. **Rebuild and restart**:
   ```bash
   npm run build
   docker-compose up -d
   ```

## 🔐 Security Considerations

### Multi-Tenant Isolation
- All database queries include `tenantId` filter
- Foreign key constraints prevent cross-tenant access
- Role-based access control enforced at service layer
- Audit logging for all tenant operations

### Billing Security
- Stripe handles all payment processing (PCI DSS compliant)
- Webhook signature verification prevents spoofing
- Payment methods stored in Stripe, not in our database
- Sensitive data (API keys, secrets) in environment variables only

### AI Security
- No PII sent to external AI services
- Findings data anonymized before analysis
- AI insights stored locally, not shared between tenants
- Confidence thresholds prevent low-quality recommendations

## 🐛 Troubleshooting

### AI Insights Not Generating
```bash
# Check AI service logs
docker-compose logs api | grep "AI"

# Verify OpenAI API key
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Anomaly Detection Issues
```bash
# Check storage service
docker-compose logs api | grep "Storage"

# Verify MinIO is running
curl http://localhost:9000/minio/health/live
```

### Billing Issues
```bash
# Check Stripe webhook logs
docker-compose logs api | grep "Stripe"

# Verify webhook signature
stripe listen --forward-to localhost:3000/api/billing/webhooks/stripe
```

### Multi-Tenant Issues
```bash
# Check tenant isolation
npm run db:studio
# Verify all queries include tenantId filter

# Check member permissions
SELECT * FROM tenant_members WHERE tenantId = 'xxx';
```

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/multi-tenancy)
- [Visual Regression Testing Best Practices](https://www.browserstack.com/guide/visual-regression-testing)

---

**Phase 3 Status**: ✅ Complete

**Total Backend Coverage**:
- Phase 1: ✅ 100% (Core testing platform)
- Phase 2: ✅ 100% (Security, E2E, Integrations)
- Phase 3: ✅ 100% (AI, Anomalies, Multi-tenant, Billing)

**Next Steps**:
- Deploy to production
- Set up monitoring and alerting
- Configure backup and disaster recovery
- Implement rate limiting and throttling
- Add comprehensive logging and observability
