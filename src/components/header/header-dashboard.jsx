import React from 'react';

import { NavMenu } from '@/components/navigation';

import ToggleButton from '../button/button-toggle-header';
import HeaderDashboardLogo from './header-dashboard-logo';
import HeaderMenus from './header-menus';

export default function DashboardHeader() {
  return (
    <header
      id='dashboard-header'
      className='header-nav nav-innerpage-style menu-home4 dashboard_header main-menu-dashboard'
    >
      <nav className='posr'>
        <div className='container-fluid pr30 pr15-xs pl15-xs pl30 posr menu_bdrt1'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-6 col-lg-auto pl0'>
              <div className='text-center text-lg-start d-flex align-items-center'>
                <HeaderDashboardLogo />
                <ToggleButton />
                <div className='dashboard-navmenu'>
                  <NavMenu />
                </div>
                {/* <MobileSearchButton />
                <SearchBar /> */}
              </div>
            </div>
            <HeaderMenus isProfileActive={true} />
          </div>
        </div>
      </nav>
    </header>
  );
}
