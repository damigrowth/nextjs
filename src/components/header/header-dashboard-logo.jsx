import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderDashboardLogo({ notClickable }) {
  return (
    <div className='dashboard_header_logo position-relative me-2 me-xl-5'>
      {notClickable ? (
        <div className='logo'>
          <Image
            height={40}
            width={133}
            src='/images/doulitsa-logo.svg'
            alt='logo'
          />
        </div>
      ) : (
        <Link href='/' className='logo'>
          <Image
            height={40}
            width={133}
            src='/images/doulitsa-logo.svg'
            alt='logo'
          />
        </Link>
      )}
    </div>
  );
}
