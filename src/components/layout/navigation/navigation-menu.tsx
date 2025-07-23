import React from 'react';
import LinkNP from '@/components/link';

export default function NavMenu() {
  return (
    <ul className='ace-responsive-menu ui-navigation'>
      <li className='visible_list menu-active home-menu-parent fw500'>
        <LinkNP href='/categories' className='list-item'>
          <span>Υπηρεσίες</span>
        </LinkNP>
      </li>
      <li className='visible_list menu-active home-menu-parent fw500'>
        <LinkNP href='/pros' className='list-item'>
          <span className='title'>Επαγγελματίες</span>
        </LinkNP>
      </li>
      <li className='visible_list menu-active home-menu-parent fw500'>
        <LinkNP href='/companies' className='list-item'>
          <span className='title'>Επιχειρήσεις</span>
        </LinkNP>
      </li>
    </ul>
  );
}
