'use client';

import dynamic from 'next/dynamic';

const NavMenuMobileWrapper = dynamic(
  () =>
    import('../navigation').then((mod) => ({
      default: mod.NavMenuMobileWrapper,
    })),
  {
    ssr: true, // Changed to true so offcanvas is available immediately
    loading: () => (
      <div className='mobile-nav-loading' style={{ display: 'none' }}>
        {/* Hidden loading state since mobile nav is hidden by default */}
      </div>
    ),
  },
);

export default function NavMenuMobileWrapper_D(props) {
  return <NavMenuMobileWrapper {...props} />;
}
