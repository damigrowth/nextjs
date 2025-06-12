'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBars } from '@/components/icon/fa';

import {
  hasAccessAccountNav,
  hasAccessMainNav,
  hasAccessServicesNav,
  hasAccessUserMenuNav,
  noAccessAccountNav,
  noAccessMainNav,
  noAccessUserMenuNav,
} from '@/constants/dashboard';
import { getAccess } from '@/actions/shared/user';

export default function DashboardNavigation({ hasAccess }) {
  const [isActive, setActive] = useState(false);

  const [menuItems, setMenuItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const path = usePathname();

  useEffect(() => {
    async function loadMenuItems() {
      try {
        // Αν δεν παρέχεται η παράμετρος hasAccess από το parent component,
        // τότε θα την αποκτήσουμε εδώ όπως στο UserMenu
        let userHasAccess = hasAccess;

        if (userHasAccess === undefined) {
          userHasAccess = await getAccess(['freelancer', 'company']);
        }

        // Συλλέγουμε όλα τα στοιχεία μενού σε ένα ενιαίο πίνακα
        const mainItems = userHasAccess ? hasAccessMainNav : noAccessMainNav;

        const serviceItems = userHasAccess ? hasAccessServicesNav : [];

        const accountItems = userHasAccess
          ? hasAccessAccountNav
          : noAccessAccountNav;

        // Συνδυάζουμε τα στοιχεία μενού σε έναν ενιαίο πίνακα για mobile χρήση
        // ακριβώς όπως κάνει το UserMenu
        setMenuItems([
          ...mainItems,
          ...(userHasAccess ? serviceItems : []),
          ...accountItems,
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση στοιχείων μενού:', error);
        setIsLoading(false);
      }
    }
    loadMenuItems();
  }, [hasAccess]);

  const renderNavItem = (item) => {
    // Common class names
    const commonContent = (
      <>
        <i className={`${item.icon} mr10`} />
        {item.name}
      </>
    );

    // If path is "#", render a div instead of a Link
    if (item.path === '#') {
      return <div className='disabled'>{commonContent}</div>;
    }

    // Regular nav items as links
    return <Link href={item.path}>{commonContent}</Link>;
  };

  if (isLoading) {
    return (
      <div className='dashboard_navigationbar d-block d-lg-none'>
        Φόρτωση...
      </div>
    );
  }

  return (
    <>
      <div className='dashboard_navigationbar d-block d-lg-none'>
        <div className='dropdown'>
          <button onClick={() => setActive(!isActive)} className='dropbtn'>
            <IconBars className='pr10' /> Διαχείριση
          </button>
          <ul className={`dropdown-content ${isActive ? 'show' : ''}`}>
            {menuItems.map((item, i) => (
              <li
                className={
                  path === item.path ? 'mobile-dasboard-menu-active' : ''
                }
                onClick={() => setActive(false)}
                key={i}
              >
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
