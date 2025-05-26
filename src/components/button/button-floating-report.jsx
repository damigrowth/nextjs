'use client';

import React, { useEffect, useState } from 'react';

export default function ReportIssueFloatingButton() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      setIsScrolled(scrollTop > 200);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <a
      className='scrollToHome show'
      style={{ bottom: isScrolled ? '110px' : '45px', cursor: 'pointer' }}
      data-bs-toggle='modal'
      data-bs-target='#reportIssueModal'
    >
      <i className='fas fa-flag' />
    </a>
  );
}
