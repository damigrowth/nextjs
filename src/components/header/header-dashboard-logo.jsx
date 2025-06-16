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
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
            alt='logo'
          />
        </div>
      ) : (
        <Link href='/' className='logo'>
          <Image
            height={40}
            width={133}
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
            alt='logo'
          />
        </Link>
      )}
    </div>
  );
}
