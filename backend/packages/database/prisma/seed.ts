import { PrismaClient, UserRole, Environment, ScanStatus, ScanSuite, Severity, FindingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.accessibilityResult.deleteMany();
  await prisma.performanceResult.deleteMany();
  await prisma.visualDiff.deleteMany();
  await prisma.visualBaseline.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.crawlResult.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.target.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const testerPassword = await bcrypt.hash('tester123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@testhub.io',
      passwordHash: adminPassword,
      name: 'Alex Rivera',
      role: UserRole.ADMIN,
    },
  });

  const tester = await prisma.user.create({
    data: {
      email: 'tester@testhub.io',
      passwordHash: testerPassword,
      name: 'Sarah Chen',
      role: UserRole.TESTER,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@testhub.io',
      passwordHash: testerPassword,
      name: 'Mike Johnson',
      role: UserRole.VIEWER,
    },
  });

  console.log('✅ Users created');

  // Create API keys
  await prisma.apiKey.create({
    data: {
      userId: admin.id,
      name: 'Production API Key',
      key: 'thub_prod_xK9mN2pQ7rT4wY6zA8bC0dE1fG3hJ5',
      prefix: 'thub_prod',
      permissions: ['scans:read', 'scans:write', 'findings:read', 'projects:read', 'projects:write'],
    },
  });

  await prisma.apiKey.create({
    data: {
      userId: admin.id,
      name: 'CI/CD Pipeline Key',
      key: 'thub_ci_mP3qR5sT7uV9wX1yA3bC5dE7fG9hJ1',
      prefix: 'thub_ci',
      permissions: ['scans:write', 'findings:read'],
    },
  });

  console.log('✅ API keys created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Main production e-commerce application with payment processing',
      tags: ['production', 'critical'],
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Corporate Website',
      description: 'Public-facing marketing website with CMS',
      tags: ['marketing', 'public'],
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Admin Dashboard',
      description: 'Internal admin panel for operations team',
      tags: ['internal', 'admin'],
    },
  });

  console.log('✅ Projects created');

  // Add members to projects
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id, role: UserRole.ADMIN },
      { projectId: project1.id, userId: tester.id, role: UserRole.TESTER },
      { projectId: project2.id, userId: admin.id, role: UserRole.ADMIN },
      { projectId: project2.id, userId: viewer.id, role: UserRole.VIEWER },
      { projectId: project3.id, userId: admin.id, role: UserRole.ADMIN },
    ],
  });

  console.log('✅ Project members created');

  // Create targets
  const target1 = await prisma.target.create({
    data: {
      projectId: project1.id,
      name: 'Production Store',
      url: 'https://shop.example.com',
      environment: Environment.PRODUCTION,
      authRequired: false,
      scope: {
        allowedDomains: ['shop.example.com', 'cdn.example.com'],
        excludedPaths: ['/admin', '/api/internal'],
        maxDepth: 5,
      },
    },
  });

  const target2 = await prisma.target.create({
    data: {
      projectId: project1.id,
      name: 'Staging Store',
      url: 'https://staging-shop.example.com',
      environment: Environment.STAGING,
      authRequired: true,
      headers: { Authorization: 'Bearer staging-token' },
      scope: {
        allowedDomains: ['staging-shop.example.com'],
        excludedPaths: ['/debug'],
        maxDepth: 4,
      },
    },
  });

  const target3 = await prisma.target.create({
    data: {
      projectId: project2.id,
      name: 'Corporate Site',
      url: 'https://www.example-corp.com',
      environment: Environment.PRODUCTION,
      authRequired: false,
      scope: {
        allowedDomains: ['www.example-corp.com'],
        excludedPaths: [],
        maxDepth: 3,
      },
    },
  });

  console.log('✅ Targets created');

  // Create scans
  const scan1 = await prisma.scan.create({
    data: {
      projectId: project1.id,
      targetId: target1.id,
      suites: [ScanSuite.CONSOLE_ERRORS, ScanSuite.BROKEN_LINKS, ScanSuite.ACCESSIBILITY, ScanSuite.PERFORMANCE, ScanSuite.VISUAL_REGRESSION],
      status: ScanStatus.COMPLETED,
      progress: 100,
      startedAt: new Date('2026-01-20T14:00:00Z'),
      completedAt: new Date('2026-01-20T14:30:00Z'),
      duration: 1800,
      triggeredBy: admin.name,
      triggeredByUserId: admin.id,
      pagesScanned: 47,
      totalRequests: 1283,
      criticalCount: 3,
      highCount: 7,
      mediumCount: 12,
      lowCount: 23,
      infoCount: 8,
      warningCount: 5,
    },
  });

  const scan2 = await prisma.scan.create({
    data: {
      projectId: project2.id,
      targetId: target3.id,
      suites: [ScanSuite.BROKEN_LINKS, ScanSuite.ACCESSIBILITY, ScanSuite.SEO, ScanSuite.PERFORMANCE],
      status: ScanStatus.COMPLETED,
      progress: 100,
      startedAt: new Date('2026-01-19T08:45:00Z'),
      completedAt: new Date('2026-01-19T09:15:00Z'),
      duration: 1800,
      triggeredBy: 'Scheduled',
      pagesScanned: 23,
      totalRequests: 654,
      criticalCount: 0,
      highCount: 2,
      mediumCount: 8,
      lowCount: 15,
      infoCount: 12,
      warningCount: 3,
    },
  });

  const scan3 = await prisma.scan.create({
    data: {
      projectId: project1.id,
      targetId: target1.id,
      suites: [ScanSuite.CONSOLE_ERRORS, ScanSuite.ACCESSIBILITY, ScanSuite.PERFORMANCE],
      status: ScanStatus.RUNNING,
      progress: 67,
      startedAt: new Date(),
      triggeredBy: admin.name,
      triggeredByUserId: admin.id,
      pagesScanned: 12,
      totalRequests: 340,
    },
  });

  console.log('✅ Scans created');

  // Create findings
  const findings = await Promise.all([
    prisma.finding.create({
      data: {
        scanId: scan1.id,
        projectId: project1.id,
        targetId: target1.id,
        suite: ScanSuite.ACCESSIBILITY,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Images Missing Alt Attributes',
        description: '12 product images on the homepage are missing alt attributes, making them inaccessible to screen readers.',
        url: 'https://shop.example.com/',
        evidence: 'Found 12 <img> elements without alt attribute',
        recommendation: 'Add descriptive alt text to all images. Use empty alt="" for decorative images.',
        wcagCriteria: 'WCAG 1.1.1',
        riskScore: 72,
      },
    }),
    prisma.finding.create({
      data: {
        scanId: scan1.id,
        projectId: project1.id,
        targetId: target1.id,
        suite: ScanSuite.ACCESSIBILITY,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Insufficient Color Contrast on CTA Buttons',
        description: 'Call-to-action buttons use light gray text (#999) on white background (#fff), failing WCAG AA contrast ratio.',
        url: 'https://shop.example.com/products',
        evidence: 'Contrast ratio: 2.84:1 (minimum required: 4.5:1 for normal text)',
        recommendation: 'Change button text color to at least #767676 for AA compliance or #595959 for AAA.',
        wcagCriteria: 'WCAG 1.4.3',
        riskScore: 68,
      },
    }),
    prisma.finding.create({
      data: {
        scanId: scan1.id,
        projectId: project1.id,
        targetId: target1.id,
        suite: ScanSuite.PERFORMANCE,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Largest Contentful Paint exceeds 4s',
        description: 'LCP is 4.8s on the homepage, well above the 2.5s threshold for "Good" rating.',
        url: 'https://shop.example.com/',
        evidence: 'LCP: 4823ms | Hero image: 2.3MB PNG (should be WebP <200KB)',
        recommendation: 'Convert hero image to WebP/AVIF, implement responsive images with srcset, add lazy loading.',
        riskScore: 75,
      },
    }),
    prisma.finding.create({
      data: {
        scanId: scan1.id,
        projectId: project1.id,
        targetId: target1.id,
        suite: ScanSuite.CONSOLE_ERRORS,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: 'Unhandled Promise Rejection in Checkout',
        description: 'The checkout flow has an unhandled promise rejection that causes the payment form to freeze.',
        url: 'https://shop.example.com/checkout',
        evidence: 'Uncaught (in promise) TypeError: Cannot read properties of undefined (reading \'token\')',
        recommendation: 'Add proper error handling with try/catch blocks and display user-friendly error messages.',
        riskScore: 55,
      },
    }),
    prisma.finding.create({
      data: {
        scanId: scan1.id,
        projectId: project1.id,
        targetId: target1.id,
        suite: ScanSuite.BROKEN_LINKS,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: '8 Broken Internal Links Detected',
        description: 'Multiple internal links return 404 errors, affecting user experience and SEO.',
        url: 'https://shop.example.com/products/sale',
        evidence: '404 errors on: /products/summer-collection, /about/team, /blog/2025/launch',
        recommendation: 'Fix or remove broken links. Implement redirect rules for moved pages.',
        riskScore: 45,
      },
    }),
  ]);

  console.log('✅ Findings created');

  // Create crawl results
  await prisma.crawlResult.createMany({
    data: [
      { targetId: target1.id, url: 'https://shop.example.com/', title: 'Shop - Home', statusCode: 200, depth: 0, contentType: 'text/html', linksFound: 45, resources: 28, loadTime: 1200, forms: 1, inputs: 3 },
      { targetId: target1.id, url: 'https://shop.example.com/products', title: 'Products', statusCode: 200, depth: 1, contentType: 'text/html', linksFound: 120, resources: 35, loadTime: 980, forms: 2, inputs: 5 },
      { targetId: target1.id, url: 'https://shop.example.com/cart', title: 'Shopping Cart', statusCode: 200, depth: 1, contentType: 'text/html', linksFound: 8, resources: 12, loadTime: 450, forms: 0, inputs: 0 },
      { targetId: target1.id, url: 'https://shop.example.com/checkout', title: 'Checkout', statusCode: 200, depth: 1, contentType: 'text/html', linksFound: 5, resources: 18, loadTime: 670, forms: 3, inputs: 12 },
      { targetId: target1.id, url: 'https://shop.example.com/about', title: 'About Us', statusCode: 200, depth: 1, contentType: 'text/html', linksFound: 12, resources: 8, loadTime: 320, forms: 0, inputs: 0 },
    ],
  });

  console.log('✅ Crawl results created');

  // Create performance results
  await prisma.performanceResult.create({
    data: {
      scanId: scan1.id,
      url: 'https://shop.example.com/',
      performanceScore: 42,
      accessibilityScore: 68,
      bestPracticesScore: 75,
      seoScore: 82,
      pwaScore: 35,
      fcp: 1200,
      lcp: 4823,
      fid: 180,
      cls: 0.25,
      ttfb: 450,
      tbt: 890,
      si: 3200,
      tti: 5100,
      totalWeight: 4200000,
      totalRequests: 87,
      domNodes: 1842,
      jsExecutionTime: 2300,
      resources: [
        { type: 'JavaScript', count: 24, transferSize: 1800000, resourceSize: 5400000 },
        { type: 'CSS', count: 8, transferSize: 120000, resourceSize: 380000 },
        { type: 'Image', count: 32, transferSize: 2100000, resourceSize: 3800000 },
      ],
    },
  });

  console.log('✅ Performance results created');

  // Create accessibility results
  await prisma.accessibilityResult.create({
    data: {
      scanId: scan1.id,
      url: 'https://shop.example.com/',
      score: 68,
      violations: 12,
      passes: 87,
      incomplete: 5,
      inapplicable: 23,
      wcagAA: false,
      wcagAAA: false,
      contrastIssues: 4,
      violationsDetail: [
        { id: 'image-alt', impact: 'critical', description: 'Images must have alternate text', nodes: 12 },
        { id: 'color-contrast', impact: 'serious', description: 'Elements must have sufficient color contrast', nodes: 8 },
      ],
    },
  });

  console.log('✅ Accessibility results created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 3 (admin, tester, viewer)`);
  console.log(`   - Projects: 3`);
  console.log(`   - Targets: 3`);
  console.log(`   - Scans: 3 (2 completed, 1 running)`);
  console.log(`   - Findings: 5`);
  console.log(`   - Crawl Results: 5`);
  console.log(`   - API Keys: 2`);
  console.log('\n🔐 Login credentials:');
  console.log('   - Admin: admin@testhub.io / admin123');
  console.log('   - Tester: tester@testhub.io / tester123');
  console.log('   - Viewer: viewer@testhub.io / tester123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
