import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderLogo() {
  return (
    <div className='logos'>
      <Link className='header-logo logo1' href='/'>
        <Image
          width={133}
          height={40}
          src='/images/doulitsa-logo.svg'
          alt='Doulitsa Logo'
          unoptimized
          priority
        />
      </Link>
      <Link className='header-logo logo2' href='/'>
        <Image
          width={133}
          height={40}
          src='/images/doulitsa-logo.svg'
          alt='Doulitsa Logo'
          unoptimized
          priority
        />
      </Link>
    </div>
  );
}
