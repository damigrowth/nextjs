/**
 * Universal media validation utilities for cross-browser and cross-device compatibility
 * Supports specific file formats for different use cases
 */

// Supported file formats based on requirements
export const SUPPORTED_FORMATS = {
  // Profile picture formats - restricted
  profileImage: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ],
    extensions: ['jpg', 'jpeg', 'png'],
    displayFormats: ['JPEG', 'PNG']
  },
  // Media gallery formats - comprehensive
  image: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      'image/x-icon',
      'image/vnd.djvu', // DVU format
      'image/vnd.djv'   // Alternative DVU MIME
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'tiff', 'tif', 'ico', 'dvu', 'djvu'],
    displayFormats: ['JPEG', 'PNG', 'GIF', 'SVG', 'TIFF', 'ICO', 'DVU']
  },
  video: {
    mimeTypes: [
      'video/mpeg',
      'video/mp4',
      'video/quicktime', // MOV files
      'video/mov', // Alternative MOV MIME type
      'video/x-quicktime', // Another MOV variant
      'video/x-ms-wmv',
      'video/x-msvideo', // AVI
      'video/avi',
      'video/x-flv',
      'video/flv'
    ],
    extensions: ['mpeg', 'mpg', 'mp4', 'mov', 'wmv', 'avi', 'flv'],
    displayFormats: ['MPEG', 'MP4', 'MOV', 'WMV', 'AVI', 'FLV']
  },
  audio: {
    mimeTypes: [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/ogg'
    ],
    extensions: ['mp3', 'wav', 'ogg'],
    displayFormats: ['MP3', 'WAV', 'OGG']
  }
};

/**
 * Generate accept attribute string for file inputs
 * @param {string[]} types - Array of media types to include ['image', 'video', 'audio']
 * @param {boolean} isProfileImage - Whether this is for profile image (restricted formats)
 * @returns {string} - Accept attribute value
 */
export const generateAcceptString = (types = ['image', 'video', 'audio'], isProfileImage = false) => {
  const acceptedMimeTypes = [];
  
  types.forEach(type => {
    if (type === 'image' && isProfileImage) {
      // Use restricted profile image formats
      acceptedMimeTypes.push(...SUPPORTED_FORMATS.profileImage.mimeTypes);
    } else if (SUPPORTED_FORMATS[type]) {
      acceptedMimeTypes.push(...SUPPORTED_FORMATS[type].mimeTypes);
    }
  });
  
  return acceptedMimeTypes.join(',');
};

/**
 * Advanced media type detection with cross-browser compatibility
 * @param {string} fileType - MIME type or file path/URL
 * @param {boolean} isProfileImage - Whether to use profile image restrictions
 * @returns {string} - 'image', 'video', 'audio', or 'unknown'
 */
export const getMediaType = (fileType, isProfileImage = false) => {
  if (!fileType || typeof fileType !== 'string') return 'unknown';
  
  // Normalize file type to lowercase for cross-browser compatibility
  const normalizedType = fileType.toLowerCase();
  
  // Check MIME types first
  if (normalizedType.includes('/')) {
    // Image types
    if (normalizedType.startsWith('image/')) {
      const formatToCheck = isProfileImage ? SUPPORTED_FORMATS.profileImage : SUPPORTED_FORMATS.image;
      const subType = normalizedType.split('/')[1];
      if (formatToCheck.extensions.some(format => 
        subType.includes(format) || subType === format || 
        // Handle special cases
        (format === 'jpeg' && subType === 'jpg') ||
        (format === 'svg' && subType.includes('svg')) ||
        (format === 'tiff' && subType === 'tiff') ||
        (format === 'ico' && (subType === 'x-icon' || subType === 'vnd.microsoft.icon')) ||
        (format === 'dvu' && (subType.includes('djvu') || subType.includes('djv')))
      )) {
        return 'image';
      }
    }
    
    // Video types  
    if (normalizedType.startsWith('video/')) {
      const subType = normalizedType.split('/')[1];
      if (SUPPORTED_FORMATS.video.extensions.some(format => 
        subType.includes(format) || subType === format ||
        // Handle special cases
        (format === 'avi' && (subType === 'x-msvideo' || subType === 'avi')) ||
        (format === 'wmv' && subType === 'x-ms-wmv') ||
        (format === 'flv' && subType === 'x-flv') ||
        (format === 'mov' && (subType === 'quicktime' || subType === 'x-quicktime' || subType === 'mov'))
      )) {
        return 'video';
      }
    }
    
    // Audio types
    if (normalizedType.startsWith('audio/')) {
      const subType = normalizedType.split('/')[1];
      if (SUPPORTED_FORMATS.audio.extensions.some(format => 
        subType.includes(format) || subType === format ||
        // Handle special cases
        (format === 'mp3' && subType === 'mpeg') ||
        (format === 'wav' && subType === 'wave')
      )) {
        return 'audio';
      }
    }
  }
  
  // Fallback: check by file extension if MIME type detection fails
  // This is crucial for files with generic MIME types like application/octet-stream
  const fileExtension = normalizedType.split('.').pop();
  if (fileExtension) {
    const formatToCheck = isProfileImage ? SUPPORTED_FORMATS.profileImage : SUPPORTED_FORMATS.image;
    if (formatToCheck.extensions.includes(fileExtension)) return 'image';
    if (SUPPORTED_FORMATS.video.extensions.includes(fileExtension)) return 'video';
    if (SUPPORTED_FORMATS.audio.extensions.includes(fileExtension)) return 'audio';
  }
  
  // Additional fallback for files with names ending in extensions
  // Handle cases where fileType might be a filename
  if (normalizedType.includes('.')) {
    const extension = normalizedType.split('.').pop();
    const formatToCheck = isProfileImage ? SUPPORTED_FORMATS.profileImage : SUPPORTED_FORMATS.image;
    if (formatToCheck.extensions.includes(extension)) return 'image';
    if (SUPPORTED_FORMATS.video.extensions.includes(extension)) return 'video';
    if (SUPPORTED_FORMATS.audio.extensions.includes(extension)) return 'audio';
  }

  return 'unknown';
};

/**
 * Advanced media type detection for Strapi media objects
 * @param {object} mediaItem - Strapi media object
 * @returns {string} - 'image', 'video', 'audio', or 'unknown'
 */
export const getStrapiMediaType = (mediaItem) => {
  if (!mediaItem || !mediaItem.attributes) return 'unknown';
  
  const { mime, url, formats } = mediaItem.attributes;
  
  // First try MIME type
  if (mime) {
    const type = getMediaType(mime);
    if (type !== 'unknown') return type;
  }
  
  // Then try formats (usually for images)
  if (formats && Object.keys(formats).length > 0) {
    const format = Object.values(formats)[0];
    if (format && format.mime) {
      const type = getMediaType(format.mime);
      if (type !== 'unknown') return type;
    }
  }
  
  // Finally try URL-based detection
  if (url) {
    const type = getMediaType(url);
    if (type !== 'unknown') return type;
  }
  
  return 'unknown';
};

/**
 * Validate file type against supported formats
 * @param {File|string} file - File object or MIME type string
 * @param {string[]} allowedTypes - Array of allowed types ['image', 'video', 'audio']
 * @param {boolean} isProfileImage - Whether to use profile image restrictions
 * @returns {object} - { isValid: boolean, type: string, error?: string }
 */
export const validateFileType = (file, allowedTypes = ['image', 'video', 'audio'], isProfileImage = false) => {
  const fileType = file instanceof File ? file.type : file;
  const fileName = file instanceof File ? file.name : '';
  
  // Debug logging for MOV files
  if (fileName && fileName.toLowerCase().endsWith('.mov')) {
    console.log('MOV file detected:', { fileName, fileType, allowedTypes });
  }
  
  // Try MIME type detection first
  let detectedType = getMediaType(fileType, isProfileImage);
  
  // If MIME type detection fails, try filename-based detection
  if (detectedType === 'unknown' && fileName) {
    detectedType = getMediaType(fileName, isProfileImage);
  }
  
  // Special handling for MOV files that might have generic MIME types
  if (detectedType === 'unknown' && fileName && fileName.toLowerCase().endsWith('.mov')) {
    detectedType = 'video';
    console.log('MOV file type corrected to video');
  }
  
  if (detectedType === 'unknown') {
    console.log('File type detection failed:', { fileName, fileType, detectedType });
    return {
      isValid: false,
      type: 'unknown',
      error: 'Λυπούμαστε, αυτός ο τύπος αρχείου δεν επιτρέπεται.'
    };
  }
  
  if (!allowedTypes.includes(detectedType)) {
    const allowedFormats = allowedTypes.map(type => {
      if (type === 'image' && isProfileImage) {
        return SUPPORTED_FORMATS.profileImage?.displayFormats?.join(', ');
      }
      return SUPPORTED_FORMATS[type]?.displayFormats?.join(', ');
    }).filter(Boolean).join(', ');
    
    return {
      isValid: false,
      type: detectedType,
      error: `Επιτρέπονται μόνο αρχεία τύπου: ${allowedFormats}`
    };
  }
  
  // Additional validation for profile images
  if (isProfileImage && detectedType === 'image') {
    const profileImageTypes = SUPPORTED_FORMATS.profileImage.mimeTypes;
    if (fileType && !profileImageTypes.includes(fileType)) {
      // Also check by filename for profile images
      if (!fileName || !fileName.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
        return {
          isValid: false,
          type: detectedType,
          error: `Για εικόνα προφίλ επιτρέπονται μόνο: ${SUPPORTED_FORMATS.profileImage.displayFormats.join(', ')}`
        };
      }
    }
  }
  
  return {
    isValid: true,
    type: detectedType
  };
};

/**
 * Advanced URL-based media type detection for existing media
 * @param {string} url - Media URL
 * @returns {string} - 'image', 'video', 'audio', or 'unknown'
 */
export const getMediaTypeFromUrl = (url) => {
  if (!url || typeof url !== 'string') return 'unknown';
  
  let urlPath;
  try {
    urlPath = new URL(url).pathname;
  } catch (e) {
    urlPath = url;
  }
  
  const extension = urlPath.toLowerCase().split('.').pop();
  
  // Check against all supported extensions
  if (SUPPORTED_FORMATS.image.extensions.includes(extension)) return 'image';
  if (SUPPORTED_FORMATS.video.extensions.includes(extension)) return 'video';
  if (SUPPORTED_FORMATS.audio.extensions.includes(extension)) return 'audio';
  
  // Check URL patterns (for Cloudinary, Strapi, etc.)
  const lowerUrl = urlPath.toLowerCase();
  if (lowerUrl.includes('/video/upload/') && SUPPORTED_FORMATS.audio.extensions.includes(extension)) {
    return 'audio';
  }
  if (lowerUrl.includes('/image/upload/')) return 'image';
  if (lowerUrl.includes('/video/upload/')) return 'video';
  
  return 'unknown';
};

// Cross-browser file size validation
export const validateFileSize = (file, maxSizeMB = 15) => {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'Μη έγκυρο αρχείο' };
  }
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
};

// Default export with all utilities
export default {
  SUPPORTED_FORMATS,
  generateAcceptString,
  getMediaType,
  getStrapiMediaType,
  validateFileType,
  getMediaTypeFromUrl,
  validateFileSize
};
