import Image from 'next/image';
import Link from 'next/link';

import { Socials } from '@/components/icon';
import { firstColumnLinks } from '@/constants/footer';

export default function DashboardFooter() {
  return (
    <footer className='dashboard_footer footer-style1'>
      <div className='mb10'>
        <div className='row justify-content-between'>
          <div className='link-style1 mb-3 col-12 col-sm-auto'>
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
          <div className='footer-info col-12 col-sm-auto'>
            <div className='socials-info'>
              <Socials />
            </div>
            <div className='contact-info'>
              <p className='mb-2 text-white'>Ερωτήσεις?</p>
              <h5 className='info-mail'>
                <a className='text-white' href='mailto:contact@doulitsa.gr'>
                  contact@doulitsa.gr
                </a>
              </h5>
            </div>
          </div>
        </div>
      </div>
      <div className='white-bdrt1'>
        <div className='row mt20 align-items-center'>
          <div className='col-md-6'>
            <div className='text-center text-sm-start'>
              <p className='copyright-text mb-2 mb-md-0 text-white-light ff-heading'>
                © Doulitsa 2025 All rights reserved.
              </p>
            </div>
          </div>
          <div className='col-md-6 text-center text-sm-end'>
            <Link className='footer-logo' href='/'>
              <Image
                height={45}
                width={123}
                className='mb40 object-fit-contain'
                src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo-white_rjmcei.svg'
                alt='Doulitsa logo'
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
