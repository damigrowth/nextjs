'use client';

import { useEffect } from 'react';
import LinkNP from '@/components/link';

import { UserImage } from '@/components/avatar';
import { getImage } from '@/utils/image';
import {
  hasAccessUserMenuNav,
  noAccessUserMenuNav,
} from '@/constants/dashboard';

import MessagesMenu from '../button/button-messages';
import SavedMenu from '../button/button-saved';
import LogoutLink from '../form/form-logout';
import UserMenuLink from './menu-user-link';
import useFreelancerStore from '@/stores/freelancer';
import Skeleton from 'react-loading-skeleton';

export default function UserMenu({ isMobile }) {
  const {
    username,
    displayName,
    firstName,
    lastName,
    image,
    hasAccess,
    isAuthenticated,
    isConfirmed,
    isLoading,
    fetchFreelancer,
  } = useFreelancerStore();

  // Fetch auth data on component mount
  useEffect(() => {
    fetchFreelancer();
  }, [fetchFreelancer]);

  // Show loading state while fetching
  if (isLoading) {
    return !isMobile ? (
      <div className='auth-btns'>
        <Skeleton width={40} height={40} borderRadius={'20%'} />
      </div>
    ) : (
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '10px',
        }}
      />
    );
  }

  if (isAuthenticated && isConfirmed) {
    const allNav = hasAccess ? hasAccessUserMenuNav : noAccessUserMenuNav;

    const userProfilePath = `/profile/${username}`;

    // Modify the nav items to use dynamic profile path or filter out profile for non-access users
    const modifiedNav = allNav
      .map((item) => {
        if (item.path === '/profile') {
          return hasAccess ? { ...item, path: userProfilePath } : null;
        }

        return item;
      })
      .filter(Boolean); // Remove null items

    return (
      <li className='user_setting d-flex'>
        <div className='d-flex justify-content-center align-items-center mr20'>
          <SavedMenu />
        </div>
        <div className='d-flex justify-content-center align-items-center mr30'>
          <MessagesMenu />
        </div>
        <div className='dropdown'>
          <div className='btn' data-bs-toggle='dropdown'>
            <UserImage
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              hideDisplayName
              image={getImage(image, { size: 'avatar' })}
              alt={
                image?.data?.attributes?.formats?.thumbnail?.provider_metadata
                  ?.public_id
              }
              width={40}
              height={40}
            />
          </div>
          <div className='dropdown-menu'>
            <div className='user_setting_content'>
              {modifiedNav.map((item, i) => {
                if (item.path === '/logout') {
                  return (
                    <div key={i}>
                      <LogoutLink item={item} key={i} custom />
                    </div>
                  );
                } else {
                  return (
                    <div key={i}>
                      <UserMenuLink key={i} item={item} />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </li>
    );
  } else {
    return !isMobile ? (
      <div className='auth-btns'>
        <LinkNP
          className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
          href='/login'
        >
          Σύνδεση
        </LinkNP>
        <LinkNP
          className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
          href='/register'
        >
          Εγγραφή
        </LinkNP>
      </div>
    ) : (
      <LinkNP href='/login'>Σύνδεση</LinkNP>
    );
  }
}
