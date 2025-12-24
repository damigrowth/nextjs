import React from 'react';
import Image from 'next/image';
import NextLink from '@/components/shared/next-link';

import {
  accountLinks,
  firstColumnLinks,
  proLinks,
  secondColumnLinks,
} from '@/constants/datasets/footer';

import Socials from '@/components/icon/socials';

export default function Footer() {
  return (
    <footer className='bg-dark pb-0 pt-[60px]'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-6'>
            <div className='footer-widget mb-4 lg:mb-5'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 justify-between'>
                <div>
                  <div className='link-style1 mb-3'>
                    <h3 className='mb-3 text-white font-semibold'>
                      <NextLink
                        href={'/about'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Σχετικά
                      </NextLink>
                    </h3>
                    <div className='link-list space-y-2'>
                      {firstColumnLinks.map((item, i) => (
                        <NextLink
                          key={i}
                          href={`/${item.attributes.slug}`}
                          className='block text-gray-300 hover:text-white transition-colors'
                        >
                          {item.attributes.title}
                        </NextLink>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className='link-style1 mb-3'>
                    <h3 className='mb-3 text-white font-semibold'>
                      <NextLink
                        href={'/categories'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Υπηρεσίες
                      </NextLink>
                    </h3>
                    <ul className='ps-0 space-y-2 list-none'>
                      {secondColumnLinks.map((item, i) => (
                        <li key={i}>
                          <NextLink
                            href={`/categories/${item.attributes.slug}`}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.attributes.label}
                          </NextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <div className='link-style1 mb-3'>
                    <h3 className='mb-3 text-white font-semibold'>
                      <NextLink
                        href={'/dashboard'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Ο Λογαριασμός μου
                      </NextLink>
                    </h3>
                    <ul className='ps-0 space-y-2 list-none'>
                      {accountLinks.map((item, i) => (
                        <li key={i}>
                          <NextLink
                            href={item.slug}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.label}
                          </NextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='link-style1 mb-3 pt-3'>
                    <h3 className='text-white mb-3 font-semibold'>
                      Επαγγελματικά Προφίλ
                    </h3>
                    <ul className='ps-0 space-y-2 list-none'>
                      {proLinks.map((item, i) => (
                        <li key={i}>
                          <NextLink
                            href={item.slug}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.label}
                          </NextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='lg:col-span-4 lg:col-start-9'>
            <div className='footer-widget mb-4 lg:mb-5'>
              <NextLink
                className='inline-block bg-white h-[50px] w-[140px] rounded-[10px] p-[5px]'
                href='/'
              >
                <Image
                  height={45}
                  width={123}
                  className='object-contain h-full w-full'
                  src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1761929834/Static/doulitsa-logo_mpqr5n.svg'
                  alt='Doulitsa logo'
                />
              </NextLink>
              <div className='mb-4 lg:mb-5'>
                <div>
                  <div className='contact-info'>
                    <p className='mb-2 text-white'>Ερωτήσεις?</p>
                    <p className='info-mail text-lg font-medium'>
                      <a
                        className='text-white hover:text-green-400 transition-colors'
                        href='mailto:contact@doulitsa.gr'
                      >
                        contact@doulitsa.gr
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <Socials />
            </div>
          </div>
        </div>
      </div>
      <div className='container mx-auto px-4 border-t border-white/10 py-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2'>
          <div className='text-center lg:text-left'>
            <p className='copyright-text mb-2 md:mb-0 text-gray-400 font-heading'>
              © Doulitsa 2025 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
