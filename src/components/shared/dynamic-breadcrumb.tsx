import React from 'react';
import LinkNP from '@/components/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import BreadcrumbButtons from './breadcrumb-buttons';

export interface BreadcrumbSegment {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface DynamicBreadcrumbProps {
  segments: BreadcrumbSegment[];
  buttons?: {
    subjectTitle: string;
    id: string | number;
    savedStatus?: boolean;
    saveType?: string;
    hideSaveButton?: boolean;
    isAuthenticated?: boolean;
  };
  className?: string;
}

export default function DynamicBreadcrumb({
  segments,
  buttons,
  className = '',
}: DynamicBreadcrumbProps) {
  return (
    <section className={`py-4 ${className}`}>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap items-center'>
          <div className={buttons ? 'w-full sm:w-8/12 lg:w-10/12' : 'w-full'}>
            <div className='mb-2 sm:mb-0'>
              <Breadcrumb>
                <BreadcrumbList>
                  {segments.map((segment, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {segment.isCurrentPage ? (
                          <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                        ) : segment.href ? (
                          <BreadcrumbLink asChild>
                            <LinkNP href={segment.href}>
                              <span className='text-muted-foreground'>
                                {segment.label}
                              </span>
                            </LinkNP>
                          </BreadcrumbLink>
                        ) : (
                          <span className='text-muted-foreground'>
                            {segment.label}
                          </span>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {buttons && (
            <div className='w-full sm:w-4/12 lg:w-2/12'>
              <div className='flex items-center justify-end'>
                <BreadcrumbButtons {...buttons} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}