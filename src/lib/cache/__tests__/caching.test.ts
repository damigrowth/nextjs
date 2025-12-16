/**
 * Cache System Unit Tests
 *
 * Tests for cache configuration and key generation
 */

import { describe, it, expect } from 'vitest';
import { buildCacheKey, ServiceCacheKeys, ProfileCacheKeys, HomeCacheKeys, SearchCacheKeys, DashboardCacheKeys } from '../keys';
import { getCacheTTL, shouldCache, getAllCacheTTLs, CACHE_TTL } from '../config';

describe('buildCacheKey', () => {
  it('should generate consistent keys regardless of parameter order', () => {
    const key1 = buildCacheKey('services', { category: 'web-dev', featured: true, status: 'published' });
    const key2 = buildCacheKey('services', { featured: true, status: 'published', category: 'web-dev' });
    const key3 = buildCacheKey('services', { status: 'published', category: 'web-dev', featured: true });

    expect(key1).toEqual(key2);
    expect(key2).toEqual(key3);
  });

  it('should filter out null values', () => {
    const key = buildCacheKey('services', { category: 'web-dev', subcategory: null, featured: true });

    expect(key).toEqual(['services', 'category:web-dev', 'featured']);
    expect(key).not.toContain('subcategory');
  });

  it('should filter out undefined values', () => {
    const key = buildCacheKey('services', { category: 'web-dev', subcategory: undefined, featured: true });

    expect(key).toEqual(['services', 'category:web-dev', 'featured']);
    expect(key).not.toContain('subcategory');
  });

  it('should filter out false boolean values', () => {
    const key = buildCacheKey('services', { category: 'web-dev', featured: false, verified: true });

    expect(key).toEqual(['services', 'category:web-dev', 'verified']);
    expect(key).not.toContain('featured');
  });

  it('should handle true boolean values as flags (no value)', () => {
    const key = buildCacheKey('services', { category: 'web-dev', featured: true });

    expect(key).toEqual(['services', 'category:web-dev', 'featured']);
    expect(key).toContain('featured');
    expect(key).not.toContain('featured:true');
  });

  it('should handle string values with key:value format', () => {
    const key = buildCacheKey('services', { category: 'web-dev', status: 'published' });

    expect(key).toEqual(['services', 'category:web-dev', 'status:published']);
  });

  it('should handle number values with key:value format', () => {
    const key = buildCacheKey('service', { id: 123 });

    expect(key).toEqual(['service', 'id:123']);
  });

  it('should handle empty params', () => {
    const key = buildCacheKey('services', {});

    expect(key).toEqual(['services']);
  });

  it('should handle no params', () => {
    const key = buildCacheKey('services');

    expect(key).toEqual(['services']);
  });

  it('should alphabetically sort keys', () => {
    const key = buildCacheKey('services', {
      zebra: 'z',
      apple: 'a',
      middle: 'm',
      banana: 'b'
    });

    // Should be sorted: apple, banana, middle, zebra
    expect(key).toEqual([
      'services',
      'apple:a',
      'banana:b',
      'middle:m',
      'zebra:z'
    ]);
  });
});

describe('ServiceCacheKeys', () => {
  it('should generate archive key with multiple filters', () => {
    const key = ServiceCacheKeys.archive({
      category: 'web-dev',
      subcategory: 'frontend',
      featured: true,
      status: 'published'
    });

    expect(key).toContain('services');
    expect(key).toContain('category:web-dev');
    expect(key).toContain('subcategory:frontend');
    expect(key).toContain('featured');
    expect(key).toContain('status:published');
  });

  it('should generate detail key', () => {
    const key = ServiceCacheKeys.detail('123');

    expect(key).toEqual(['service', 'id:123']);
  });

  it('should generate detailWithReviews key', () => {
    const key = ServiceCacheKeys.detailWithReviews('123');

    expect(key).toEqual(['service', 'id:123', 'with:reviews']);
  });

  it('should generate byProfile key', () => {
    const key = ServiceCacheKeys.byProfile('456');

    expect(key).toEqual(['services', 'pid:456']);
  });

  it('should generate featured key', () => {
    const key = ServiceCacheKeys.featured();

    expect(key).toEqual(['services', 'featured']);
  });

  it('should generate counts key', () => {
    const key = ServiceCacheKeys.counts({ category: 'web-dev', subcategory: 'frontend' });

    expect(key).toContain('services:counts');
    expect(key).toContain('category:web-dev');
    expect(key).toContain('subcategory:frontend');
  });
});

describe('ProfileCacheKeys', () => {
  it('should generate archive key with filters', () => {
    const key = ProfileCacheKeys.archive({
      category: 'web-dev',
      verified: true,
      featured: true
    });

    expect(key).toContain('profiles');
    expect(key).toContain('category:web-dev');
    expect(key).toContain('verified');
    expect(key).toContain('featured');
  });

  it('should generate detail key', () => {
    const key = ProfileCacheKeys.detail('123');

    expect(key).toEqual(['profile', 'id:123']);
  });

  it('should generate detailFull key', () => {
    const key = ProfileCacheKeys.detailFull('123');

    expect(key).toEqual(['profile', 'id:123', 'with:services,reviews']);
  });

  it('should generate featured key', () => {
    const key = ProfileCacheKeys.featured();

    expect(key).toEqual(['profiles', 'featured']);
  });
});

describe('HomeCacheKeys', () => {
  it('should generate data key', () => {
    const key = HomeCacheKeys.data();

    expect(key).toEqual(['home', 'data']);
  });

  it('should generate featured key', () => {
    const key = HomeCacheKeys.featured();

    expect(key).toEqual(['home', 'featured']);
  });
});

describe('SearchCacheKeys', () => {
  it('should generate results key with query', () => {
    const key = SearchCacheKeys.results('web development');

    expect(key).toContain('search');
    expect(key).toContain('query:web development');
  });

  it('should generate results key with query and type', () => {
    const key = SearchCacheKeys.results('web development', 'services');

    expect(key).toContain('search');
    expect(key).toContain('query:web development');
    expect(key).toContain('type:services');
  });
});

describe('DashboardCacheKeys', () => {
  it('should generate user key', () => {
    const key = DashboardCacheKeys.user('123');

    expect(key).toContain('dashboard');
    expect(key).toContain('user:123');
  });

  it('should generate messages key', () => {
    const key = DashboardCacheKeys.messages('123');

    expect(key).toContain('dashboard');
    expect(key).toContain('user:123');
    expect(key).toContain('section:messages');
  });

  it('should generate saved key', () => {
    const key = DashboardCacheKeys.saved('123');

    expect(key).toContain('dashboard');
    expect(key).toContain('user:123');
    expect(key).toContain('section:saved');
  });
});

describe('getCacheTTL', () => {
  // Save original NODE_ENV
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('should return 0 in test environment', () => {
    process.env.NODE_ENV = 'test';
    const ttl = getCacheTTL('HOME');
    expect(ttl).toBe(0);
  });

  it('should return shortened TTL in development (minimum 30s)', () => {
    process.env.NODE_ENV = 'development';

    // HOME: 86400s / 10 = 8640s in dev
    const homeTTL = getCacheTTL('HOME');
    expect(homeTTL).toBe(8640);

    // DASHBOARD: 300s / 10 = 30s (minimum)
    const dashboardTTL = getCacheTTL('DASHBOARD');
    expect(dashboardTTL).toBe(30);
  });

  it('should return full TTL in production', () => {
    process.env.NODE_ENV = 'production';

    const ttl = getCacheTTL('HOME');
    expect(ttl).toBe(CACHE_TTL.HOME);
  });

  it('should enforce minimum 30s in development', () => {
    process.env.NODE_ENV = 'development';

    // Very short TTL should still be 30s minimum
    const ttl = getCacheTTL('DASHBOARD'); // 300s / 10 = 30s
    expect(ttl).toBeGreaterThanOrEqual(30);
  });
});

describe('shouldCache', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return false in test environment', () => {
    process.env.NODE_ENV = 'test';
    expect(shouldCache()).toBe(false);
  });

  it('should return true in development environment', () => {
    process.env.NODE_ENV = 'development';
    expect(shouldCache()).toBe(true);
  });

  it('should return true in production environment', () => {
    process.env.NODE_ENV = 'production';
    expect(shouldCache()).toBe(true);
  });
});

describe('getAllCacheTTLs', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return all TTL values for current environment', () => {
    process.env.NODE_ENV = 'production';
    const ttls = getAllCacheTTLs();

    expect(ttls).toHaveProperty('HOME');
    expect(ttls).toHaveProperty('SERVICE_ARCHIVE');
    expect(ttls).toHaveProperty('PROFILE_ARCHIVE');
    expect(ttls).toHaveProperty('SEARCH');
    expect(ttls).toHaveProperty('DASHBOARD');

    expect(ttls.HOME).toBe(CACHE_TTL.HOME);
  });

  it('should return adjusted TTLs in development', () => {
    process.env.NODE_ENV = 'development';
    const ttls = getAllCacheTTLs();

    expect(ttls.HOME).toBe(8640); // 86400 / 10
    expect(ttls.DASHBOARD).toBe(30); // 300 / 10 = 30 (minimum)
  });

  it('should return 0 for all TTLs in test environment', () => {
    process.env.NODE_ENV = 'test';
    const ttls = getAllCacheTTLs();

    Object.values(ttls).forEach(ttl => {
      expect(ttl).toBe(0);
    });
  });
});

describe('CACHE_TTL constants', () => {
  it('should have all expected cache keys', () => {
    expect(CACHE_TTL).toHaveProperty('TAXONOMIES');
    expect(CACHE_TTL).toHaveProperty('CONFIG');
    expect(CACHE_TTL).toHaveProperty('HOME');
    expect(CACHE_TTL).toHaveProperty('DIRECTORY');
    expect(CACHE_TTL).toHaveProperty('SERVICE_ARCHIVE');
    expect(CACHE_TTL).toHaveProperty('PROFILE_ARCHIVE');
    expect(CACHE_TTL).toHaveProperty('CATEGORIES');
    expect(CACHE_TTL).toHaveProperty('SERVICE_PAGE');
    expect(CACHE_TTL).toHaveProperty('PROFILE_PAGE');
    expect(CACHE_TTL).toHaveProperty('SEARCH');
    expect(CACHE_TTL).toHaveProperty('DASHBOARD');
    expect(CACHE_TTL).toHaveProperty('COUNTS');
    expect(CACHE_TTL).toHaveProperty('STATS');
  });

  it('should have reasonable TTL values', () => {
    // Long cache for static data
    expect(CACHE_TTL.TAXONOMIES).toBe(86400); // 24h
    expect(CACHE_TTL.HOME).toBe(86400); // 24h

    // Medium cache for archives
    expect(CACHE_TTL.SERVICE_ARCHIVE).toBe(3600); // 1h
    expect(CACHE_TTL.PROFILE_ARCHIVE).toBe(3600); // 1h

    // Short cache for entity pages
    expect(CACHE_TTL.SERVICE_PAGE).toBe(1800); // 30m
    expect(CACHE_TTL.PROFILE_PAGE).toBe(1800); // 30m

    // Very short cache for dynamic data
    expect(CACHE_TTL.SEARCH).toBe(900); // 15m
    expect(CACHE_TTL.DASHBOARD).toBe(300); // 5m
  });
});
