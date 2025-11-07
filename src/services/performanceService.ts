// Disabled for production demo
export class PerformanceService {
  static getInstance() {
    return {
      startTracking: () => {},
      stopTracking: () => {},
      getMetrics: () => ({}),
    };
  }
}
export const performanceService = PerformanceService.getInstance();
