'use client';

import React from 'react';
import Image from 'next/image';
import NextLink from '@/components/shared/next-link';
import { usePathname } from 'next/navigation';
// import useStickyMenu from '@/hooks/useStickyMenu';

export default function HeaderLogo() {
  // const pathname = usePathname();
  // const sticky = useStickyMenu(70);

  // Determine which logo to show based on sticky state and pathname
  // const isHomepage = pathname === '/';
  // const showStickyLogo = sticky && isHomepage;

  return (
    <div className='logos'>
      {/* Logo1 - visible by default, hidden when sticky on homepage */}
      <NextLink
        className={`header-logo logo1 transition-opacity duration-300 opacity-100`}
        href='/'
      >
        <Image
          width={133}
          height={40}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1761929834/Static/doulitsa-logo_mpqr5n.svg'
          alt='Doulitsa Logo'
          unoptimized
          priority
          loading='eager'
        />
      </NextLink>
      {/* Logo2 - hidden by default, visible when sticky on homepage */}
    </div>
    // <div className='logos'>
    //   {/* Logo1 - visible by default, hidden when sticky on homepage */}
    //   <LinkNP
    //     className={`header-logo logo1 transition-opacity duration-300 ${
    //       showStickyLogo ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
    //     }`}
    //     href='/'
    //   >
    //     <Image
    //       width={133}
    //       height={40}
    //       src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1761929834/Static/doulitsa-logo_mpqr5n.svg'
    //       alt='Doulitsa Logo'
    //       unoptimized
    //       priority
    //       loading='eager'
    //     />
    //   </LinkNP>
    //   {/* Logo2 - hidden by default, visible when sticky on homepage */}
    //   <LinkNP
    //     className={`header-logo logo2 transition-opacity duration-300 ${
    //       showStickyLogo ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
    //     }`}
    //     href='/'
    //   >
    //     <Image
    //       width={133}
    //       height={40}
    //       src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1761929834/Static/doulitsa-logo_mpqr5n.svg'
    //       alt='Doulitsa Logo'
    //       unoptimized
    //       priority
    //       loading='eager'
    //     />
    //   </LinkNP>
    // </div>
  );
}
