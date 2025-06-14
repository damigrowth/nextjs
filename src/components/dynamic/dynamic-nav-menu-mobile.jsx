'use client';

import dynamic from 'next/dynamic';

const NavMenuMobileWrapper = dynamic(
  () =>
    import('../navigation').then((mod) => ({
      default: mod.NavMenuMobileWrapper,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='mobile-nav-loading' style={{ display: 'none' }}>
        {/* Hidden loading state since mobile nav is hidden by default */}
      </div>
    ),
  },
);

export default function NavMenuMobileWrapperu_D(props) {
  return <NavMenuMobileWrapper {...props} />;
}
