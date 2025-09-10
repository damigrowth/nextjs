'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ContactRevealProps {
  /** Contact type (phone or email) */
  type: 'phone' | 'email';
  /** The contact value to reveal */
  value: string;
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Custom reveal button text */
  revealText?: string;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Client-side component for revealing contact information
 * Handles analytics tracking and state management for contact reveals
 */
export default function ContactReveal({
  type,
  value,
  initialVisible = false,
  revealText = 'Προβολή',
  className = '',
}: ContactRevealProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  // Track contact reveals with analytics
  const handleReveal = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'reveal_contact', {
        event_category: 'Contact',
        event_label: type,
        value: 1,
      });
    }
    setIsVisible(true);
  };

  if (isVisible) {
    if (type === 'phone') {
      return (
        <a
          href={`tel:${value}`}
          className={`text-sm text-primary hover:underline ${className}`}
        >
          {value}
        </a>
      );
    } else {
      return (
        <a
          href={`mailto:${value}`}
          className={`text-sm text-primary hover:underline ${className}`}
          title={value}
        >
          {value}
        </a>
      );
    }
  }

  return (
    <Button
      variant='link'
      size='sm'
      onClick={handleReveal}
      className='h-auto p-0 text-sm text-green-600 hover:text-green-700'
    >
      {revealText}
    </Button>
  );
}