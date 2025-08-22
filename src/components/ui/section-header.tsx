import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  description?: string;
  linkHref?: string;
  linkText?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  linkHref,
  linkText,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 ${className}`}>
      {/* Left Side - Title & Description */}
      <div className='flex-1 lg:max-w-2xl'>
        <h2 className='text-xl lg:text-2xl font-bold text-gray-900 mb-3'>
          {title}
        </h2>
        {description && (
          <p className='text-gray-600 font-sans'>
            {description}
          </p>
        )}
      </div>

      {/* Right Side - Link Button */}
      {linkHref && linkText && (
        <div className='flex-shrink-0'>
          <div className='text-left lg:text-right mb-4 lg:mb-2'>
            <Button
              asChild
              variant='link'
              className='text-gray-800 hover:text-primary hover:no-underline'
            >
              <Link
                href={linkHref}
                className='inline-flex items-center gap-2'
              >
                {linkText}
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}