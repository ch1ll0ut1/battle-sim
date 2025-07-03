import { EventBus } from '../events/event-bus';

// Extend Performance interface to include memory property
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'count' | 'bytes' | 'percentage';
  timestamp: number;
  tags: Record<string, string>;
}

export interface TimingMetric {
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  tags: Record<string, string>;
}

/**
 * Performance monitor for tracking various metrics in the battle simulation
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers = new Map<string, number>();
  private readonly eventBus: EventBus;
  
  // Thresholds for performance warnings
  private static readonly THRESHOLDS = {
    COMBAT_ROUND_MS: 16, // Target 60fps
    PATHFINDING_MS: 5,
    ACTION_RESOLUTION_MS: 3,
    INJURY_PROCESSING_MS: 2,
    MEMORY_MB: 100
  };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string, tags: Record<string, string> = {}): void {
    const key = this.getTimerKey(name, tags);
    this.timers.set(key, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  endTimer(name: string, tags: Record<string, string> = {}): number {
    const key = this.getTimerKey(name, tags);
    const startTime = this.timers.get(key);
    
    if (!startTime) {
      throw new Error(`No timer found for: ${name}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags
    });

    this.timers.delete(key);
    this.checkThreshold(name, duration);

    return duration;
  }

  /**
   * Record a single metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.eventBus.emit('metric:recorded', metric);
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    return total / metrics.length;
  }

  /**
   * Monitor memory usage
   */
  monitorMemory(): void {
    if (performance.memory) {
      const memory = performance.memory;
      this.recordMetric({
        name: 'memory.usage',
        value: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
        unit: 'bytes',
        timestamp: Date.now(),
        tags: { type: 'heap' }
      });
    }
  }

  /**
   * Create a decorator for monitoring method performance
   */
  static monitor(name: string, tags: Record<string, string> = {}) {
    return function (
      originalMethod: Function,
      context: ClassMethodDecoratorContext
    ) {
      return function (this: any, ...args: any[]) {
        const monitor = this.performanceMonitor as PerformanceMonitor;
        if (!monitor) {
          throw new Error('PerformanceMonitor not found in instance');
        }

        monitor.startTimer(name, tags);
        const result = originalMethod.apply(this, args);
        monitor.endTimer(name, tags);

        return result;
      };
    };
  }

  private setupEventListeners(): void {
    // Monitor combat rounds
    this.eventBus.subscribe('combat:roundStart', () => {
      this.startTimer('combat.round');
    });

    this.eventBus.subscribe('combat:roundEnd', () => {
      this.endTimer('combat.round');
    });

    // Monitor action resolution
    this.eventBus.subscribe('action:start', (action: any) => {
      this.startTimer('action.resolution', { type: action.type });
    });

    this.eventBus.subscribe('action:end', (action: any) => {
      this.endTimer('action.resolution', { type: action.type });
    });

    // Monitor injury processing
    this.eventBus.subscribe('injury:start', () => {
      this.startTimer('injury.processing');
    });

    this.eventBus.subscribe('injury:end', () => {
      this.endTimer('injury.processing');
    });

    // Setup periodic memory monitoring
    setInterval(() => this.monitorMemory(), 1000);
  }

  private getTimerKey(name: string, tags: Record<string, string>): string {
    return `${name}:${JSON.stringify(tags)}`;
  }

  private checkThreshold(name: string, duration: number): void {
    const baseOperation = name.split('.')[0];
    const threshold = (PerformanceMonitor.THRESHOLDS as any)[`${baseOperation.toUpperCase()}_MS`];

    if (threshold && duration > threshold) {
      this.eventBus.emit('performance:warning', {
        operation: name,
        duration,
        threshold,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get performance report for a time period
   */
  getPerformanceReport(startTime: number, endTime: number): PerformanceReport {
    const periodMetrics = this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );

    const report: PerformanceReport = {
      period: {
        start: startTime,
        end: endTime
      },
      averages: {},
      warnings: [],
      peaks: {},
      memoryUsage: {
        average: 0,
        peak: 0
      }
    };

    // Calculate averages and peaks
    const metricsByName = new Map<string, PerformanceMetric[]>();
    periodMetrics.forEach(metric => {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric);
    });

    metricsByName.forEach((metrics, name) => {
      const values = metrics.map(m => m.value);
      report.averages[name] = values.reduce((a, b) => a + b, 0) / values.length;
      report.peaks[name] = Math.max(...values);

      if (name === 'memory.usage') {
        report.memoryUsage.average = report.averages[name];
        report.memoryUsage.peak = report.peaks[name];
      }
    });

    return report;
  }
}

interface PerformanceReport {
  period: {
    start: number;
    end: number;
  };
  averages: Record<string, number>;
  peaks: Record<string, number>;
  warnings: Array<{
    operation: string;
    duration: number;
    threshold: number;
    timestamp: number;
  }>;
  memoryUsage: {
    average: number;
    peak: number;
  };
} 