import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  accountLinks,
  firstColumnLinks,
  proLinks,
  secondColumnLinks,
} from '@/constants/footer';

import Socials from '../icon/socials';

export default async function Footer() {
  return (
    <>
      <section className='footer-style1 at-home2 pb-0 pt60'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-6'>
              <div className='footer-widget mb-4 mb-lg-5'>
                <div className='row justify-content-between'>
                  <div className='col-auto'>
                    <div className='link-style1 mb-3'>
                      <h6 className='mb10'>
                        <Link href={'/about'} className='text-white'>
                          Σχετικά
                        </Link>
                      </h6>
                      <div className='link-list'>
                        {firstColumnLinks.map((item, i) => (
                          <Link key={i} href={`/${item.attributes.slug}`}>
                            {item.attributes.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='col-auto'>
                    <div className='link-style1 mb-3'>
                      <h6 className='mb10'>
                        <Link href={'/categories'} className='text-white'>
                          Υπηρεσίες
                        </Link>
                      </h6>
                      <ul className='ps-0'>
                        {secondColumnLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={`/categories/${item.attributes.slug}`}>
                              {item.attributes.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className='col-auto'>
                    <div className='link-style1 mb-3'>
                      <h6 className='mb10'>
                        <Link href={'/dashboard'} className='text-white'>
                          Ο Λογαριασμός μου
                        </Link>
                      </h6>
                      <ul className='ps-0'>
                        {accountLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={item.slug}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className='link-style1 mb-3 pt10'>
                      <h6 className='text-white mb10 '>Επαγγελματικά Προφίλ</h6>
                      <ul className='ps-0'>
                        {proLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={item.slug}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-6 col-xl-4 offset-xl-2'>
              <div className='footer-widget mb-4 mb-lg-5'>
                <Link className='footer-logo' href='/'>
                  <Image
                    height={45}
                    width={123}
                    className='mb40 object-fit-contain'
                    src='/images/doulitsa-logo.svg'
                    alt='Doulitsa logo'
                  />
                </Link>
                <div className='row mb-4 mb-lg-5'>
                  <div className='col-auto'>
                    <div className='contact-info'>
                      <p className='mb-2 text-white'>Ερωτήσεις?</p>
                      <h5 className='info-mail '>
                        <a
                          className='text-white'
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
        <div className='container white-bdrt1 py-4'>
          <div className='row'>
            <div className='col-sm-6'>
              <div className='text-center text-lg-start'>
                <p className='copyright-text mb-2 mb-md-0 text-white-light ff-heading'>
                  © Doulitsa 2025 All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
