'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import useArchiveStore from '@/stores/archive/archiveStore';

export default function Body({ children }) {
  const { filtersModalToggled } = useArchiveStore();

  const path = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getBodyClasses = () => {
    // Allow basic classes even before mounting for LCP
    const basicClasses = path.startsWith('/connect') ||
      path.startsWith('/auth') ||
      path === '/register' ||
      path === '/register/success' ||
      path == '/email-confirmation' ||
      path === '/login'
        ? 'bgc-thm4 mm-wrapper mm-wrapper--position-left-front'
        : '';
    
    if (!mounted) {
      return basicClasses; // Return basic classes before full mounting
    }

    return `${basicClasses} ${filtersModalToggled ? 'menu-hidden-sidebar-content' : ''} ${
      path.startsWith('/dashboard') ? '' : ''
    }`;
  };

  return (
    <body suppressHydrationWarning className={getBodyClasses()}>
      {/* CRITICAL CHANGE: Always render children, but add data-mounted attribute */}
      <div data-mounted={mounted}>
        {children}
      </div>
    </body>
  );
}
