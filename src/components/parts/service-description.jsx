import React from 'react';

import { formatDescription } from '@/utils/formatDescription';

import Features from './service-features';

export default function Description({
  description,
  tags,
  contactTypes,
  payment_methods,
  settlement_methods,
}) {
  if (!description) {
    return;
  }

  const formattedDescription = formatDescription(description);

  return (
    <div className='px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'>
      <h4>Περιγραφή</h4>
      <div className='text mb30 rich-text-editor'>
        <div className='freelancer-description text mb30'>
          {formattedDescription}
        </div>
        {/* <BlocksRenderer content={service.description} /> */}
        {tags.length > 0 && (
          <div className='list1 pt20 pb20'>
            <h6 style={{ color: '#6c757d', fontWeight: 600 }}>
              Χαρακτηριστικά
            </h6>
            <ul className='tags'>
              {tags.map((tag, i) => (
                <li key={i}>
                  <p>{tag.attributes.label}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Features
          contactTypes={contactTypes?.data}
          payment_methods={payment_methods?.data}
          settlement_methods={settlement_methods?.data}
        />
      </div>
    </div>
  );
}
