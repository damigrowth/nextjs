/**
 * CLOUDINARY UTILITIES
 * Helper functions for Cloudinary integration
 */

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
 */
export function sanitizeCloudinaryResource(
  resource: CloudinaryResource | null
): CloudinaryResource | null {
  if (!resource) {
    return null;
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