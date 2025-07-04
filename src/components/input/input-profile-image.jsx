'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

import { InitialsImage } from '@/components/parts';
import {
  validateFileType,
  SUPPORTED_FORMATS,
  generateAcceptString,
} from '@/utils/media-validation';

export default function ProfileImageInput({
  image,
  name,
  onChange,
  errors,
  displayName,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const [error, setError] = useState(null);

  // Clear error after 3 seconds
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clean up blob URL when component unmounts or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      // File size validation (3MB limit)
      const fileSize = file.size / (1024 * 1024);

      if (fileSize > 3) {
        setError('Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 3MB');
        return;
      }
      // Enhanced file validation using utility for profile images (restricted)
      const validation = validateFileType(file, ['image'], true);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      // Additional size check (3MB limit for profile images)
      if (fileSize > 3) {
        setError('Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 3MB');
        return;
      }

      // Clean up previous blob URL
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create blob URL with error handling for iOS Safari
      try {
        const blob = URL.createObjectURL(file);
        setPreviewUrl(blob);
        setError('');
        onChange(file);
      } catch (error) {
        // Fallback for iOS Safari blob URL issues
        console.error('Blob URL creation failed:', error);
        setError('');
        onChange(file);
        // Use FileReader as fallback for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageClick = () => {
    const fileInput = document.querySelector(`input[name="${name}"]`);

    if (fileInput) {
      fileInput.click();
    }
  };

  // Get image source - either the preview URL, passed URL, or default
  const getImageSource = () => {
    if (previewUrl) {
      return previewUrl;
    }
    if (image) {
      return image;
    }

    return null;
  };

  // Determine if there's a current image
  const hasImage = Boolean(image || previewUrl);

  return (
    <div className='col-xl-7 mb20'>
      <div className='profile-box d-sm-flex align-items-center mb10'>
        <div
          className='profile-img mb20-sm cursor-pointer'
          onClick={handleImageClick}
        >
          {getImageSource() ? (
            <Image
              height={142}
              width={142}
              className='rounded-circle'
              src={getImageSource()}
              style={{
                height: '71px',
                width: '71px',
                objectFit: 'cover',
              }}
              alt='Εικόνα προφίλ'
            />
          ) : (
            <InitialsImage
              displayName={displayName}
              width='71px'
              height='71px'
            />
          )}
        </div>
        <div className='profile-content ml20 ml0-xs'>
          <div className='d-flex flex-column'>
            <div className='d-flex align-items-center'>
              <label className='mb0'>
                <input
                  name={name}
                  type='file'
                  accept={generateAcceptString(['image'], true)}
                  className='d-none'
                  onChange={handleImageChange}
                />
                <a className='upload-btn cursor-pointer'>
                  <span className='flaticon-photo-camera mr5'></span>
                  {hasImage ? 'Αλλαγή Εικόνας' : 'Μεταφόρτωση Εικόνας'}
                </a>
              </label>
            </div>
          </div>
          <p className='text fz13 mb-0 mt-2' style={{ maxWidth: '400px' }}>
            Μέγιστο μέγεθος αρχείου: 3MB, Ελάχιστες διαστάσεις: 80x80.
            Επιτρεπόμενοι τύποι αρχείων:{' '}
            {SUPPORTED_FORMATS.profileImage.displayFormats.join(', ')}
          </p>
        </div>
      </div>
      {errors?.field === name || error ? (
        <div>
          <p className='text-danger mb0 pb0'>{errors?.message || error}</p>
        </div>
      ) : null}
    </div>
  );
}
