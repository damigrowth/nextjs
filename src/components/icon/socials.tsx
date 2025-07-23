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
        className='text-lg text-white hover:text-green-400 transition-colors'
        target='_blank'
        rel='noopener'
      >
        <IconLinkedinIn className='inline-block' />
      </a>
      <h5 className='text-white text-xl font-medium mt-2'>Βρες μας στο Linkedin </h5>
      <div className='social-style1 flex space-x-3 mt-3'>
        {/* <a className='text-white hover:text-green-400 transition-colors'>
          <IconFacebookF className="text-lg" />
        </a>
        <a className='text-white hover:text-green-400 transition-colors'>
          <IconTwitter className="text-lg" />
        </a>
        <a className='text-white hover:text-green-400 transition-colors'>
          <IconInstagram className="text-lg" />
        </a> */}
      </div>
    </div>
  );
}
