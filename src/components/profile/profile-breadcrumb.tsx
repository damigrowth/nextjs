import React from 'react';
import NextLink from '@/components/shared/next-link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

import BreadcrumbButtons from '../shared/breadcrumb-buttons';
import { ProfileBreadcrumbProps } from '@/lib/types';

export default function ProfileBreadcrumb({
  profile,
  category,
  subcategory,
}: ProfileBreadcrumbProps) {
  const parentSlug = profile.role === 'company' ? 'companies' : 'pros';

  return (
    <section className='py-4'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap items-center'>
          <div className='w-full sm:w-8/12 lg:w-10/12'>
            <div className='mb-2 sm:mb-0'>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <NextLink href='/'>Αρχική</NextLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator />

                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <NextLink href={`/${parentSlug}`}>
                        <span className='text-muted-foreground'>
                          {profile.role === 'company'
                            ? 'Επιχειρήσεις'
                            : 'Επαγγελματίες'}
                        </span>
                      </NextLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {category && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <NextLink href={`/${parentSlug}/${category.slug}`}>
                            <span className='text-muted-foreground'>
                              {category.plural || category.label}
                            </span>
                          </NextLink>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}

                  {subcategory && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {subcategory.plural || subcategory.label}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className='w-full sm:w-4/12 lg:w-2/12'>
            <div className='flex items-center justify-end'>
              <BreadcrumbButtons
                subjectTitle={profile.displayName}
                id={profile.id}
                saveType='profile'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
