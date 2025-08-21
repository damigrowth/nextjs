import React from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';

import {
  accountLinks,
  firstColumnLinks,
  proLinks,
  secondColumnLinks,
} from '@/constants/datasets/footer';

import Socials from '@/components/icon/socials';

export default async function Footer() {
  return (
    <footer className='bg-gray-900 pb-0 pt-[60px]'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-6'>
            <div className='footer-widget mb-4 lg:mb-5'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 justify-between'>
                <div>
                  <div className='link-style1 mb-3'>
                    <h6 className='mb-3 text-white font-semibold'>
                      <LinkNP
                        href={'/about'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Σχετικά
                      </LinkNP>
                    </h6>
                    <div className='link-list space-y-2'>
                      {firstColumnLinks.map((item, i) => (
                        <LinkNP
                          key={i}
                          href={`/${item.attributes.slug}`}
                          className='block text-gray-300 hover:text-white transition-colors'
                        >
                          {item.attributes.title}
                        </LinkNP>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className='link-style1 mb-3'>
                    <h6 className='mb-3 text-white font-semibold'>
                      <LinkNP
                        href={'/categories'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Υπηρεσίες
                      </LinkNP>
                    </h6>
                    <ul className='ps-0 space-y-2 list-none'>
                      {secondColumnLinks.map((item, i) => (
                        <li key={i}>
                          <LinkNP
                            href={`/categories/${item.attributes.slug}`}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.attributes.label}
                          </LinkNP>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <div className='link-style1 mb-3'>
                    <h6 className='mb-3 text-white font-semibold'>
                      <LinkNP
                        href={'/dashboard'}
                        className='text-white hover:text-green-400 transition-colors'
                      >
                        Ο Λογαριασμός μου
                      </LinkNP>
                    </h6>
                    <ul className='ps-0 space-y-2 list-none'>
                      {accountLinks.map((item, i) => (
                        <li key={i}>
                          <LinkNP
                            href={item.slug}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.label}
                          </LinkNP>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='link-style1 mb-3 pt-3'>
                    <h6 className='text-white mb-3 font-semibold'>
                      Επαγγελματικά Προφίλ
                    </h6>
                    <ul className='ps-0 space-y-2 list-none'>
                      {proLinks.map((item, i) => (
                        <li key={i}>
                          <LinkNP
                            href={item.slug}
                            className='text-gray-300 hover:text-white transition-colors'
                          >
                            {item.label}
                          </LinkNP>
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
              <LinkNP className='footer-logo inline-block' href='/'>
                <Image
                  height={45}
                  width={123}
                  className='mb-10 object-contain'
                  src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
                  alt='Doulitsa logo'
                />
              </LinkNP>
              <div className='mb-4 lg:mb-5'>
                <div>
                  <div className='contact-info'>
                    <p className='mb-2 text-white'>Ερωτήσεις?</p>
                    <h5 className='info-mail text-lg font-medium'>
                      <a
                        className='text-white hover:text-green-400 transition-colors'
                        href='mailto:contact@doulitsa.gr'
                      >
                        contact@doulitsa.gr
                      </a>
                    </h5>
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
