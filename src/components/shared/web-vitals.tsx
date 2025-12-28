'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Reporting Component
 * Monitors and reports Core Web Vitals metrics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        good: '\x1b[32m',
        needsImprovement: '\x1b[33m',
        poor: '\x1b[31m',
        reset: '\x1b[0m',
      };

      // Determine rating based on metric name and value
      let rating = 'good';
      const thresholds: Record<string, { good: number; poor: number }> = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        INP: { good: 200, poor: 500 },
        CLS: { good: 0.1, poor: 0.25 },
        TTFB: { good: 800, poor: 1800 },
        FCP: { good: 1800, poor: 3000 },
      };

      const threshold = thresholds[metric.name];
      if (threshold) {
        if (metric.value > threshold.poor) rating = 'poor';
        else if (metric.value > threshold.good) rating = 'needsImprovement';
      }

      const color = colors[rating as keyof typeof colors] || colors.good;

      console.log(
        `${color}[Web Vital] ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}${colors.reset}`,
        {
          value: metric.value,
          rating,
          id: metric.id,
        }
      );
    }

    // Send to Google Analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Send to Google Analytics if available
      if ('gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        });
      }
    }
  });

  return null;
}
