'use client';

import { Menu, MenuItem, Sidebar, SubMenu } from 'react-pro-sidebar';
import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';

import { isActiveNavigation } from '@/utils/isActiveNavigation';
import { NavMenuMobileProps, NavigationItem } from '@/types/components';

export default function NavMenuMobile({ header }: NavMenuMobileProps) {
  const path = usePathname();

  // Default categories if header is null
  const categories: NavigationItem[] = header?.data?.attributes?.categories?.data
    ? header.data.attributes.categories.data.map((item, i) => ({
        id: i + 1,
        name: item.attributes.label,
        path: `/categories/${item.attributes.slug}`,
      }))
    : [];

  const menus: NavigationItem[] = [
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
                          component={<LinkNP href={item3.path} />}
                          className={
                            item3.path === path ||
                            item3.path === path.replace(/\/\d+$/, '')
                              ? 'ui-mobile-active'
                              : ''
                          }
                        >
                          <span data-bs-dismiss='offcanvas'>{item3.name}</span>
                        </MenuItem>
                      ))}
                    </SubMenu>
                  ) : (
                    <MenuItem
                      key={i2}
                      component={<LinkNP href={item2.path} />}
                      className={item2.path === path ? 'ui-mobile-active' : ''}
                    >
                      <span data-bs-dismiss='offcanvas'>{item2.name}</span>
                    </MenuItem>
                  ),
                )}
              </SubMenu>
            ) : (
              <MenuItem
                key={i}
                component={<LinkNP href={item.path} />}
                className={item.path === path ? 'ui-mobile-active' : ''}
              >
                <span data-bs-dismiss='offcanvas'>{item.name}</span>
              </MenuItem>
            ),
          )}
        </Menu>
      </Sidebar>
    </div>
  );
}
