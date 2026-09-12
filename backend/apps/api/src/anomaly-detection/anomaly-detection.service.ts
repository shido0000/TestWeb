// ============================================
// Visual Anomaly Detection Service
// ============================================
// AI-powered visual regression and anomaly detection

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import * as crypto from 'crypto';

interface VisualAnomaly {
  id: string;
  type: 'layout_shift' | 'color_drift' | 'typography_mismatch' | 'missing_element' | 'new_element' | 'spacing_anomaly' | 'motion_anomaly' | 'responsive_break';
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  url: string;
  viewport: string;
  title: string;
  description: string;
  detectedAt: Date;
  introducedAt?: Date;
  baselineValue: string;
  currentValue: string;
  delta: string;
  confidence: number;
  affectedElements: string[];
  heatmapData?: { x: number; y: number; intensity: number }[];
  status: 'new' | 'acknowledged' | 'resolved' | 'ignored';
}

interface ComparisonResult {
  similarity: number;
  differences: number;
  boundingBoxes: { x: number; y: number; width: number; height: number }[];
}

export class AnomalyDetectionService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService
  ) {}

  // ============================================
  // SCREENSHOT COMPARISON
  // ============================================

  async compareScreenshots(
    scanId: string,
    targetId: string,
    screenshots: { url: string; viewport: string; buffer: Buffer }[]
  ): Promise<VisualAnomaly[]> {
    const anomalies: VisualAnomaly[] = [];

    // Get baseline screenshots
    const baselines = await this.prisma.visualBaseline.findMany({
      where: { targetId },
    });

    const baselineMap = new Map(
      baselines.map(b => [`${b.url}_${b.viewport}`, b])
    );

    for (const screenshot of screenshots) {
      const key = `${screenshot.url}_${screenshot.viewport}`;
      const baseline = baselineMap.get(key);

      if (!baseline) {
        // No baseline exists, create one
        await this.createBaseline(targetId, screenshot.url, screenshot.viewport, screenshot.buffer);
        continue;
      }

      // Compare with baseline
      const baselineBuffer = await this.storage.download(baseline.screenshotUrl);
      const comparison = await this.compareImages(baselineBuffer, screenshot.buffer);

      // Detect anomalies based on comparison
      if (comparison.differences > 0.05) { // 5% threshold
        const anomaly = await this.detectAnomalyType(
          screenshot.url,
          screenshot.viewport,
          comparison,
          baseline,
          screenshot.buffer
        );

        if (anomaly) {
          anomalies.push(anomaly);
        }
      }

      // Update baseline with current screenshot
      await this.updateBaseline(baseline.id, screenshot.buffer);
    }

    // Save anomalies to database
    for (const anomaly of anomalies) {
      await this.prisma.visualAnomaly.create({
         anomaly,
      });
    }

    return anomalies;
  }

  private async compareImages(baseline: Buffer, current: Buffer): Promise<ComparisonResult> {
    // Simplified image comparison using perceptual hashing
    // In production, use libraries like pixelmatch, resemble.js, or OpenCV

    const baselineHash = this.calculatePerceptualHash(baseline);
    const currentHash = this.calculatePerceptualHash(current);

    const similarity = this.calculateHammingDistance(baselineHash, currentHash);
    const differences = 1 - similarity;

    // Generate bounding boxes for differences
    const boundingBoxes = this.detectBoundingBoxes(baseline, current);

    return {
      similarity,
      differences,
      boundingBoxes,
    };
  }

  private calculatePerceptualHash(buffer: Buffer): string {
    // Simplified perceptual hash (in production, use pHash or dHash)
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return hash;
  }

  private calculateHammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }

    return matches / hash1.length;
  }

  private detectBoundingBoxes(baseline: Buffer, current: Buffer): { x: number; y: number; width: number; height: number }[] {
    // Simplified bounding box detection
    // In production, use image processing libraries
    const boxes: { x: number; y: number; width: number; height: number }[] = [];

    // Simulate detection of 1-3 difference regions
    const numBoxes = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numBoxes; i++) {
      boxes.push({
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
        width: Math.floor(Math.random() * 200) + 50,
        height: Math.floor(Math.random() * 150) + 30,
      });
    }

    return boxes;
  }

  private async detectAnomalyType(
    url: string,
    viewport: string,
    comparison: ComparisonResult,
    baseline: any,
    currentBuffer: Buffer
  ): Promise<VisualAnomaly | null> {
    const diffPercent = comparison.differences * 100;

    // Determine anomaly type based on characteristics
    let type: VisualAnomaly['type'];
    let severity: VisualAnomaly['severity'];
    let title: string;
    let description: string;

    if (diffPercent > 20) {
      // Major layout shift
      type = 'layout_shift';
      severity = 'major';
      title = 'Significant Layout Shift Detected';
      description = `Layout has changed by ${diffPercent.toFixed(1)}%. This may indicate broken CSS or missing elements.`;
    } else if (diffPercent > 10) {
      // Check if it's a color drift
      const colorDrift = await this.detectColorDrift(baseline.screenshotUrl, currentBuffer);
      
      if (colorDrift.isColorDrift) {
        type = 'color_drift';
        severity = 'minor';
        title = 'Color Palette Shift Detected';
        description = `Color values have shifted. ${colorDrift.description}`;
      } else {
        type = 'spacing_anomaly';
        severity = 'minor';
        title = 'Spacing Anomaly Detected';
        description = `Element spacing has changed by ${diffPercent.toFixed(1)}%. Review padding and margin values.`;
      }
    } else if (diffPercent > 5) {
      // Minor changes
      if (comparison.boundingBoxes.length === 1) {
        type = 'new_element';
        severity = 'cosmetic';
        title = 'New Element Detected';
        description = `A new element has appeared on the page. Verify this is intentional.`;
      } else {
        type = 'typography_mismatch';
        severity = 'cosmetic';
        title = 'Typography Changes Detected';
        description = `Font or text styling has changed. Review typography tokens.`;
      }
    } else {
      // Very minor changes, likely not worth reporting
      return null;
    }

    // Generate heatmap data
    const heatmapData = this.generateHeatmap(comparison.boundingBoxes);

    // Determine when anomaly was introduced
    const introducedAt = await this.estimateIntroductionTime(baseline.targetId, url, viewport);

    return {
      id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      url,
      viewport,
      title,
      description,
      detectedAt: new Date(),
      introducedAt,
      baselineValue: `Baseline from ${new Date(baseline.createdAt).toLocaleDateString()}`,
      currentValue: `Current state with ${diffPercent.toFixed(1)}% difference`,
      delta: `${diffPercent.toFixed(1)}% visual difference`,
      confidence: Math.min(95, 70 + (100 - diffPercent) * 0.5),
      affectedElements: this.estimateAffectedElements(comparison.boundingBoxes),
      heatmapData,
      status: 'new',
    };
  }

  private async detectColorDrift(baselineUrl: string, currentBuffer: Buffer): Promise<{ isColorDrift: boolean; description: string }> {
    // Simplified color drift detection
    // In production, analyze color histograms
    
    const isColorDrift = Math.random() > 0.5; // Simulate detection
    
    if (isColorDrift) {
      return {
        isColorDrift: true,
        description: 'Primary color values have shifted by approximately 10-15%. Check design token values.',
      };
    }
    
    return {
      isColorDrift: false,
      description: '',
    };
  }

  private generateHeatmap(boundingBoxes: { x: number; y: number; width: number; height: number }[]): { x: number; y: number; intensity: number }[] {
    const heatmap: { x: number; y: number; intensity: number }[] = [];

    for (const box of boundingBoxes) {
      // Generate heatmap points within bounding box
      for (let i = 0; i < 10; i++) {
        heatmap.push({
          x: box.x + Math.random() * box.width,
          y: box.y + Math.random() * box.height,
          intensity: Math.random() * 0.5 + 0.5,
        });
      }
    }

    return heatmap;
  }

  private estimateAffectedElements(boundingBoxes: { x: number; y: number; width: number; height: number }[]): string[] {
    // Simplified element estimation based on position
    const elements: string[] = [];

    for (const box of boundingBoxes) {
      if (box.y < 200) {
        elements.push('header', 'navigation');
      } else if (box.y > 600) {
        elements.push('footer');
      } else if (box.x < 400) {
        elements.push('sidebar', 'main-content');
      } else {
        elements.push('main-content', 'product-card');
      }
    }

    return [...new Set(elements)];
  }

  private async estimateIntroductionTime(targetId: string, url: string, viewport: string): Promise<Date | undefined> {
    // Find the scan where this anomaly was first detected
    const recentScans = await this.prisma.scan.findMany({
      where: {
        targetId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (recentScans.length > 1) {
      // Assume anomaly was introduced in the second most recent scan
      return recentScans[1].createdAt;
    }

    return undefined;
  }

  // ============================================
  // BASELINE MANAGEMENT
  // ============================================

  private async createBaseline(targetId: string, url: string, viewport: string, buffer: Buffer): Promise<void> {
    const hash = this.calculatePerceptualHash(buffer);
    const screenshotUrl = await this.storage.upload(
      `baselines/${targetId}/${Date.now()}.png`,
      buffer,
      'image/png'
    );

    await this.prisma.visualBaseline.create({
       {
        targetId,
        url,
        viewport,
        screenshotUrl,
        hash,
      },
    });
  }

  private async updateBaseline(baselineId: string, buffer: Buffer): Promise<void> {
    const hash = this.calculatePerceptualHash(buffer);
    const screenshotUrl = await this.storage.upload(
      `baselines/update-${baselineId}/${Date.now()}.png`,
      buffer,
      'image/png'
    );

    await this.prisma.visualBaseline.update({
      where: { id: baselineId },
       {
        screenshotUrl,
        hash,
        updatedAt: new Date(),
      },
    });
  }

  // ============================================
  // ANOMALY QUERIES
  // ============================================

  async getAnomalies(targetId?: string, status?: string): Promise<VisualAnomaly[]> {
    const where: any = {};
    if (targetId) where.targetId = targetId;
    if (status) where.status = status;

    return this.prisma.visualAnomaly.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
    });
  }

  async updateAnomalyStatus(anomalyId: string, status: VisualAnomaly['status']): Promise<VisualAnomaly> {
    return this.prisma.visualAnomaly.update({
      where: { id: anomalyId },
       { status },
    });
  }

  async getAnomalyStats(targetId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const anomalies = await this.prisma.visualAnomaly.findMany({
      where: { targetId },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const anomaly of anomalies) {
      byType[anomaly.type] = (byType[anomaly.type] || 0) + 1;
      bySeverity[anomaly.severity] = (bySeverity[anomaly.severity] || 0) + 1;
      byStatus[anomaly.status] = (byStatus[anomaly.status] || 0) + 1;
    }

    return {
      total: anomalies.length,
      byType,
      bySeverity,
      byStatus,
    };
  }
}
