/**
 * CONSOLIDATED MEDIA UTILITIES
 * 
 * Universal media utilities for handling all media types across the application:
 * - File validation and type detection
 * - Cloudinary resource handling
 * - Legacy Strapi media support
 * - Cross-browser compatibility
 * - Modern TypeScript implementation
 * 
 * Replaces:
 * - /lib/utils/validation/media.js
 * - /lib/utils/misc/media.js
 * - /lib/utils/misc/image.ts
 */

import { CloudinaryResource } from '@/lib/types/cloudinary';

// =============================================
// SUPPORTED FORMATS CONFIGURATION
// =============================================

export const SUPPORTED_FORMATS = {
  // Profile picture formats - restricted for better performance
  profileImage: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ],
    extensions: ['jpg', 'jpeg', 'png'],
    displayFormats: ['JPEG', 'PNG']
  },
  
  // Gallery image formats - comprehensive
  image: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'image/tiff',
      'image/x-icon'
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'tiff', 'tif', 'ico'],
    displayFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'SVG', 'TIFF', 'ICO']
  },
  
  // Video formats
  video: {
    mimeTypes: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime', // MOV files
      'video/mov',
      'video/x-quicktime',
      'video/mpeg',
      'video/x-ms-wmv',
      'video/x-msvideo', // AVI
      'video/avi'
    ],
    extensions: ['mp4', 'webm', 'ogg', 'mov', 'mpeg', 'mpg', 'wmv', 'avi'],
    displayFormats: ['MP4', 'WebM', 'OGG', 'MOV', 'MPEG', 'WMV', 'AVI']
  },
  
  // Audio formats
  audio: {
    mimeTypes: [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/ogg',
      'audio/aac',
      'audio/webm'
    ],
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'webm'],
    displayFormats: ['MP3', 'WAV', 'OGG', 'AAC', 'WebM']
  }
};

export type MediaType = 'image' | 'video' | 'audio' | 'unknown';
export type MediaFormat = keyof typeof SUPPORTED_FORMATS;

// =============================================
// TYPE DETECTION UTILITIES
// =============================================

/**
 * Advanced media type detection with cross-browser compatibility
 */
export const getMediaType = (input: string | File, isProfileImage = false): MediaType => {
  if (!input) return 'unknown';
  
  const fileType = input instanceof File ? input.type : input;
  const fileName = input instanceof File ? input.name : input;
  
  // Normalize for cross-browser compatibility
  const normalizedType = fileType.toLowerCase();
  
  // Check MIME types first
  if (normalizedType.includes('/')) {
    if (normalizedType.startsWith('image/')) {
      const formatToCheck = isProfileImage ? SUPPORTED_FORMATS.profileImage : SUPPORTED_FORMATS.image;
      if (formatToCheck.mimeTypes.some(mime => normalizedType === mime.toLowerCase())) {
        return 'image';
      }
    }
    
    if (normalizedType.startsWith('video/')) {
      if (SUPPORTED_FORMATS.video.mimeTypes.some(mime => normalizedType === mime.toLowerCase())) {
        return 'video';
      }
    }
    
    if (normalizedType.startsWith('audio/')) {
      if (SUPPORTED_FORMATS.audio.mimeTypes.some(mime => normalizedType === mime.toLowerCase())) {
        return 'audio';
      }
    }
  }
  
  // Fallback: check by file extension
  const extension = fileName.toLowerCase().split('.').pop();
  if (extension) {
    const formatToCheck = isProfileImage ? SUPPORTED_FORMATS.profileImage : SUPPORTED_FORMATS.image;
    if (formatToCheck.extensions.includes(extension)) return 'image';
    if (SUPPORTED_FORMATS.video.extensions.includes(extension)) return 'video';
    if (SUPPORTED_FORMATS.audio.extensions.includes(extension)) return 'audio';
  }
  
  return 'unknown';
};

/**
 * Get media type from CloudinaryResource
 */
export const getCloudinaryMediaType = (resource: CloudinaryResource): MediaType => {
  if (!resource) return 'unknown';
  
  // Use Cloudinary's resource_type if available
  if (resource.resource_type) {
    if (resource.resource_type === 'image') return 'image';
    if (resource.resource_type === 'video') return 'video';
    if (resource.resource_type === 'raw') {
      // For raw resources, check the format/extension
      return getMediaTypeFromUrl(resource.secure_url);
    }
  }
  
  // Fallback to URL-based detection
  return getMediaTypeFromUrl(resource.secure_url);
};

/**
 * Get media type from URL
 */
export const getMediaTypeFromUrl = (url: string): MediaType => {
  if (!url) return 'unknown';
  
  try {
    const urlPath = new URL(url).pathname;
    const extension = urlPath.toLowerCase().split('.').pop();
    
    if (extension) {
      if (SUPPORTED_FORMATS.image.extensions.includes(extension)) return 'image';
      if (SUPPORTED_FORMATS.video.extensions.includes(extension)) return 'video';
      if (SUPPORTED_FORMATS.audio.extensions.includes(extension)) return 'audio';
    }
  } catch {
    // If URL parsing fails, try simple extension detection
    const extension = url.toLowerCase().split('.').pop();
    if (extension) {
      if (SUPPORTED_FORMATS.image.extensions.includes(extension)) return 'image';
      if (SUPPORTED_FORMATS.video.extensions.includes(extension)) return 'video';
      if (SUPPORTED_FORMATS.audio.extensions.includes(extension)) return 'audio';
    }
  }
  
  return 'unknown';
};

// =============================================
// VALIDATION UTILITIES
// =============================================

export interface ValidationResult {
  isValid: boolean;
  type: MediaType;
  error?: string;
}

/**
 * Validate file type against supported formats
 */
export const validateFileType = (
  file: File | string,
  allowedTypes: MediaType[] = ['image', 'video', 'audio'],
  isProfileImage = false
): ValidationResult => {
  const detectedType = getMediaType(file, isProfileImage);
  
  if (detectedType === 'unknown') {
    return {
      isValid: false,
      type: 'unknown',
      error: 'Unsupported file type. Please choose a different file.'
    };
  }
  
  if (!allowedTypes.includes(detectedType)) {
    const allowedFormats = allowedTypes.map(type => {
      if (type === 'image' && isProfileImage) {
        return SUPPORTED_FORMATS.profileImage.displayFormats.join(', ');
      }
      return SUPPORTED_FORMATS[type].displayFormats.join(', ');
    }).join(', ');
    
    return {
      isValid: false,
      type: detectedType,
      error: `Only ${allowedFormats} files are allowed.`
    };
  }
  
  return {
    isValid: true,
    type: detectedType
  };
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeMB = 15): ValidationResult => {
  if (!file || !(file instanceof File)) {
    return {
      isValid: false,
      type: 'unknown',
      error: 'Invalid file'
    };
  }
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      type: getMediaType(file),
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  return {
    isValid: true,
    type: getMediaType(file)
  };
};

/**
 * Comprehensive file validation
 */
export const validateFile = (
  file: File,
  options: {
    allowedTypes?: MediaType[];
    maxSizeMB?: number;
    isProfileImage?: boolean;
  } = {}
): ValidationResult => {
  const {
    allowedTypes = ['image', 'video', 'audio'],
    maxSizeMB = 15,
    isProfileImage = false
  } = options;
  
  // Check file type
  const typeValidation = validateFileType(file, allowedTypes, isProfileImage);
  if (!typeValidation.isValid) {
    return typeValidation;
  }
  
  // Check file size
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  return {
    isValid: true,
    type: typeValidation.type
  };
};

// =============================================
// HTML INPUT UTILITIES
// =============================================

/**
 * Generate accept attribute string for file inputs
 */
export const generateAcceptString = (
  types: MediaType[] = ['image', 'video', 'audio'],
  isProfileImage = false
): string => {
  const acceptedMimeTypes: string[] = [];
  
  types.forEach(type => {
    if (type === 'image' && isProfileImage) {
      acceptedMimeTypes.push(...SUPPORTED_FORMATS.profileImage.mimeTypes);
    } else if (SUPPORTED_FORMATS[type as MediaFormat]) {
      acceptedMimeTypes.push(...SUPPORTED_FORMATS[type as MediaFormat].mimeTypes);
    }
  });
  
  return acceptedMimeTypes.join(',');
};

// =============================================
// CLOUDINARY UTILITIES
// =============================================

/**
 * Get optimized Cloudinary URL
 */
export const getOptimizedCloudinaryUrl = (
  resource: CloudinaryResource,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string => {
  if (!resource?.secure_url) return '';
  
  // For Cloudinary URLs, we can add transformations
  if (resource.secure_url.includes('cloudinary.com')) {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill'
    } = options;
    
    const transformations: string[] = [];
    
    if (width || height) {
      const dimensions = [
        width && `w_${width}`,
        height && `h_${height}`,
        `c_${crop}`
      ].filter(Boolean).join(',');
      transformations.push(dimensions);
    }
    
    if (quality) {
      transformations.push(`q_${quality}`);
    }
    
    if (format) {
      transformations.push(`f_${format}`);
    }
    
    if (transformations.length > 0) {
      // Insert transformations into Cloudinary URL
      const urlParts = resource.secure_url.split('/upload/');
      if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
      }
    }
  }
  
  return resource.secure_url;
};

/**
 * Get display name from CloudinaryResource
 */
export const getResourceDisplayName = (resource: CloudinaryResource): string => {
  if (!resource) return '';
  
  // Try original filename first
  if (resource.original_filename) {
    return resource.original_filename;
  }
  
  // Fallback to public_id
  if (resource.public_id) {
    return resource.public_id.split('/').pop() || resource.public_id;
  }
  
  return 'Unnamed file';
};

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// =============================================
// LEGACY SUPPORT (STRAPI)
// =============================================

/**
 * Legacy Strapi media type detection
 * @deprecated Use CloudinaryResource instead
 */
export const getStrapiMediaType = (mediaItem: any): MediaType => {
  if (!mediaItem?.attributes) return 'unknown';
  
  const { mime, url } = mediaItem.attributes;
  
  if (mime) {
    const type = getMediaType(mime);
    if (type !== 'unknown') return type;
  }
  
  if (url) {
    return getMediaTypeFromUrl(url);
  }
  
  return 'unknown';
};

/**
 * Legacy Strapi image utility
 * @deprecated Use CloudinaryResource instead
 */
export const getStrapiImageUrl = (imageData: any, size = 'thumbnail'): string | null => {
  if (!imageData?.data?.attributes) return null;
  
  const attributes = imageData.data.attributes;
  
  // Try to get specific format
  if (attributes.formats?.[size]) {
    return attributes.formats[size].url;
  }
  
  // Fallback to original
  return attributes.url || null;
};

// =============================================
// EXPORTS
// =============================================

export default {
  // Core utilities
  getMediaType,
  getCloudinaryMediaType,
  getMediaTypeFromUrl,
  
  // Validation
  validateFileType,
  validateFileSize,
  validateFile,
  
  // HTML utilities
  generateAcceptString,
  
  // Cloudinary utilities
  getOptimizedCloudinaryUrl,
  getResourceDisplayName,
  
  // Helper utilities
  formatFileSize,
  
  // Legacy support
  getStrapiMediaType,
  getStrapiImageUrl,
  
  // Constants
  SUPPORTED_FORMATS
};