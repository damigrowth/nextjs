/**
 * Type-safe API client for Hono endpoints
 * Provides utility functions for making HTTP requests to the API
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * Creates a custom API error with additional properties
 */
export const createApiError = (message: string, status?: number, code?: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
};

/**
 * Generic API client function
 */
export const apiClient = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw createApiError(
        data.message || data.error || 'API request failed',
        response.status,
        data.code
      );
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Client Error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        data: undefined,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      data: undefined,
    };
  }
};

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T = unknown>(endpoint: string, options: RequestInit = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options: RequestInit = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Specific API methods for common operations
 */
export const profileApi = {
  create: (data: unknown) => api.post('/api/profiles', data),
  updateOnboardingStep: (step: string) => api.patch('/api/users/onboarding-step', { step }),
};

export default api;