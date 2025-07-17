'use client';

import dynamic from 'next/dynamic';
import MobileMenuContainer from './mobile-menu-container';
import { NavMenuMobileWrapperProps } from '@/types/components';

const NavMenuMobile = dynamic(() => import('./NavMenuMobile'), {
  ssr: false, // Back to false for performance - content loads dynamically
  loading: () => (
    <div className="text-center py-4">
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Φόρτωση...</span>
      </div>
    </div>
  ),
});

export default function NavMenuMobileWrapper({ header }: NavMenuMobileWrapperProps) {
  return (
    <MobileMenuContainer>
      <NavMenuMobile header={header} />
    </MobileMenuContainer>
  );
}
