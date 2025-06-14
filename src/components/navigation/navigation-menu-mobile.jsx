'use client';

import dynamic from 'next/dynamic';

const NavMenuMobile = dynamic(() => import('./NavMenuMobile'), {
  ssr: true, // Changed to true so offcanvas is available immediately for Bootstrap
});

export default function NavMenuMobileWrapper({ header }) {
  return <NavMenuMobile header={header} />;
}
