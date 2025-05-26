'use client';

import { useRef } from 'react';
import { Menu, MenuItem, Sidebar, SubMenu } from 'react-pro-sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isActiveNavigation } from '@/utils/isActiveNavigation';

export default function NavMenuMobile({ header }) {
  const path = usePathname();

  const crossRef = useRef(null);

  // Default categories if header is null
  const categories = header?.data?.attributes?.categories?.data
    ? header.data.attributes.categories.data.map((item, i) => ({
        id: i + 1,
        name: item.attributes.label,
        path: `/categories/${item.attributes.slug}`,
      }))
    : [];

  const menus = [
    {
      id: 1,
      name: 'Κατηγορίες',
      children: categories,
    },
    {
      id: 2,
      name: 'Υπηρεσίες',
      path: '/categories',
    },
    {
      id: 3,
      name: 'Επαγγελματίες',
      path: '/pros',
    },
    {
      id: 4,
      name: 'Επιχειρήσεις',
      path: '/companies',
    },
  ];

  return (
    <>
      <div
        className='offcanvas offcanvas-start'
        tabIndex={-1}
        id='offcanvasExample'
        aria-labelledby='offcanvasExampleLabel'
      >
        <div className='offcanvas-header border-bottom'>
          <Link href='/'>
            <Image
              alt='Header Logo'
              width='133'
              height='40'
              src='/images/doulitsa-logo.svg'
            />
          </Link>
          <button
            ref={crossRef}
            type='button'
            className='btn-close'
            data-bs-dismiss='offcanvas'
            aria-label='Close'
          />
        </div>
        <div className='offcanvas-body'>
          <div className='ui-navigation-sidebar'>
            <Sidebar>
              <Menu>
                {menus.map((item, i) =>
                  item?.children ? (
                    <SubMenu
                      key={i}
                      label={item.name}
                      className={
                        isActiveNavigation(path, item) ? 'ui-mobile-active' : ''
                      }
                    >
                      {item.children.map((item2, i2) =>
                        item2?.children ? (
                          <SubMenu
                            key={i2}
                            label={item2.name}
                            className={
                              isActiveNavigation(path, item2)
                                ? 'ui-mobile-active'
                                : ''
                            }
                          >
                            {item2.children.map((item3, i3) => (
                              <MenuItem
                                key={i3}
                                component={<Link href={item3.path} />}
                                className={
                                  item3.path === path ||
                                  item3.path === path.replace(/\/\d+$/, '')
                                    ? 'ui-mobile-active'
                                    : ''
                                }
                              >
                                <span data-bs-dismiss='offcanvas'>
                                  {item3.name}
                                </span>
                              </MenuItem>
                            ))}
                          </SubMenu>
                        ) : (
                          <MenuItem
                            key={i2}
                            component={<Link href={item2.path} />}
                            className={
                              item2.path === path ? 'ui-mobile-active' : ''
                            }
                          >
                            <span data-bs-dismiss='offcanvas'>
                              {item2.name}
                            </span>
                          </MenuItem>
                        ),
                      )}
                    </SubMenu>
                  ) : (
                    <MenuItem
                      key={i}
                      component={<Link href={item.path} />}
                      className={item.path === path ? 'ui-mobile-active' : ''}
                    >
                      <span data-bs-dismiss='offcanvas'>{item.name}</span>
                    </MenuItem>
                  ),
                )}
              </Menu>
            </Sidebar>
          </div>
        </div>
      </div>
    </>
  );
}
