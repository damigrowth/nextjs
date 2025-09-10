import React from 'react';
import { Icon } from '@/components/icon/brands';

export default function Socials() {
  return (
    <div className='social-widget'>
      <a
        href='https://www.linkedin.com/company/doulitsa'
        className='text-lg text-white hover:text-green-400 transition-colors'
        target='_blank'
        rel='noopener'
      >
        <Icon name='linkedin' size={18} className='inline-block' />
      </a>
      <h5 className='text-white text-xl font-medium mt-2'>Βρες μας στο Linkedin </h5>
      <div className='social-style1 flex space-x-3 mt-3'>
        {/* <a className='text-white hover:text-green-400 transition-colors'>
          <Icon name="facebook" size={18} />
        </a>
        <a className='text-white hover:text-green-400 transition-colors'>
          <Icon name="twitter" size={18} />
        </a>
        <a className='text-white hover:text-green-400 transition-colors'>
          <Icon name="instagram" size={18} />
        </a> */}
      </div>
    </div>
  );
}
