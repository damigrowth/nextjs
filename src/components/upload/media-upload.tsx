'use client';

import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CloudinaryResource } from '@/lib/types/cloudinary';
import {
  Upload,
  X,
  Loader2,
  AlertCircle,
  Play,
  Music,
  Video,
} from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import {
  getCloudinaryMediaType,
  getMediaType,
  validateFile,
  generateAcceptString,
  getResourceDisplayName,
  formatFileSize,
  type MediaType,
} from '@/lib/utils/media';

interface QueuedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  isUploaded?: boolean;
  cloudinaryResource?: CloudinaryResource;
  error?: string;
}

interface MediaUploadProps {
  value: CloudinaryResource | CloudinaryResource[] | null;
  onChange: (
    resources: CloudinaryResource | CloudinaryResource[] | null,
  ) => void;
  uploadPreset?: string;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  className?: string;
  placeholder?: string;
  error?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  type?: 'image' | 'auto';
  signed?: boolean;
  signatureEndpoint?: string;
}

export interface MediaUploadRef {
  uploadFiles: () => Promise<void>;
  hasFiles: () => boolean;
  clearQueue: () => void;
}

/**
 * Media Upload Component with Manual Upload Control
 * - Allows file selection without immediate upload
 * - Provides preview functionality
 * - Supports duplicate detection
 * - Uploads only when manually triggered (form submit)
 */
const MediaUpload = forwardRef<MediaUploadRef, MediaUploadProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      uploadPreset = 'ml_default',
      multiple = false,
      folder = 'uploads',
      maxFiles = 10,
      maxFileSize = 15000000, // 15MB
      allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
      className = '',
      placeholder = 'Ανεβάστε αρχεία',
      error,
      type = 'auto',
      signed = true,
      signatureEndpoint = '/api/sign-cloudinary-params',
    } = props;
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
    const widgetRef = useRef<any>(null);

    // Convert value to array for consistent handling
    const resources = React.useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    // For image-only uploads, restrict formats
    const formats =
      type === 'image' ? ['jpg', 'jpeg', 'png', 'webp'] : allowedFormats;
    const resourceType = type === 'image' ? 'image' : 'auto';

    // Generate unique file ID
    const generateFileId = (file: File) => {
      return `${file.name}-${file.size}-${file.lastModified}`;
    };

    // Check if file already exists (duplicate detection)
    const isFileExists = (file: File) => {
      const fileId = generateFileId(file);
      const existsInQueue = queuedFiles.some((qf) => qf.id === fileId);
      const existsInResources = resources.some(
        (r) => r.original_filename === file.name && r.bytes === file.size,
      );
      return existsInQueue || existsInResources;
    };

    // Handle file selection (no immediate upload)
    const handleFilesSelected = (files: FileList) => {
      const newFiles: QueuedFile[] = [];

      Array.from(files).forEach((file) => {
        // Check for duplicates
        if (isFileExists(file)) {
          // console.log(`File ${file.name} already exists, skipping`);
          return;
        }

        // Validate file using consolidated utility
        const allowedTypes: MediaType[] =
          type === 'image' ? ['image'] : ['image', 'video', 'audio'];
        const validation = validateFile(file, {
          allowedTypes,
          maxSizeMB: maxFileSize / (1024 * 1024),
          isProfileImage: !multiple && type === 'image',
        });

        if (!validation.isValid) {
          setUploadError(validation.error || 'Invalid file');
          return;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        const queuedFile: QueuedFile = {
          id: generateFileId(file),
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          isUploaded: false,
        };

        newFiles.push(queuedFile);
      });

      // Add to queue
      setQueuedFiles((prev) => {
        const updated = multiple ? [...prev, ...newFiles] : newFiles;
        return updated.slice(0, maxFiles); // Respect maxFiles limit
      });

      setUploadError(null);
    };

    // Manual upload function (called from parent form)
    const uploadFiles = async () => {
      if (queuedFiles.length === 0) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const uploadedResources: CloudinaryResource[] = [];

        for (const queuedFile of queuedFiles) {
          if (queuedFile.isUploaded) continue;

          // console.log(`Uploading ${queuedFile.name}...`);

          // Create FormData for Cloudinary upload
          const formData = new FormData();
          formData.append('file', queuedFile.file);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', folder);

          // Get signature for signed uploads
          let signatureData = null;
          if (signed) {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const paramsToSign = {
              timestamp,
              upload_preset: uploadPreset,
              folder,
            };

            const signatureResponse = await fetch(signatureEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paramsToSign }),
            });

            if (!signatureResponse.ok) {
              throw new Error('Failed to get upload signature');
            }

            signatureData = await signatureResponse.json();
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signatureData.signature);
            if (process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
              formData.append(
                'api_key',
                process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
              );
            }
          } else {
            // For unsigned uploads, don't add use_filename/unique_filename as they're not allowed
            // Cloudinary will generate unique filenames automatically
          }

          // Upload to Cloudinary
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          if (!cloudName) {
            throw new Error('Cloudinary cloud name not configured');
          }
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

          // console.log('Upload URL:', uploadUrl);
          // console.log('Resource Type:', resourceType);

          // Debug: Log all FormData entries
          // console.log('FormData entries:');
          // for (let [key, value] of formData.entries()) {
          // console.log(`${key}:`, value);
          // }

          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message ||
                `Upload failed for ${queuedFile.name}`,
            );
          }

          const cloudinaryResource = await response.json();
          // console.log('Cloudinary upload response:', cloudinaryResource);

          // Check for duplicates in Cloudinary response
          if (
            resources.some((r) => r.public_id === cloudinaryResource.public_id)
          ) {
            // console.log(
            //   `Duplicate found: ${cloudinaryResource.public_id}, skipping`,
            // );
            continue;
          }

          uploadedResources.push(cloudinaryResource);

          // Update the queued file as uploaded
          setQueuedFiles((prev) =>
            prev.map((qf) =>
              qf.id === queuedFile.id
                ? { ...qf, isUploaded: true, cloudinaryResource }
                : qf,
            ),
          );
        }

        // Update parent with uploaded resources
        const allResources = [...resources, ...uploadedResources];
        if (multiple) {
          onChange(allResources.length > 0 ? allResources : null);
        } else {
          onChange(allResources[0] || null);
        }

        // Clear uploaded files from queue after successful upload
        setQueuedFiles((prev) => prev.filter((qf) => !qf.isUploaded));
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadError(
          error instanceof Error
            ? error.message
            : 'Upload failed. Please try again.',
        );
      } finally {
        setIsUploading(false);
      }
    };

    // Remove file from queue
    const handleRemoveFromQueue = (fileId: string) => {
      setQueuedFiles((prev) => {
        const updated = prev.filter((qf) => qf.id !== fileId);
        // Clean up preview URL
        const removedFile = prev.find((qf) => qf.id === fileId);
        if (removedFile) {
          URL.revokeObjectURL(removedFile.preview);
        }
        return updated;
      });
    };

    // Remove uploaded resource
    const handleRemoveResource = (publicId: string) => {
      const filtered = resources.filter((r) => r.public_id !== publicId);
      if (multiple) {
        onChange(filtered.length > 0 ? filtered : null);
      } else {
        onChange(null);
      }
    };

    // Clear all queued files
    const clearQueue = () => {
      queuedFiles.forEach((qf) => URL.revokeObjectURL(qf.preview));
      setQueuedFiles([]);
      setUploadError(null);
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      uploadFiles,
      hasFiles: () => queuedFiles.length > 0,
      clearQueue,
    }));

    const totalFiles = resources.length + queuedFiles.length;
    const canAddMore = multiple ? totalFiles < maxFiles : totalFiles === 0;

    // Convert error to string if it's a FieldError object
    const errorMessage =
      typeof error === 'string'
        ? error
        : error?.message
          ? typeof error.message === 'string'
            ? error.message
            : String(error.message)
          : undefined;

    const displayError = errorMessage || uploadError;

    // Profile Image Mode (single file)
    if (!multiple) {
      return (
        <div className={`col-xl-7 mb-5 ${className}`}>
          <div className='flex items-center space-x-5 mb-2'>
            {/* Profile Image Display */}
            <div
              className='flex-shrink-0 cursor-pointer'
              onClick={() =>
                !isUploading &&
                (
                  document.querySelector(
                    'input[type="file"]',
                  ) as HTMLInputElement
                )?.click()
              }
            >
              {queuedFiles.length > 0 || resources.length > 0 ? (
                <div className='relative'>
                  {queuedFiles.length > 0 ? (
                    <img
                      src={queuedFiles[0].preview}
                      alt={queuedFiles[0].name}
                      className='w-[71px] h-[71px] rounded-lg object-cover border-2 border-gray-200'
                    />
                  ) : resources.length > 0 && resources[0].public_id ? (
                    <CldImage
                      width={71}
                      height={71}
                      src={resources[0].public_id}
                      alt='Profile image'
                      className='w-[71px] h-[71px] rounded-lg object-cover border-2 border-gray-200'
                    />
                  ) : (
                    <div className='w-[71px] h-[71px] rounded-full bg-gray-200 flex items-center justify-center'>
                      <Upload className='w-6 h-6 text-gray-400' />
                    </div>
                  )}
                </div>
              ) : (
                <div className='w-[71px] h-[71px] rounded-lg bg-secondary/5 hover:bg-secondary/10 flex items-center justify-center border-2 border-dashed border-primary/60 hover:border-primary/90 transition-colors'>
                  <Upload className='w-6 h-6 text-primary/60' />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className='flex-1'>
              <div className='flex flex-col'>
                <div className='flex items-center'>
                  <label className='cursor-pointer'>
                    <input
                      type='file'
                      accept={generateAcceptString(
                        type === 'image'
                          ? (['image'] as MediaType[])
                          : (['image', 'video', 'audio'] as MediaType[]),
                        !multiple && type === 'image',
                      )}
                      className='hidden'
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFilesSelected(e.target.files);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <span className='inline-flex items-center px-6 py-1.5 bg-[#fbf7ed] hover:bg-[#f5f0e3] text-[#1f4b3f] font-medium text-sm rounded transition-colors'>
                      <Upload className='w-4 h-4 mr-2' />
                      {queuedFiles.length > 0 || resources.length > 0
                        ? 'Αλλαγή Εικόνας'
                        : 'Μεταφόρτωση Εικόνας'}
                    </span>
                  </label>
                  {(queuedFiles.length > 0 || resources.length > 0) && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='ml-2 text-red-600 hover:text-red-700 hover:bg-red-50'
                      onClick={() => {
                        if (queuedFiles.length > 0) {
                          handleRemoveFromQueue(queuedFiles[0].id);
                        } else if (resources.length > 0) {
                          handleRemoveResource(resources[0].public_id || '');
                        }
                      }}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              </div>
              <p className='text-xs text-gray-600 mt-2 max-w-md'>
                Μέγιστο μέγεθος αρχείου: {Math.round(maxFileSize / 1024 / 1024)}
                MB, Ελάχιστες διαστάσεις: 80x80.
                <br />
                Επιτρεπόμενοι τύποι αρχείων: {formats.join(', ')}
              </p>
            </div>
          </div>

          {/* Upload Status */}
          {isUploading && (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='w-5 h-5 animate-spin text-[#1f4b3f] mr-2' />
              <span className='text-[#1f4b3f] font-medium'>Uploading...</span>
            </div>
          )}

          {/* Error Display */}
          {displayError && (
            <div className='mt-2'>
              <p className='text-red-600 text-sm'>{displayError}</p>
            </div>
          )}
        </div>
      );
    }

    // Gallery Mode (multiple files)
    return (
      <div
        className={`bg-secondary/5 hover:bg-secondary/10 border-2 border-dashed border-primary/60 hover:border-primary/90 transition-colors rounded-xl p-8 mb-8 shadow-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      >
        {/* Dropzone */}
        <div className='relative'>
          <input
            type='file'
            accept={generateAcceptString(
              type === 'image'
                ? (['image'] as MediaType[])
                : (['image', 'video', 'audio'] as MediaType[]),
              !multiple && type === 'image',
            )}
            multiple={multiple}
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files);
              }
            }}
            className='hidden'
            disabled={!canAddMore || isUploading}
            ref={(input) => {
              if (input) {
                (window as any).portfolioFileInput = input;
              }
            }}
          />

          <div
            className='relative w-full text-center cursor-pointer'
            onClick={() => {
              if (canAddMore && !isUploading) {
                (window as any).portfolioFileInput?.click();
              }
            }}
          >
            <span className='text-3xl mb-4 block'>📁</span>

            <div className='mt-2'>
              {totalFiles === 0 ? (
                <p className='text-sm mb-0 text-gray-700'>Επιλογή αρχείων</p>
              ) : (
                <p className='text-sm text-gray-700'>
                  Έχετε επιλέξει {totalFiles}{' '}
                  {totalFiles === 1 ? 'αρχείο' : 'αρχεία'}
                </p>
              )}
              {totalFiles < 1 && (
                <p className='text-base mb-1 mt-1 text-gray-600'>
                  Σύρετε τα αρχεία σας εδώ, ή κάντε κλικ για να τα επιλέξετε
                </p>
              )}

              <div className='mt-3 space-y-1'>
                <p className='text-xs mb-0 text-gray-600'>
                  Το μέγιστο επιτρεπτό μέγεθος αρχείων είναι{' '}
                  <span className='font-semibold'>
                    {Math.round(maxFileSize / 1024 / 1024)}MB
                  </span>{' '}
                  (Τρέχον μέγεθος:{' '}
                  <span className='font-semibold'>
                    {(
                      queuedFiles.reduce((sum, f) => sum + f.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}
                    MB
                  </span>
                  )
                </p>
                <p className='text-xs mb-0 text-gray-600'>
                  Μέχρι <span className='font-semibold'>{maxFiles}</span> αρχεία
                  βίντεο / ήχου
                </p>
                <p className='text-xs mb-0 text-gray-500'>
                  Υποστηριζόμενοι τύποι: {formats.join(', ')}
                </p>
                <div
                  className='text-red-600 text-xs'
                  style={{ height: '10px' }}
                >
                  {displayError || ' '}
                </div>
              </div>

              {/* Gallery Grid - Inside Green Section */}
              {(queuedFiles.length > 0 || resources.length > 0) && (
                <div
                  className='flex flex-wrap justify-center gap-4 w-full mt-6'
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Queued Files */}
                  {queuedFiles.map((queuedFile) => (
                    <div
                      key={queuedFile.id}
                      className='relative flex items-center transition-all duration-300 ease-in-out hover:scale-105 z-20'
                    >
                      <div
                        className='relative overflow-hidden rounded border bg-white'
                        style={{ width: '190px', height: '166px' }}
                      >
                        {/* File Preview */}
                        {getMediaType(queuedFile.file) === 'image' ? (
                          <img
                            src={queuedFile.preview}
                            alt={queuedFile.name}
                            className='object-cover w-full h-full'
                          />
                        ) : getMediaType(queuedFile.file) === 'video' ? (
                          <div className='relative w-full h-full bg-black'>
                            <video
                              src={queuedFile.preview}
                              className='object-cover w-full h-full'
                              controls
                              preload='metadata'
                              playsInline
                            >
                              <span className='text-white'>
                                Video cannot be played
                              </span>
                            </video>
                            <div className='absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center'>
                              <Video className='w-3 h-3 mr-1' />
                              Video
                            </div>
                          </div>
                        ) : (
                          <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100'>
                            <div className='bg-white p-4 rounded-full shadow-lg mb-3'>
                              <Music className='w-8 h-8 text-purple-600' />
                            </div>
                            <div className='w-full text-center px-2'>
                              <p className='text-sm font-medium text-gray-700 mb-2 truncate w-full'>
                                {queuedFile.name.replace(/\.[^/.]+$/, '')}
                              </p>
                              <audio
                                controls
                                className='w-full h-8'
                                preload='metadata'
                              >
                                <source
                                  src={queuedFile.preview}
                                  type={queuedFile.type}
                                />
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          </div>
                        )}

                        {/* Delete Button - Always Visible */}
                        <button
                          className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-md text-sm z-40'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromQueue(queuedFile.id);
                          }}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Uploaded Resources */}
                  {resources.map((resource, index) => (
                    <div
                      key={resource.public_id || `resource-${index}`}
                      className='relative flex items-center transition-all duration-300 ease-in-out hover:scale-105 z-20'
                    >
                      <div
                        className='relative overflow-hidden rounded border bg-white'
                        style={{ width: '190px', height: '166px' }}
                      >
                        {/* Resource Preview */}
                        {getCloudinaryMediaType(resource) === 'image' &&
                        resource.public_id ? (
                          <CldImage
                            width={190}
                            height={166}
                            src={resource.public_id}
                            alt='Uploaded image'
                            className='object-cover w-full h-full'
                          />
                        ) : getCloudinaryMediaType(resource) === 'video' ? (
                          <div className='relative w-full h-full bg-black'>
                            <video
                              className='object-cover w-full h-full'
                              controls
                              preload='metadata'
                              playsInline
                            >
                              <source
                                src={resource.secure_url}
                                type={`video/${resource.format}` || 'video/mp4'}
                              />
                              <span className='text-white'>
                                Video cannot be played
                              </span>
                            </video>
                            <div className='absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center'>
                              <Video className='w-3 h-3 mr-1' />
                              Video
                            </div>
                          </div>
                        ) : (
                          <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100'>
                            <div className='bg-white p-4 rounded-full shadow-lg mb-3'>
                              <Music className='w-8 h-8 text-purple-600' />
                            </div>
                            <div className='w-full text-center px-2'>
                              <p className='text-sm font-medium text-gray-700 mb-2 truncate w-full'>
                                {getResourceDisplayName(resource)}
                              </p>
                              <audio
                                controls
                                className='w-full h-8'
                                preload='metadata'
                              >
                                <source
                                  src={resource.secure_url}
                                  type={
                                    `audio/${resource.format}` || 'audio/mpeg'
                                  }
                                />
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          </div>
                        )}

                        {/* Uploaded Status Badge */}
                        <div
                          className={`absolute ${getCloudinaryMediaType(resource) === 'video' ? 'bottom-2 left-2' : 'top-2 left-2'} bg-green-500 text-white text-xs px-2 py-1 rounded`}
                        >
                          Uploaded
                        </div>

                        {/* Delete Button - Always Visible */}
                        <button
                          className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-md text-sm z-40'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveResource(
                              resource.public_id || `resource-${index}`,
                            );
                          }}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className='flex items-center justify-center py-6 mt-6'>
            <Loader2 className='w-5 h-5 animate-spin text-[#1f4b3f] mr-2' />
            <span className='text-[#1f4b3f] font-medium'>
              Uploading files...
            </span>
          </div>
        )}
      </div>
    );
  },
);

MediaUpload.displayName = 'MediaUpload';

export default MediaUpload;
