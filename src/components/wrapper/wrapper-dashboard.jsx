'use client';

import toggleStore from '@/stores/toggleStore';

export default function DashboardWrapper({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive);

  return (
    <div
      className={`dashboard dashboard_wrapper pr30 pr0-xl ${
        isActive ? 'dsh_board_sidebar_hidden' : ''
      }`}
    >
      {children}
    </div>
  );
}
