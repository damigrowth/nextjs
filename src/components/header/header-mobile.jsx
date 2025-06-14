import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconTimes } from '@/components/icon/fa';

import UserMenu from '../menu/menu-user';
import { IconMobileMenu } from '../icon';

export default function HeaderMobile() {
  return (
    <div className='mobilie_header_nav stylehome1'>
      <div className='mobile-menu'>
        <div className='header bdrb1'>
          <div className='menu_and_widgets'>
            <div className='mobile_menu_bar d-flex justify-content-between align-items-center'>
              <Link className='mobile_logo' href='/'>
                <Image
                  height={40}
                  width={133}
                  src='/images/doulitsa-logo.svg'
                  alt='Header Logo'
                  unoptimized
                  priority
                />
              </Link>
              <div className='d-flex align-items-center right-side text-end'>
                <UserMenu isMobile />
                <a
                  className='menubar ml30'
                  data-bs-toggle='offcanvas'
                  data-bs-target='#offcanvasExample'
                  aria-controls='offcanvasExample'
                >
                  <IconMobileMenu />
                </a>
              </div>
            </div>
          </div>
          <div className='posr'>
            <div className='mobile_menu_close_btn'>
              <IconTimes />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
