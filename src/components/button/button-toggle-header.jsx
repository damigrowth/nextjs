'use client';

import Image from 'next/image';

import toggleStore from '@/stores/toggleStore';

export default function ToggleButton() {
  const toggle = toggleStore((state) => state.dashboardSlidebarToggleHandler);

  return (
    <div className='fz20 ml90'>
      <a onClick={toggle} className='dashboard_sidebar_toggle_icon vam'>
        <Image
          height={18}
          width={20}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750081375/Static/dashboard-navicon_rvxyi1.svg'
          alt='navicon'
        />
      </a>
    </div>
  );
}
