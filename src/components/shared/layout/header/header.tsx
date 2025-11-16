'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { RegisterProButton } from '@/components/forms/auth';
import { MenuUser } from '@/components/profile';
import NavMenu from './navigation-menu';
import { IconMobileMenu } from '@/components/icon';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSession } from '@/lib/auth/client';
import type { NavigationMenuCategory } from '@/lib/types/components';

interface HeaderProps {
  navigationData: NavigationMenuCategory[];
}

export default function Header({ navigationData }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isHomePage = pathname === '/';

  return (
    <header
      className={`h-16 md:h-20 w-full z-50 bg-white flex items-center border-b border-gray-200 shadow-sm py-2 ${isHomePage ? 'fixed top-0' : 'relative -mb-20'}`}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between'>
          {/* Left side - Logo and Desktop Navigation */}
          <div className='flex items-center space-x-8'>
            {/* Logo */}
            <Link href='/' className='flex-shrink-0'>
              <Image
                height={40}
                width={133}
                src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
                alt='Doulitsa Logo'
                priority
                className='h-10 w-auto'
              />
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className='hidden lg:block'>
              <NavMenu navigationData={navigationData} />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className='flex items-center space-x-2'>
            {/* Desktop Register Button - Hidden on mobile */}
            <div className='hidden sm:block'>{/* <RegisterProButton /> */}</div>

            {/* User Menu */}
            <MenuUser />

            {/* Mobile Menu Sheet - Visible only on mobile */}
            <div className='lg:hidden'>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant='accent' size='icon'>
                    <IconMobileMenu className='h-6 w-6' />
                    <span className='sr-only'>Άνοιγμα μενού</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[300px] flex flex-col'>
                  <SheetHeader className='border-b pb-4'>
                    <SheetTitle asChild>
                      <Link href='/' onClick={() => setMobileMenuOpen(false)}>
                        <Image
                          alt='Doulitsa Logo'
                          width='133'
                          height='40'
                          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg'
                          className='h-8 w-auto'
                        />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile Navigation */}
                  <div className='mt-6 flex-1'>
                    <NavMenu
                      navigationData={navigationData}
                      isMobile={true}
                      onClose={() => setMobileMenuOpen(false)}
                    />
                  </div>

                  {/* Mobile Auth Buttons - Only show for non-authenticated users */}
                  {!session?.user && (
                    <div className='mt-auto pt-6 border-t space-y-3'>
                      <Button
                        asChild
                        variant='outline'
                        size='default'
                        className='w-full rounded-full'
                      >
                        <Link
                          href='/login'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Σύνδεση
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size='default'
                        className='w-full rounded-full'
                      >
                        <Link
                          href='/register'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Εγγραφή
                        </Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
