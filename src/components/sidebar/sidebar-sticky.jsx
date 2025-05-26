'use client';

import React, { useEffect, useState } from 'react';
import Sticky from 'react-stickynode';

export default function StickySidebar({ children, mobileContent }) {
  const [isEnabled, setIsEnabled] = useState(true);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;

      setIsMobile(mobile);
      setIsEnabled(!mobile);
    };

    // Initial check
    handleResize();
    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // For mobile, render nothing here as the content is rendered elsewhere
  if (isMobile) {
    return null;
  }

  // For desktop, render the sticky sidebar
  return (
    <div className='col-lg-4 service-sidebar'>
      <Sticky enabled={isEnabled} top={10} bottomBoundary='.col-lg-8'>
        <div className='blog-sidebar ms-lg-auto column'>{children}</div>
      </Sticky>
    </div>
  );
}
