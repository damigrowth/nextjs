/**
 * CLOUDINARY TYPE DEFINITIONS
 * Centralized type definitions for Cloudinary resources and upload handling
 */

/**
 * Standard Cloudinary resource object returned from successful uploads
 */
export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  resource_type: 'image' | 'video' | 'raw';
  format?: string;
  bytes?: number;
  url?: string;
  created_at?: string;
  folder?: string;
  asset_id?: string;
  version?: number;
  etag?: string;
  signature?: string;
  tags?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  // Additional properties for upload handling
  original_filename?: string;
  batch_id?: string;
  upload_status?: string;
  // Flag to indicate this is a pending upload (not yet uploaded to Cloudinary)
  _pending?: boolean;
  // Index signature for JSON compatibility
  [key: string]: any;
}

/**
 * Upload widget success result structure
 */
export interface CloudinaryUploadResult {
  event: 'success';
  info: CloudinaryResource;
}

/**
 * Upload widget error result structure
 */
export interface CloudinaryUploadError {
  event: 'error';
  error: {
    message: string;
    status?: string;
    statusText?: string;
  };
}

/**
 * Upload widget event types
 */
export type CloudinaryUploadEvent =
  | 'success'
  | 'error'
  | 'upload-added'
  | 'queues-start'
  | 'queues-end'
  | 'close'
  | 'display-changed'
  | 'source-changed';

/**
 * Upload widget configuration options
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  sources?: (
    | 'local'
    | 'url'
    | 'camera'
    | 'dropbox'
    | 'google_drive'
    | 'unsplash'
  )[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  clientAllowedFormats?: string[];
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  cropping?: boolean;
  croppingAspectRatio?: number;
  showSkipCropButton?: boolean;
  croppingShowBackButton?: boolean;
  croppingShowDimensions?: boolean;
  publicId?: string;
  uploadPreset?: string;
  transformation?: any;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Type guard to check if an object is a CloudinaryResource
 */
export function isCloudinaryResource(obj: any): obj is CloudinaryResource {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.public_id === 'string' &&
    typeof obj.secure_url === 'string' &&
    typeof obj.resource_type === 'string' &&
    ['image', 'video', 'raw'].includes(obj.resource_type)
  );
}
