import Image from 'next/image';
import LinkNP from '@/components/link';
import { IconTimes } from '@/components/icon/fa';
import { IconMobileMenu } from '../icon';

export default function MobileNavigation2() {
  return (
    <>
      <div className='mobilie_header_nav stylehome1'>
        <div className='mobile-menu'>
          <div className='header bdrb1'>
            <div className='menu_and_widgets'>
              <div className='mobile_menu_bar d-flex justify-content-between align-items-center'>
                <LinkNP className='mobile_logo' href='/home-2'>
                  <Image
                    height={40}
                    width={133}
                    src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080999/Static/header-logo3_lenmsm.svg'
                    alt='Header Logo'
                  />
                </LinkNP>
                <div className='right-side text-end'>
                  <LinkNP href='/login'>join</LinkNP>
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
    </>
  );
}
