import { PerformanceMonitor } from './performance-monitor';
import { EventBus } from '../events/event-bus';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    monitor = new PerformanceMonitor(eventBus);
  });

  describe('Timer Operations', () => {
    it('should measure operation duration', () => {
      // Start a timer
      monitor.startTimer('test.operation');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 50) {
        // Busy wait for 50ms
      }

      // End timer and get duration
      const duration = monitor.endTimer('test.operation');
      expect(duration).toBeGreaterThanOrEqual(50);
    });

    it('should throw error when ending non-existent timer', () => {
      expect(() => monitor.endTimer('non.existent')).toThrow();
    });

    it('should handle multiple concurrent timers', () => {
      monitor.startTimer('op1');
      monitor.startTimer('op2');
      
      const duration1 = monitor.endTimer('op1');
      const duration2 = monitor.endTimer('op2');
      
      expect(duration1).toBeGreaterThanOrEqual(0);
      expect(duration2).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metric Recording', () => {
    it('should record and retrieve metrics', () => {
      const metric = {
        name: 'test.metric',
        value: 100,
        unit: 'ms' as const,
        timestamp: Date.now(),
        tags: { type: 'test' }
      };

      monitor.recordMetric(metric);
      const metrics = monitor.getMetrics('test.metric');
      
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(metric);
    });

    it('should calculate average duration correctly', () => {
      monitor.recordMetric({
        name: 'test.avg',
        value: 100,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {}
      });

      monitor.recordMetric({
        name: 'test.avg',
        value: 200,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {}
      });

      const avg = monitor.getAverageDuration('test.avg');
      expect(avg).toBe(150);
    });
  });

  describe('Performance Reports', () => {
    it('should generate correct performance report', () => {
      const startTime = Date.now();
      
      // Record some test metrics
      monitor.recordMetric({
        name: 'test.operation',
        value: 100,
        unit: 'ms',
        timestamp: startTime + 100,
        tags: {}
      });

      monitor.recordMetric({
        name: 'test.operation',
        value: 200,
        unit: 'ms',
        timestamp: startTime + 200,
        tags: {}
      });

      monitor.recordMetric({
        name: 'memory.usage',
        value: 50,
        unit: 'bytes',
        timestamp: startTime + 150,
        tags: { type: 'heap' }
      });

      const endTime = startTime + 1000;
      const report = monitor.getPerformanceReport(startTime, endTime);

      expect(report.averages['test.operation']).toBe(150);
      expect(report.peaks['test.operation']).toBe(200);
      expect(report.memoryUsage.average).toBe(50);
    });
  });

  describe('Event Integration', () => {
    it('should emit metric recorded events', (done) => {
      const testMetric = {
        name: 'test.event',
        value: 100,
        unit: 'ms' as const,
        timestamp: Date.now(),
        tags: {}
      };

      eventBus.subscribe('metric:recorded', (metric: any) => {
        expect(metric).toEqual(testMetric);
        done();
      });

      monitor.recordMetric(testMetric);
    });

    it('should emit performance warnings when thresholds exceeded', (done) => {
      eventBus.subscribe('performance:warning', (warning: any) => {
        expect(warning.operation).toBe('combat.round');
        expect(warning.duration).toBeGreaterThan(16); // COMBAT_ROUND_MS threshold
        done();
      });

      monitor.startTimer('combat.round');
      
      // Simulate long operation
      const start = Date.now();
      while (Date.now() - start < 20) {
        // Busy wait to exceed threshold
      }

      monitor.endTimer('combat.round');
    });
  });

  describe('Decorator Usage', () => {
    class TestClass {
      constructor(private performanceMonitor: PerformanceMonitor) {}

      @PerformanceMonitor.monitor('test.method')
      testMethod() {
        let count = 0;
        while (count < 1000000) {
          count++;
        }

        return 'result';
      }
    }

    it('should monitor decorated methods', async () => {
      const instance = new TestClass(monitor);
      const result = await instance.testMethod();

      expect(result).toBe('result');
      const metrics = monitor.getMetrics('test.method');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBeGreaterThanOrEqual(50);
    });
  });
}); 