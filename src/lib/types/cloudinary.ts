/**
 * CLOUDINARY TYPE DEFINITIONS
 * Centralized type definitions for Cloudinary resources and upload handling
 */

/**
 * CloudinaryResource type is now provided by prisma-json-types-generator
 * via PrismaJson.CloudinaryResource - use that instead of defining here
 */
export type CloudinaryResource = PrismaJson.CloudinaryResource;

/**
 * Type guard to check if an object is a CloudinaryResource
 */
export function isCloudinaryResource(
  obj: any,
): obj is PrismaJson.CloudinaryResource {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.public_id === 'string' &&
    typeof obj.secure_url === 'string' &&
    typeof obj.resource_type === 'string' &&
    ['image', 'video', 'raw', 'audio', 'auto'].includes(obj.resource_type)
  );
}
