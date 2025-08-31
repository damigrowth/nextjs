'use client';

import React, { memo } from 'react';
import { CldImage } from 'next-cloudinary';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  isPendingResource,
  generateAcceptString,
  MediaType
} from '@/lib/utils/media';
import { ProfileImageUploadProps } from '@/lib/types/components';

const ProfileImageUpload = memo<ProfileImageUploadProps>(({
  resource,
  queuedFile,
  onFileSelect,
  onRemove,
  isUploading,
  error,
  maxFileSize,
  formats,
  className = ''
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelect(e.target.files);
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fileInput?.click();
    }
  };

  const renderProfileImage = () => {
    if (queuedFile) {
      return (
        <img
          src={queuedFile.preview}
          alt={queuedFile.name}
          className="w-[71px] h-[71px] rounded-lg object-cover border-2 border-gray-200"
        />
      );
    }
    
    if (resource) {
      const isPending = isPendingResource(resource);
      
      return isPending || !resource.public_id ? (
        <img
          src={resource.secure_url}
          alt={resource.original_filename || 'Profile image'}
          className="w-[71px] h-[71px] rounded-lg object-cover border-2 border-gray-200"
        />
      ) : (
        <CldImage
          width={71}
          height={71}
          src={resource.public_id}
          alt="Profile image"
          className="w-[71px] h-[71px] rounded-lg object-cover border-2 border-gray-200"
        />
      );
    }
    
    return (
      <div className="w-[71px] h-[71px] rounded-lg bg-secondary/5 hover:bg-secondary/10 flex items-center justify-center border-2 border-dashed border-primary/60 hover:border-primary/90 transition-colors">
        <Upload className="w-6 h-6 text-primary/60" />
      </div>
    );
  };

  const hasImage = queuedFile || resource;

  return (
    <div className={`col-xl-7 mb-5 ${className}`}>
      <div className="flex items-center space-x-5 mb-2">
        {/* Profile Image Display */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="relative">
            {renderProfileImage()}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={generateAcceptString(['image'] as MediaType[], true)}
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                <span className="inline-flex items-center px-6 py-1.5 bg-[#fbf7ed] hover:bg-[#f5f0e3] text-[#1f4b3f] font-medium text-sm rounded transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  {hasImage ? 'Αλλαγή Εικόνας' : 'Μεταφόρτωση Εικόνας'}
                </span>
              </label>
              {hasImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onRemove}
                  disabled={isUploading}
                  aria-label="Remove profile image"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 max-w-md">
            Μέγιστο μέγεθος αρχείου: {Math.round(maxFileSize / 1024 / 1024)}
            MB, Ελάχιστες διαστάσεις: 80x80.
            <br />
            Επιτρεπόμενοι τύποι αρχείων: {formats.join(', ')}
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#1f4b3f] mr-2" />
          <span className="text-[#1f4b3f] font-medium">Uploading...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-2">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
});

ProfileImageUpload.displayName = 'ProfileImageUpload';

export default ProfileImageUpload;