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
 * @param {Object|null} imageData - Strapi image data structure { data: { attributes: {...} } }
 * @param {Object} options - Configuration options
 * @param {string} options.size - Image size: 'avatar', 'card', 'banner', 'thumbnail', 'small', 'medium', 'large'
 * @param {string} options.returnType - What to return: 'url' | 'dimensions' | 'full'
 * @param {number} options.fallbackWidth - Default width if no dimensions found
 * @param {number} options.fallbackHeight - Default height if no dimensions found
 * @returns {string|Object|null} - URL string, dimensions object, or full data object
 */
export const getImage = (imageData, options = {}) => {
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
  };
  
  const preferredFormat = formatMap[size] || size;
  
  // Helper function to get URL with fallback chain
  const getUrlWithFallback = () => {
    // Try preferred format first
    if (attributes.formats && attributes.formats[preferredFormat]) {
      return attributes.formats[preferredFormat].url;
    }
    
    // Fall back to other available formats
    if (attributes.formats) {
      const formatPriority = ['thumbnail', 'small', 'medium', 'large'];
      for (const fallbackFormat of formatPriority) {
        if (attributes.formats[fallbackFormat]) {
          return attributes.formats[fallbackFormat].url;
        }
      }
    }
    
    // Final fallback to original image URL
    return attributes.url || null;
  };

  // Helper function to get dimensions
  const getDimensionsWithFallback = () => {
    // Try preferred format first
    if (attributes.formats && attributes.formats[preferredFormat]) {
      return {
        width: attributes.formats[preferredFormat].width,
        height: attributes.formats[preferredFormat].height,
        size: attributes.formats[preferredFormat].size || attributes.formats[preferredFormat].sizeInBytes
      };
    }
    
    // Fall back to other available formats
    if (attributes.formats) {
      const formatPriority = ['thumbnail', 'small', 'medium', 'large'];
      for (const fallbackFormat of formatPriority) {
        if (attributes.formats[fallbackFormat]) {
          return {
            width: attributes.formats[fallbackFormat].width,
            height: attributes.formats[fallbackFormat].height,
            size: attributes.formats[fallbackFormat].size || attributes.formats[fallbackFormat].sizeInBytes
          };
        }
      }
    }
    
    // Final fallback to original dimensions
    return {
      width: attributes.width || fallbackWidth,
      height: attributes.height || fallbackHeight,
      size: attributes.size || null
    };
  };

  // Return based on requested type
  switch (returnType) {
    case 'url':
      return getUrlWithFallback();
      
    case 'dimensions':
      return getDimensionsWithFallback();
      
    case 'full':
      const url = getUrlWithFallback();
      const dimensions = getDimensionsWithFallback();
      return url ? { url, ...dimensions } : null;
      
    default:
      return getUrlWithFallback();
  }
};

/**
 * Legacy compatibility function for getBestDimensions
 * @deprecated Use getImage() instead
 */
export const getBestDimensions = (formats, originalAttributes = null) => {
  // Handle legacy format where only formats object is passed
  if (formats && !originalAttributes) {
    // Try to get the best format from formats object
    if (formats.large) return formats.large;
    if (formats.medium) return formats.medium;
    if (formats.small) return formats.small;
    if (formats.thumbnail) return formats.thumbnail;
    return null;
  }
  
  // Handle case with original attributes fallback
  if (formats) {
    if (formats.large) return formats.large;
    if (formats.medium) return formats.medium;
    if (formats.small) return formats.small;
    if (formats.thumbnail) return formats.thumbnail;
  }
  
  // Fallback to original image attributes if provided
  if (originalAttributes && originalAttributes.url) {
    return {
      url: originalAttributes.url,
      width: originalAttributes.width || null,
      height: originalAttributes.height || null,
      size: originalAttributes.size || null
    };
  }
  
  return null;
};

/**
 * Default export
 */
export default getImage;
