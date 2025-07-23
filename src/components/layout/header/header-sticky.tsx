'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

// import useStickyMenu from '@/hooks/useStickyMenu';

export default function HeaderStickyWrapper({ children }) {
  // const sticky = useStickyMenu(70);

  const pathname = usePathname();

  return (
    <header
      className={`
        bg-white border-0 py-2 
        ${pathname === '/' ? 'fixed' : 'relative'} 
        ${pathname === '/' ? 'bg-transparent border-b border-white/10' : 'bg-white'}
        animate-slide-in-down fixed top-0 bg-white border-b border-gray-200 shadow-lg 
        transition-all duration-300 ease-in-out w-full z-10
      `}
    >
      {children}
    </header>
    // <header
    //   className={`
    //     bg-white border-0 py-2
    //     ${pathname === '/' ? 'fixed' : 'relative'}
    //     ${pathname === '/' ? 'bg-transparent border-b border-white/10' : 'bg-white'}
    //     ${sticky ?
    //       'animate-slide-in-down fixed top-0 bg-white border-b border-gray-200 shadow-lg z-10' :
    //       'animate-slide-in'
    //     }
    //     transition-all duration-300 ease-in-out w-full z-10
    //   `}
    // >
    //   {children}
    // </header>
  );
}
