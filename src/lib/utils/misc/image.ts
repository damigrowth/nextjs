/**
 * Universal Image Utility for Strapi Images
 * 
 * Single consolidated utility that handles all image scenarios with intelligent fallbacks:
 * - Profile avatars, service images, category banners
 * - Small images without formats, large images with formats
 * - Returns URLs or complete image data with dimensions
 * 
 * @author Doulitsa Development Team
 */

/**
 * Universal image utility that handles all Strapi image scenarios
 * 
 * @param imageData - Strapi image data structure { data: { attributes: {...} } }
 * @param options - Configuration options
 * @returns URL string, dimensions object, or full data object
 */
export const getImage = (imageData: any, options: {
  size?: 'avatar' | 'card' | 'banner' | 'thumbnail' | 'small' | 'medium' | 'large';
  returnType?: 'url' | 'dimensions' | 'full';
  fallbackWidth?: number;
  fallbackHeight?: number;
} = {}) => {
  const {
    size = 'thumbnail',
    returnType = 'url',
    fallbackWidth = 150,
    fallbackHeight = 150
  } = options;

  // Return null if no image data
  if (!imageData?.data?.attributes) {
    return null;
  }

  const attributes = imageData.data.attributes;
  
  // Map size shortcuts to format names
  const formatMap = {
    'avatar': 'thumbnail',
    'card': 'small', 
    'banner': 'large',
    'thumbnail': 'thumbnail',
    'small': 'small',
    'medium': 'medium',
    'large': 'large'
  } as const;
  
  const preferredFormat = formatMap[size] || size;
  
  // Try to get the preferred format first
  let selectedImage = null;
  if (attributes.formats?.[preferredFormat]) {
    selectedImage = attributes.formats[preferredFormat];
  } else if (attributes.formats) {
    // Fall back to best available format
    selectedImage = getBestDimensions(attributes.formats);
  } else {
    // Use original image if no formats available
    selectedImage = {
      url: attributes.url,
      width: attributes.width || fallbackWidth,
      height: attributes.height || fallbackHeight
    };
  }
  
  // Return based on requested type
  switch (returnType) {
    case 'dimensions':
      return {
        width: selectedImage?.width || fallbackWidth,
        height: selectedImage?.height || fallbackHeight
      };
    case 'full':
      return {
        url: selectedImage?.url || attributes.url,
        width: selectedImage?.width || attributes.width || fallbackWidth,
        height: selectedImage?.height || attributes.height || fallbackHeight,
        alt: attributes.alternativeText || '',
        caption: attributes.caption || ''
      };
    case 'url':
    default:
      return selectedImage?.url || attributes.url;
  }
};

/**
 * Get best available image dimensions from formats
 */
export const getBestDimensions = (formats: any) => {
  if (formats) {
    if (formats.large) {
      return formats.large;
    }
    if (formats.medium) {
      return formats.medium;
    }
    if (formats.small) {
      return formats.small;
    }
    return formats.thumbnail;
  } else {
    return null;
  }
};

/**
 * Get image URL with fallback
 */
export const getImageUrl = (imageData: any, size = 'thumbnail'): string | null => {
  return getImage(imageData, { size, returnType: 'url' });
};

/**
 * Get image dimensions with fallback
 */
export const getImageDimensions = (imageData: any, fallbackWidth = 150, fallbackHeight = 150) => {
  return getImage(imageData, { 
    returnType: 'dimensions', 
    fallbackWidth, 
    fallbackHeight 
  });
};

/**
 * Check if image data is valid
 */
export const isValidImage = (imageData: any): boolean => {
  return !!(imageData?.data?.attributes?.url);
};

/**
 * Get optimized image URL for performance
 */
export const getOptimizedImageUrl = (imageData: any, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
} = {}): string | null => {
  const url = getImageUrl(imageData);
  if (!url) return null;
  
  // Add query parameters for optimization (if supported by your CDN)
  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  return params.toString() ? `${url}?${params.toString()}` : url;
};