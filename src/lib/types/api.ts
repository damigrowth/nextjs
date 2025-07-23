/**
 * API TYPE DEFINITIONS
 * All API request/response and HTTP related types
 */

// Generic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortParams;
  pagination?: PaginationParams;
}

// HTTP request types
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}

export interface ApiClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  signature?: string;
}

export interface CloudinaryWebhook {
  notification_type: 'upload' | 'delete' | 'resource_context_update';
  public_id: string;
  version: number;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  url?: string;
  secure_url?: string;
  created_at?: string;
  folder?: string;
  tags?: string[];
}

export interface StripeWebhook {
  id: string;
  object: 'event';
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

export interface ResendWebhook {
  type: 'email.sent' | 'email.delivered' | 'email.bounced' | 'email.complained';
  created_at: string;
  data: {
    to: string;
    from: string;
    subject: string;
    email_id: string;
  };
}

// File upload types
export interface UploadResponse {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
  transformation?: Record<string, any>;
  onProgress?: (progress: UploadProgress) => void;
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResponse {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

// Health check types
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: number;
  uptime: number;
  version: string;
  services: {
    database: 'ok' | 'down';
    auth: 'ok' | 'down';
    storage: 'ok' | 'down';
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// API versioning types
export interface ApiVersion {
  version: string;
  releaseDate: Date;
  deprecated?: boolean;
  deprecationDate?: Date;
  endOfLifeDate?: Date;
}

// Server action response types
export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  redirect?: string;
}

export interface FormActionResponse extends ServerActionResponse {
  fieldErrors?: Record<string, string>;
  formError?: string;
}

// Action result type for server actions
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// API endpoint configuration
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  auth?: boolean;
  roles?: string[];
  rateLimit?: RateLimitConfig;
  validation?: any;
}

export interface ApiRoutes {
  auth: {
    login: ApiEndpoint;
    register: ApiEndpoint;
    logout: ApiEndpoint;
    refresh: ApiEndpoint;
    forgotPassword: ApiEndpoint;
    resetPassword: ApiEndpoint;
    verifyEmail: ApiEndpoint;
  };
  users: {
    getProfile: ApiEndpoint;
    updateProfile: ApiEndpoint;
    uploadAvatar: ApiEndpoint;
    deleteAccount: ApiEndpoint;
  };
  admin: {
    getUsers: ApiEndpoint;
    updateUser: ApiEndpoint;
    banUser: ApiEndpoint;
    unbanUser: ApiEndpoint;
    getApiKeys: ApiEndpoint;
    createApiKey: ApiEndpoint;
    deleteApiKey: ApiEndpoint;
  };
  webhooks: {
    cloudinary: ApiEndpoint;
    stripe: ApiEndpoint;
    resend: ApiEndpoint;
  };
}

// Request context types
export interface RequestContext {
  user?: any;
  session?: any;
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
}

// Middleware types
export interface MiddlewareContext extends RequestContext {
  request: Request;
  response?: Response;
  next: () => void;
}

export interface AuthMiddlewareConfig {
  requireAuth?: boolean;
  requireRoles?: string[];
  requirePermissions?: string[];
  allowGuest?: boolean;
}

// Cache types
export interface CacheConfig {
  ttl?: number;
  key?: string;
  tags?: string[];
  revalidate?: boolean;
}

export interface CacheResponse<T = any> {
  data: T;
  hit: boolean;
  key: string;
  ttl: number;
  createdAt: Date;
}