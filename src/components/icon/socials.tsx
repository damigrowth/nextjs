import React from 'react';
import {
  IconLinkedinIn,
  IconFacebookF,
  IconTwitter,
  IconInstagram,
} from '@/components/icon/fa';

export default function Socials() {
  return (
    <div className='social-widget'>
      <a
        href='https://www.linkedin.com/company/doulitsa'
        className='fz18 text-white'
        target='_blank'
        rel='noopener'
      >
        <IconLinkedinIn className='list-inline-item' />
      </a>
      <h5 className='text-white'>Βρες μας στο Linkedin </h5>
      <div className='social-style1'>
        {/* <a>
          <IconFacebookF className="list-inline-item" />
        </a>
        <a>
          <IconTwitter className="list-inline-item" />
        </a>
        <a>
          <IconInstagram className="list-inline-item" />
        </a> */}
      </div>
    </div>
  );
}
