'use client';

import React, { useState } from 'react';
import {
  IconFacebookF,
  IconLinkedinIn,
  IconEnvelope,
  IconLink,
} from '@/components/icon/fa';

import SaveForm from '../form/form-save';

export default function BreadcrumbButtons({
  subjectTitle,
  id,
  savedStatus,
  saveType,
  hideSaveButton,
  isAuthenticated,
}) {
  const [shareToggle, setShareToggle] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShareClick = (platform) => {
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          currentUrl,
        )}`;
        window.open(shareUrl, '_blank');
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          subjectTitle,
        )}&body=${encodeURIComponent(currentUrl)}`;
        window.location.href = shareUrl;
        break;
      case 'copy':
        navigator.clipboard.writeText(currentUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className='d-flex align-items-center justify-content-sm-end'>
      <a
        onClick={() => setShareToggle(!shareToggle)}
        className='position-relative ui-share-toggle'
      >
        <div
          className={`share-save-widget d-flex align-items-center ${shareToggle ? 'active' : ''}`}
        >
          <span className='icon flaticon-share dark-color fz12 mr10' />
          <div className='h6 mb-0'>Κοινοποίηση</div>
        </div>
        {shareToggle && (
          <div className='ui-social-media'>
            <a onClick={() => handleShareClick('facebook')}>
              <IconFacebookF />
            </a>
            <a onClick={() => handleShareClick('linkedin')}>
              <IconLinkedinIn />
            </a>
            <a onClick={() => handleShareClick('email')}>
              <IconEnvelope />
            </a>
            <a onClick={() => handleShareClick('copy')}>
              <IconLink />
            </a>
          </div>
        )}
      </a>
      {!hideSaveButton && (
        <SaveForm
          type={saveType}
          id={id}
          variant='text'
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
