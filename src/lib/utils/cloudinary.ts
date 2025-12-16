/**
 * CLOUDINARY UTILITIES
 * Helper functions for Cloudinary integration
 */

import { JsonValue } from '@prisma/client/runtime/library';
import { CloudinaryResource } from '@/lib/types/cloudinary';

/**
 * Build Cloudinary URL with transformations
 */
export function buildCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'crop' | 'scale' | 'pad';
    quality?: number | 'auto';
    format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
    gravity?: 'center' | 'face' | 'faces' | 'north' | 'south' | 'east' | 'west';
    folder?: string;
  }
) {
  if (!publicId) return '';
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured');
    return '';
  }

  const transformations: string[] = [];
  
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);
  if (options?.gravity) transformations.push(`g_${options.gravity}`);
  
  const transformationString = transformations.length > 0 
    ? `/${transformations.join(',')}` 
    : '';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload${transformationString}/${publicId}`;
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string {
  if (!cloudinaryUrl) return '';
  
  const match = cloudinaryUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
  return match?.[1] || '';
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export function generateResponsiveSizes(publicId: string, sizes: { width: number; breakpoint?: string }[]) {
  return sizes.map(({ width, breakpoint }) => ({
    url: buildCloudinaryUrl(publicId, { 
      width, 
      quality: 'auto', 
      format: 'auto' 
    }),
    width,
    breakpoint
  }));
}

/**
 * Get optimized avatar URL
 */
export function getAvatarUrl(publicId: string, size: number = 150) {
  return buildCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Get optimized thumbnail URL
 */
export function getThumbnailUrl(publicId: string, width: number = 300, height: number = 200) {
  return buildCloudinaryUrl(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Validate if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return /https:\/\/res\.cloudinary\.com\/.+\/image\/upload/.test(url);
}

/**
 * Upload widget configuration for client-side uploads
 */
export function getUploadWidgetConfig(options?: {
  folder?: string;
  tags?: string[];
  maxFileSize?: number;
  allowedFormats?: string[];
  maxFiles?: number;
}) {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    folder: options?.folder || 'uploads',
    tags: options?.tags || [],
    maxFileSize: options?.maxFileSize || 10000000, // 10MB
    allowedFormats: options?.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: options?.maxFiles || 1,
    sources: ['local', 'url', 'camera'],
    multiple: (options?.maxFiles || 1) > 1,
    resourceType: 'auto'
  };
}

/**
 * PENDING RESOURCE UTILITIES
 * Helper functions for handling pending (not yet uploaded) resources
 */

/**
 * Check if a Cloudinary resource is pending (not yet uploaded)
 */
export function isPendingResource(resource: CloudinaryResource): boolean {
  return (
    ('_pending' in resource && (resource as any)._pending) ||
    resource.public_id?.startsWith('pending_') ||
    false
  );
}

/**
 * Filter out pending resources from a single resource or null
 */
export function filterPendingResource(
  resource: CloudinaryResource | null
): CloudinaryResource | null {
  if (!resource) return null;
  return isPendingResource(resource) ? null : resource;
}

/**
 * Filter out pending resources from an array of resources
 */
export function filterPendingResources(
  resources: CloudinaryResource[]
): CloudinaryResource[] {
  return resources.filter(resource => !isPendingResource(resource));
}

/**
 * Sanitize Cloudinary resources for database storage
 * Removes pending resources and the _pending flag from uploaded resources
 * Now supports both CloudinaryResource objects and string URLs
 */
export function sanitizeCloudinaryResource(
  resource: CloudinaryResource | string | null
): CloudinaryResource | string | null {
  if (!resource) {
    return null;
  }
  
  // If it's a string URL, return as-is (already clean)
  if (typeof resource === 'string') {
    return resource;
  }
  
  const isPending = isPendingResource(resource);
  
  if (isPending) {
    return null;
  }
  
  // Remove _pending flag if it exists
  const { _pending, ...sanitized } = resource as any;
  return sanitized as CloudinaryResource;
}

/**
 * Sanitize array of Cloudinary resources for database storage
 * Removes pending resources and the _pending flag from uploaded resources
 */
export function sanitizeCloudinaryResources(
  resources: CloudinaryResource[]
): CloudinaryResource[] {
  return filterPendingResources(resources).map(resource => {
    // Remove _pending flag if it exists
    const { _pending, ...sanitized } = resource as any;
    return sanitized as CloudinaryResource;
  });
}

/**
 * IMAGE DATABASE UTILITIES
 * Helper functions for handling images in database storage
 */

/**
 * Process image data for database storage
 * Converts CloudinaryResource objects to URL strings for consistency
 * Supports both migrated users (string URLs) and new uploads (CloudinaryResource objects)
 * CRITICAL: Rejects blob URLs and validates HTTPS URLs to prevent temporary URLs from being saved
 */
export function processImageForDatabase(imageData: any): string | null {
  if (!imageData) return null;

  // If it's already a string URL, validate it
  if (typeof imageData === 'string') {
    // Reject blob URLs (client-side temporary URLs that should never be persisted)
    if (imageData.startsWith('blob:')) {
      console.warn('❌ Rejected blob URL in processImageForDatabase:', imageData);
      return null;
    }

    // Validate it's a proper HTTPS URL (Cloudinary or OAuth provider)
    if (!imageData.startsWith('https://')) {
      console.warn('❌ Rejected non-HTTPS URL in processImageForDatabase:', imageData);
      return null;
    }

    return imageData;
  }

  // If it's a CloudinaryResource object, extract and validate the secure_url
  if (typeof imageData === 'object' && imageData.secure_url) {
    const url = imageData.secure_url;

    // Reject blob URLs from CloudinaryResource objects
    if (url.startsWith('blob:')) {
      console.warn('❌ Rejected blob URL from CloudinaryResource in processImageForDatabase:', url);
      return null;
    }

    // Validate HTTPS URL
    if (!url.startsWith('https://')) {
      console.warn('❌ Rejected non-HTTPS URL from CloudinaryResource in processImageForDatabase:', url);
      return null;
    }

    return url;
  }

  return null;
}

/**
 * Get image URL from either CloudinaryResource object or string URL
 * Handles both formats for backward compatibility in components
 */
export function getImageUrl(image: CloudinaryResource | string | null): string | null {
  if (!image) return null;

  // If it's a string URL, return as-is
  if (typeof image === 'string') {
    return image;
  }

  // If it's a CloudinaryResource object, return secure_url
  if (typeof image === 'object' && image.secure_url) {
    return image.secure_url;
  }

  return null;
}

/**
 * Check if an image value is a string URL
 */
export function isImageUrl(image: any): image is string {
  return typeof image === 'string' && image.length > 0;
}

/**
 * Check if an image value is a CloudinaryResource object
 */
export function isCloudinaryResource(image: any): image is CloudinaryResource {
  return typeof image === 'object' && image !== null && 'secure_url' in image;
}

/**
 * Get image display properties for components
 * Returns consistent format regardless of input type
 */
export function getImageDisplayProps(image: CloudinaryResource | string | null): {
  url: string | null;
  alt?: string;
  width?: number;
  height?: number;
} {
  if (!image) {
    return { url: null };
  }

  if (typeof image === 'string') {
    return { url: image };
  }

  if (typeof image === 'object' && image.secure_url) {
    return {
      url: image.secure_url,
      alt: image.metadata?.alternative_text || image.original_filename,
      width: image.width,
      height: image.height,
    };
  }

  return { url: null };
}