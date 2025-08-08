/**
 * Performance monitoring utilities for PlacedIn
 */
import React from 'react';

// TypeScript interfaces for memory monitoring
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: MemoryInfo;
}

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * End timing and log results
   */
  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Performance logging disabled for production security

    this.timers.delete(label);
    return duration;
  }

  /**
   * Measure API call performance
   */
  static async measureApiCall<T>(
    label: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await apiCall();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      console.error(`❌ API call ${label} failed:`, error);
      throw error;
    }
  }

  /**
   * Measure component render performance
   */
  static measureRender(componentName: string, renderFn: () => void): void {
    this.startTimer(`${componentName} render`);
    renderFn();
    this.endTimer(`${componentName} render`);
  }

  /**
   * Get memory usage information
   */
  static getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      return (performance as PerformanceWithMemory).memory;
    }
    return null;
  }

  /**
   * Log memory usage
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static logMemoryUsage(_label: string): void {
    // Memory logging disabled for production security
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy loading utility
 */
export function createLazyComponent<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    PerformanceMonitor.startTimer('Component lazy load');
    try {
      const module = await importFn();
      PerformanceMonitor.endTimer('Component lazy load');
      return module;
    } catch (error) {
      PerformanceMonitor.endTimer('Component lazy load');
      throw error;
    }
  });
}
