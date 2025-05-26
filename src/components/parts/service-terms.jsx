import React from 'react';

import { formatDescription } from '@/utils/formatDescription';

export default function Terms({ heading, text }) {
  if (!text) {
    return null;
  } else {
    const formattedDescription = formatDescription(text);

    return (
      <div className='px30 mt40 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'>
        <h4>{heading}</h4>
        <div className='text mb30 rich-text-editor'>
          <div className='freelancer-description text mb30'>
            {formattedDescription}
          </div>
        </div>
      </div>
    );
  }
}
