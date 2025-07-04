'use client';

import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';

import {
  hasAccessAccountNav,
  hasAccessMainNav,
  hasAccessServicesNav,
  noAccessAccountNav,
  noAccessMainNav,
} from '@/constants/dashboard';

import LogoutLink from '../form/form-logout';

export default function DashboardSidebar({ hasAccess }) {
  const path = usePathname();

  const renderNavItem = (item) => {
    // Common class names for styling
    const commonClasses = `items-center ${
      path === item.path ? '-is-active' : ''
    } ${item.path === '#' ? 'disabled' : ''}`;

    // Special handling for logout item
    if (item.path === '/logout') {
      return <LogoutLink item={item} />;
    }
    // Disabled items rendered as div
    if (item.path === '#') {
      return (
        <div className={commonClasses}>
          <i className={`${item.icon} mr15`} />
          {item.name}
        </div>
      );
    }

    // Regular nav items as links
    return (
      <LinkNP href={item.path} className={commonClasses}>
        <i className={`${item.icon} mr15`} />
        {item.name}
      </LinkNP>
    );
  };

  const mainNav = hasAccess ? hasAccessMainNav : noAccessMainNav;

  const accountNav = hasAccess ? hasAccessAccountNav : noAccessAccountNav;

  return (
    <div className='dashboard__sidebar d-none d-lg-block'>
      <div className='dashboard_sidebar_list'>
        {mainNav.map((item, i) => (
          <div key={i} className='sidebar_list_item mb-1'>
            {renderNavItem(item)}
          </div>
        ))}
        {hasAccess && (
          <>
            <p className='fz15 fw400 ff-heading pl30 mt30'>Υπηρεσίες</p>
            {hasAccessServicesNav.map((item, i) => (
              <div key={i} className='sidebar_list_item mb-1'>
                {renderNavItem(item)}
              </div>
            ))}
          </>
        )}
        <p className='fz15 fw400 ff-heading pl30 mt30'>Λογαριασμός</p>
        {accountNav.map((item, i) => (
          <div key={i} className='sidebar_list_item mb-1'>
            {renderNavItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
