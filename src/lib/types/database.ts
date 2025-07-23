/**
 * DATABASE TYPE DEFINITIONS
 * Database and Prisma-related types
 */

// Re-export Prisma generated types
// Note: These will be available after Prisma generates the client
// export * from '@prisma/client';

// Database connection types
export interface DatabaseConfig {
  url: string;
  poolSize?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  maxLifetime?: number;
}

export interface DatabaseConnectionInfo {
  connected: boolean;
  poolSize: number;
  activeConnections: number;
  idleConnections: number;
  lastChecked: Date;
}

// Transaction types
export interface TransactionOptions {
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  maxWait?: number;
}

export type TransactionCallback<T> = (tx: any) => Promise<T>;

// Query types
export interface QueryOptions {
  select?: Record<string, any>;
  include?: Record<string, any>;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  take?: number;
  skip?: number;
  cursor?: Record<string, any>;
  distinct?: string[];
}

export interface QueryResult<T> {
  data: T[];
  count?: number;
  hasMore?: boolean;
  cursor?: any;
}

// Migration types
export interface Migration {
  id: string;
  name: string;
  checksum: string;
  appliedAt: Date;
  rolledBackAt?: Date;
  executionTime: number;
}

export interface MigrationStatus {
  pending: Migration[];
  applied: Migration[];
  failed: Migration[];
  current?: Migration;
}

// Database health types
export interface DatabaseHealth {
  connected: boolean;
  responseTime: number;
  activeConnections: number;
  queueSize: number;
  lastError?: {
    message: string;
    timestamp: Date;
  };
}

// Seeding types
export interface SeedData<T = any> {
  model: string;
  data: T | T[];
  options?: {
    upsert?: boolean;
    skipDuplicates?: boolean;
    connect?: boolean;
  };
}

export interface SeedResult {
  model: string;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// Database backup types
export interface BackupOptions {
  tables?: string[];
  excludeTables?: string[];
  includeSchema?: boolean;
  includeData?: boolean;
  compression?: boolean;
  format?: 'sql' | 'json';
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  tables: string[];
  createdAt: Date;
  checksum: string;
}

// Database monitoring types
export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    waiting: number;
    max: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
    averageTime: number;
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    throughput: number;
  };
  timestamp: Date;
}

// Audit log types
export interface AuditLog {
  id: string;
  table: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  recordId: string;
  userId?: string;
  changes?: Record<string, {
    old?: any;
    new?: any;
  }>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQuery {
  table?: string;
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
  recordId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

// Database validation types
export interface ValidationRule {
  field: string;
  rule: string;
  params?: any[];
  message?: string;
}

export interface ModelValidation {
  model: string;
  rules: ValidationRule[];
}

export interface ValidationError {
  field: string;
  value: any;
  rule: string;
  message: string;
}

// Cache types (for database query caching)
export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
  refresh?: boolean;
}

export interface CacheInfo {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  size: number;
  hits: number;
}

// Database indexing types
export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gist' | 'gin';
  size: number;
  usage: number;
}

export interface IndexAnalysis {
  unused: IndexInfo[];
  duplicate: IndexInfo[][];
  missing: {
    table: string;
    columns: string[];
    benefit: number;
  }[];
}

// Database relationship types
export interface Relation {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: {
    model: string;
    field: string;
  };
  to: {
    model: string;
    field: string;
  };
}

export interface ModelSchema {
  name: string;
  fields: {
    name: string;
    type: string;
    optional: boolean;
    list: boolean;
    unique: boolean;
    default?: any;
  }[];
  relations: Relation[];
  indexes: {
    name: string;
    fields: string[];
    unique: boolean;
  }[];
}

// Database utility types
export type SortOrder = 'asc' | 'desc';

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginationOutput<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterInput {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startswith' | 'endswith';
  value: any;
}

export interface SortInput {
  field: string;
  order: SortOrder;
}

// Error types
export interface DatabaseError {
  code: string;
  message: string;
  table?: string;
  constraint?: string;
  detail?: string;
  query?: string;
  params?: any[];
}

// Connection pool types
export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

export interface PoolStats {
  size: number;
  available: number;
  borrowed: number;
  invalid: number;
  pending: number;
  max: number;
  min: number;
}