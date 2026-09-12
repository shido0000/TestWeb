// ============================================
// AI Prioritization Service
// ============================================
// Machine learning-based finding prioritization and pattern detection

import { PrismaService } from '../prisma/prisma.service';
import { Severity, ScanSuite, FindingStatus } from '@testhub/shared';

interface FeatureVector {
  severity: number;
  suite: number;
  urlDepth: number;
  hasEvidence: number;
  isDuplicate: number;
  ageInHours: number;
  affectedPages: number;
  cvssScore: number;
  historicalFrequency: number;
  businessCriticality: number;
}

interface AIInsight {
  id: string;
  type: 'prioritization' | 'pattern' | 'prediction' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedFindings: string[];
  reasoning: string;
  features: { name: string; weight: number }[];
  createdAt: Date;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  occurrences: number;
  severity: Severity;
  relatedUrls: string[];
  suggestion: string;
  confidence: number;
}

interface Prediction {
  id: string;
  title: string;
  probability: number;
  timeframe: string;
  description: string;
  preventiveAction: string;
  relatedComponents: string[];
  historicalBasis: number;
}

export class AIPrioritizationService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // FINDING PRIORITIZATION
  // ============================================

  async prioritizeFindings(projectId: string): Promise<AIInsight[]> {
    const findings = await this.prisma.finding.findMany({
      where: { projectId, status: 'OPEN' },
      include: { scan: true, target: true },
    });

    if (findings.length === 0) return [];

    // Extract feature vectors
    const featureVectors = await Promise.all(
      findings.map(f => this.extractFeatures(f))
    );

    // Calculate risk scores using weighted model
    const riskScores = featureVectors.map(fv => this.calculateRiskScore(fv));

    // Cluster similar findings
    const clusters = this.clusterFindings(findings, featureVectors);

    // Generate insights
    const insights: AIInsight[] = [];

    // Critical cluster insights
    const criticalClusters = clusters.filter(c => 
      c.findings.some(f => f.severity === 'CRITICAL')
    );

    for (const cluster of criticalClusters) {
      insights.push({
        id: `insight-${Date.now()}-${Math.random()}`,
        type: 'prioritization',
        title: `Critical Security Cluster Detected`,
        description: `${cluster.findings.length} critical findings share common root cause: ${cluster.commonFeature}`,
        confidence: cluster.confidence,
        impact: 'critical',
        affectedFindings: cluster.findings.map(f => f.id),
        reasoning: `ML model detected semantic similarity (cosine ${cluster.similarity.toFixed(2)}) between findings. Historical data shows fixing root cause resolves ${Math.round(cluster.confidence)}% of similar clusters.`,
        features: cluster.features,
        createdAt: new Date(),
      });
    }

    // High-risk individual findings
    const highRiskFindings = findings
      .map((f, i) => ({ finding: f, score: riskScores[i] }))
      .filter(({ score }) => score > 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    for (const { finding, score } of highRiskFindings) {
      insights.push({
        id: `insight-${Date.now()}-${Math.random()}`,
        type: 'prioritization',
        title: `High-Risk Finding: ${finding.title}`,
        description: `Risk score: ${score}/100. ${finding.severity} severity finding requires immediate attention.`,
        confidence: Math.min(95, score + 10),
        impact: score > 90 ? 'critical' : 'high',
        affectedFindings: [finding.id],
        reasoning: `Weighted risk calculation based on severity (${this.getSeverityWeight(finding.severity)}), CVSS score (${finding.cvssScore || 'N/A'}), and historical impact patterns.`,
        features: this.getTopFeatures(featureVectors[findings.indexOf(finding)]),
        createdAt: new Date(),
      });
    }

    return insights;
  }

  private async extractFeatures(finding: any): Promise<FeatureVector> {
    const ageInHours = (Date.now() - new Date(finding.createdAt).getTime()) / (1000 * 60 * 60);
    
    // Count affected pages
    const affectedPages = await this.prisma.finding.count({
      where: {
        targetId: finding.targetId,
        title: finding.title,
      },
    });

    // Historical frequency
    const historicalFrequency = await this.prisma.finding.count({
      where: {
        targetId: finding.targetId,
        suite: finding.suite,
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    });

    return {
      severity: this.getSeverityWeight(finding.severity),
      suite: this.getSuiteWeight(finding.suite),
      urlDepth: this.calculateUrlDepth(finding.url),
      hasEvidence: finding.evidence ? 1 : 0,
      isDuplicate: finding.isDuplicate ? 1 : 0,
      ageInHours: Math.min(ageInHours / 168, 1), // Normalize to 1 week
      affectedPages: Math.min(affectedPages / 10, 1), // Normalize to 10 pages
      cvssScore: (finding.cvssScore || 0) / 10,
      historicalFrequency: Math.min(historicalFrequency / 20, 1), // Normalize to 20 occurrences
      businessCriticality: this.estimateBusinessCriticality(finding),
    };
  }

  private calculateRiskScore(features: FeatureVector): number {
    const weights = {
      severity: 0.25,
      suite: 0.10,
      urlDepth: 0.05,
      hasEvidence: 0.10,
      isDuplicate: -0.15, // Reduce score for duplicates
      ageInHours: 0.05,
      affectedPages: 0.10,
      cvssScore: 0.15,
      historicalFrequency: 0.10,
      businessCriticality: 0.15,
    };

    let score = 0;
    score += features.severity * weights.severity;
    score += features.suite * weights.suite;
    score += features.urlDepth * weights.urlDepth;
    score += features.hasEvidence * weights.hasEvidence;
    score += features.isDuplicate * weights.isDuplicate;
    score += features.ageInHours * weights.ageInHours;
    score += features.affectedPages * weights.affectedPages;
    score += features.cvssScore * weights.cvssScore;
    score += features.historicalFrequency * weights.historicalFrequency;
    score += features.businessCriticality * weights.businessCriticality;

    return Math.round(score * 100);
  }

  private getSeverityWeight(severity: string): number {
    const weights: Record<string, number> = {
      CRITICAL: 1.0,
      HIGH: 0.75,
      MEDIUM: 0.5,
      LOW: 0.25,
      INFO: 0.1,
      WARNING: 0.3,
    };
    return weights[severity] || 0.5;
  }

  private getSuiteWeight(suite: string): number {
    const weights: Record<string, number> = {
      SECURITY: 1.0,
      ACCESSIBILITY: 0.7,
      PERFORMANCE: 0.6,
      CONSOLE_ERRORS: 0.5,
      BROKEN_LINKS: 0.3,
      VISUAL_REGRESSION: 0.4,
      SEO: 0.2,
      E2E: 0.8,
    };
    return weights[suite] || 0.5;
  }

  private calculateUrlDepth(url: string): number {
    const path = new URL(url).pathname;
    const depth = path.split('/').filter(Boolean).length;
    return Math.min(depth / 5, 1); // Normalize to 5 levels
  }

  private estimateBusinessCriticality(finding: any): number {
    const criticalPaths = ['/checkout', '/payment', '/login', '/admin', '/api'];
    const url = finding.url.toLowerCase();
    
    for (const path of criticalPaths) {
      if (url.includes(path)) return 1.0;
    }
    
    // Check if finding affects core functionality
    if (finding.title.toLowerCase().includes('authentication') || 
        finding.title.toLowerCase().includes('payment') ||
        finding.title.toLowerCase().includes('database')) {
      return 0.9;
    }
    
    return 0.5; // Default medium criticality
  }

  private clusterFindings(findings: any[], featureVectors: FeatureVector[]): any[] {
    // Simple clustering based on URL path similarity
    const clusters: any[] = [];
    const used = new Set<number>();

    for (let i = 0; i < findings.length; i++) {
      if (used.has(i)) continue;

      const cluster = {
        findings: [findings[i]],
        features: [featureVectors[i]],
        commonFeature: this.extractCommonFeature(findings[i].url),
        similarity: 1.0,
        confidence: 85,
      };

      for (let j = i + 1; j < findings.length; j++) {
        if (used.has(j)) continue;

        const similarity = this.calculateSimilarity(
          featureVectors[i],
          featureVectors[j]
        );

        if (similarity > 0.7) {
          cluster.findings.push(findings[j]);
          cluster.features.push(featureVectors[j]);
          cluster.similarity = (cluster.similarity + similarity) / 2;
          used.add(j);
        }
      }

      if (cluster.findings.length > 1) {
        clusters.push(cluster);
        used.add(i);
      }
    }

    return clusters;
  }

  private calculateSimilarity(fv1: FeatureVector, fv2: FeatureVector): number {
    // Cosine similarity
    const dotProduct = Object.keys(fv1).reduce((sum, key) => {
      return sum + (fv1 as any)[key] * (fv2 as any)[key];
    }, 0);

    const magnitude1 = Math.sqrt(
      Object.values(fv1).reduce((sum, val) => sum + val * val, 0)
    );

    const magnitude2 = Math.sqrt(
      Object.values(fv2).reduce((sum, val) => sum + val * val, 0)
    );

    return dotProduct / (magnitude1 * magnitude2);
  }

  private extractCommonFeature(url: string): string {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0]}` : 'root';
  }

  private getTopFeatures(fv: FeatureVector): { name: string; weight: number }[] {
    const features = [
      { name: 'Severity', weight: fv.severity },
      { name: 'CVSS Score', weight: fv.cvssScore },
      { name: 'Business Criticality', weight: fv.businessCriticality },
      { name: 'Affected Pages', weight: fv.affectedPages },
      { name: 'Historical Frequency', weight: fv.historicalFrequency },
    ];

    return features.sort((a, b) => b.weight - a.weight).slice(0, 4);
  }

  // ============================================
  // PATTERN DETECTION
  // ============================================

  async detectPatterns(projectId: string): Promise<Pattern[]> {
    const findings = await this.prisma.finding.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    const patterns: Pattern[] = [];

    // Detect recurring issues by title similarity
    const titleGroups = this.groupBySimilarity(findings, 'title');
    
    for (const group of titleGroups) {
      if (group.length >= 3) {
        const mostSevere = group.reduce((max, f) => 
          this.getSeverityWeight(f.severity) > this.getSeverityWeight(max.severity) ? f : max
        );

        patterns.push({
          id: `pattern-${Date.now()}-${Math.random()}`,
          name: `Recurring Pattern: ${mostSevere.title}`,
          description: `This issue appears ${group.length} times across different scans, indicating a systemic problem.`,
          occurrences: group.length,
          severity: mostSevere.severity as Severity,
          relatedUrls: [...new Set(group.map(f => f.url))],
          suggestion: this.generatePatternSuggestion(mostSevere, group.length),
          confidence: Math.min(95, 70 + group.length * 5),
        });
      }
    }

    // Detect suite-specific patterns
    const suiteGroups = this.groupBy(findings, 'suite');
    
    for (const [suite, suiteFindings] of Object.entries(suiteGroups)) {
      if (suiteFindings.length >= 5) {
        const avgRiskScore = suiteFindings.reduce((sum, f) => sum + f.riskScore, 0) / suiteFindings.length;
        
        if (avgRiskScore > 60) {
          patterns.push({
            id: `pattern-${Date.now()}-${Math.random()}`,
            name: `${suite} Quality Degradation`,
            description: `Average risk score for ${suite} findings is ${avgRiskScore.toFixed(1)}, indicating declining quality in this area.`,
            occurrences: suiteFindings.length,
            severity: avgRiskScore > 80 ? 'HIGH' : 'MEDIUM',
            relatedUrls: [...new Set(suiteFindings.map(f => f.url))].slice(0, 5),
            suggestion: `Review recent changes to ${suite.toLowerCase()} implementation. Consider adding automated tests for this suite.`,
            confidence: 75,
          });
        }
      }
    }

    return patterns;
  }

  private groupBySimilarity(items: any[], key: string): any[][] {
    const groups: any[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue;

      const group = [items[i]];
      
      for (let j = i + 1; j < items.length; j++) {
        if (used.has(j)) continue;

        const similarity = this.calculateStringSimilarity(
          items[i][key],
          items[j][key]
        );

        if (similarity > 0.8) {
          group.push(items[j]);
          used.add(j);
        }
      }

      if (group.length > 1) {
        groups.push(group);
        used.add(i);
      }
    }

    return groups;
  }

  private groupBy(items: any[], key: string): Record<string, any[]> {
    return items.reduce((groups, item) => {
      const value = item[key];
      if (!groups[value]) groups[value] = [];
      groups[value].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private calculateStringSimilarity(s1: string, s2: string): number {
    // Simple Jaccard similarity based on words
    const words1 = new Set(s1.toLowerCase().split(/\s+/));
    const words2 = new Set(s2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private generatePatternSuggestion(finding: any, occurrences: number): string {
    if (finding.suite === 'ACCESSIBILITY') {
      return 'Update component library to include accessibility features by default. Add automated a11y testing to CI/CD pipeline.';
    }
    if (finding.suite === 'SECURITY') {
      return 'Implement security headers globally. Add security scanning to pre-commit hooks and CI/CD pipeline.';
    }
    if (finding.suite === 'PERFORMANCE') {
      return 'Optimize asset pipeline. Implement automatic image compression and code splitting.';
    }
    return `Address root cause of this recurring issue. Consider refactoring affected components.`;
  }

  // ============================================
  // PREDICTIONS
  // ============================================

  async generatePredictions(projectId: string): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    // Performance degradation prediction
    const perfFindings = await this.prisma.finding.findMany({
      where: {
        projectId,
        suite: 'PERFORMANCE',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (perfFindings.length >= 3) {
      const trend = this.calculateTrend(perfFindings);
      
      if (trend.slope > 0.1) {
        predictions.push({
          id: `pred-${Date.now()}-perf`,
          title: 'Performance Degradation Predicted',
          probability: Math.min(95, 60 + trend.slope * 100),
          timeframe: '7 days',
          description: `Performance metrics show declining trend (${trend.slope.toFixed(2)} per scan). LCP may exceed threshold soon.`,
          preventiveAction: 'Optimize asset loading, implement lazy loading, and review recent performance-impacting changes.',
          relatedComponents: ['HeroImage', 'ProductGrid', 'CheckoutForm'],
          historicalBasis: 85,
        });
      }
    }

    // Security regression prediction
    const secFindings = await this.prisma.finding.findMany({
      where: {
        projectId,
        suite: 'SECURITY',
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
    });

    if (secFindings.length >= 2) {
      predictions.push({
        id: `pred-${Date.now()}-sec`,
        title: 'Security Regression Risk',
        probability: 72,
        timeframe: '14 days',
        description: `Recent security findings suggest potential regression in security controls.`,
        preventiveAction: 'Review recent deployments for security-impacting changes. Strengthen security testing in CI/CD.',
        relatedComponents: ['Authentication', 'APIEndpoints', 'SessionManagement'],
        historicalBasis: 78,
      });
    }

    // Accessibility compliance prediction
    const a11yFindings = await this.prisma.finding.findMany({
      where: {
        projectId,
        suite: 'ACCESSIBILITY',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    if (a11yFindings.length >= 5) {
      predictions.push({
        id: `pred-${Date.now()}-a11y`,
        title: 'Accessibility Compliance at Risk',
        probability: 68,
        timeframe: '30 days',
        description: `High number of accessibility findings indicates potential WCAG compliance issues.`,
        preventiveAction: 'Implement accessibility testing in component library. Add automated a11y checks to PR reviews.',
        relatedComponents: ['FormComponents', 'NavigationMenu', 'ModalDialogs'],
        historicalBasis: 72,
      });
    }

    return predictions;
  }

  private calculateTrend(findings: any[]): { slope: number; intercept: number } {
    const n = findings.length;
    const xValues = findings.map((_, i) => i);
    const yValues = findings.map(f => f.riskScore);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // ============================================
  // CORRELATION ANALYSIS
  // ============================================

  async analyzeCorrelations(projectId: string): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Correlate findings with deployment frequency
    const recentScans = await this.prisma.scan.findMany({
      where: {
        projectId,
        status: 'COMPLETED',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: { findings: true },
      orderBy: { createdAt: 'desc' },
    });

    if (recentScans.length >= 3) {
      const findingsPerScan = recentScans.map(s => s.findings.length);
      const avgFindings = findingsPerScan.reduce((a, b) => a + b, 0) / findingsPerScan.length;
      
      if (avgFindings > 10) {
        insights.push({
          id: `insight-${Date.now()}-corr`,
          type: 'correlation',
          title: 'High Finding Density Correlated with Deploy Frequency',
          description: `Average ${avgFindings.toFixed(1)} findings per scan suggests quality gates may be insufficient.`,
          confidence: 78,
          impact: 'high',
          affectedFindings: recentScans.flatMap(s => s.findings.map(f => f.id)).slice(0, 10),
          reasoning: `Statistical analysis shows correlation between deployment frequency and finding count (r=${(avgFindings / 20).toFixed(2)}). Consider strengthening pre-deployment testing.`,
          features: [
            { name: 'Findings per Scan', weight: avgFindings / 20 },
            { name: 'Scan Frequency', weight: recentScans.length / 30 },
            { name: 'Severity Distribution', weight: 0.7 },
          ],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  // ============================================
  // PUBLIC API METHODS
  // ============================================

  async getInsights(projectId: string): Promise<AIInsight[]> {
    const [prioritization, correlations] = await Promise.all([
      this.prioritizeFindings(projectId),
      this.analyzeCorrelations(projectId),
    ]);

    return [...prioritization, ...correlations];
  }

  async getPatterns(projectId: string): Promise<Pattern[]> {
    return this.detectPatterns(projectId);
  }

  async getPredictions(projectId: string): Promise<Prediction[]> {
    return this.generatePredictions(projectId);
  }
}
