import React from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';
import { IconTimes } from '@/components/icon/fa';

import UserMenu from '@/components/menu/menu-user';
import { IconMobileMenu } from '@/components/icon';

export default function HeaderMobile() {
  return (
    <div className='lg:hidden'>
      <div className='block lg:hidden'>
        <header className='bg-white border-b border-gray-200 shadow-sm'>
          <div className='w-full'>
            <div className='flex justify-between items-center px-4 py-3'>
              <LinkNP className='flex-shrink-0' href='/'>
                <Image
                  height={40}
                  width={133}
                  src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
                  alt='Header Logo'
                  unoptimized
                  priority
                />
              </LinkNP>
              <div className='flex items-center space-x-4'>
                <UserMenu isMobile />
                <button
                  className='p-2 text-gray-700 hover:text-gray-900 focus:outline-none'
                  data-bs-toggle='offcanvas'
                  data-bs-target='#offcanvasExample'
                  aria-controls='offcanvasExample'
                  aria-label='Toggle mobile menu'
                >
                  <IconMobileMenu />
                </button>
              </div>
            </div>
          </div>
          <div className='hidden'>
            <div className='mobile_menu_close_btn'>
              <IconTimes />
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
