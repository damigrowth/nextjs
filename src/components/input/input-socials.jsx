import React from 'react';

import { InputB } from '@/components/input';

const SocialsInputs = ({ data = {}, username, onChange, errors }) => {
  const socialPlatforms = {
    facebook: {
      label: 'Facebook',
      icon: 'facebook-f',
      placeholder: 'https://facebook.com/',
    },
    instagram: {
      label: 'Instagram',
      icon: 'instagram',
      placeholder: 'https://instagram.com/',
    },
    linkedin: {
      label: 'LinkedIn',
      icon: 'linkedin-in',
      placeholder: 'https://linkedin.com/',
    },
    x: {
      label: 'X',
      icon: 'x',
      placeholder: 'https://x.com/',
    },
    youtube: {
      label: 'YouTube',
      icon: 'youtube',
      placeholder: 'https://youtube.com/@',
    },
    github: {
      label: 'GitHub',
      icon: 'github',
      placeholder: 'https://github.com/',
    },
    behance: {
      label: 'Behance',
      icon: 'behance',
      placeholder: 'https://behance.net/',
    },
    dribbble: {
      label: 'Dribbble',
      icon: 'dribbble',
      placeholder: 'https://dribbble.com/',
    },
  };

  const handleInputChange = (platform, url) => {
    const newUrl = url.trim() === '' ? null : url.trim(); // Convert empty strings to null

    onChange(platform, newUrl);
  };

  return (
    <div className='row'>
      {Object.entries(socialPlatforms).map(([platform, config]) => (
        <div key={platform} className='col-md-3 mb-3'>
          <InputB
            label={config.label}
            id={platform}
            name={platform}
            type='url'
            value={data?.[platform]?.url || ''}
            onChange={(value) => handleInputChange(platform, value)}
            placeholder={`${config.placeholder}username`}
            className='form-control'
            errors={
              errors && { field: platform, message: errors[platform]?.message }
            }
            icon={`fab fa-${config.icon}`}
          />
        </div>
      ))}
    </div>
  );
};

export default SocialsInputs;
