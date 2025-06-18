'use client';

import React, { useRef, useState } from 'react';
import LinkNP from '@/components/link';

import { useClickOutside } from '@/hooks/useClickOutside';

import MegaMenuPillar from './menu-mega-pillar';
import { IconAngleRight } from '../icon/fa';

export default function MegaMenu({ categories, staticMenuClass }) {
  const [isActive, setIsActive] = useState(false);

  const handleMenuClick = () => {
    setIsActive((prev) => !prev);
  };

  const handleCloseDropdown = () => {
    setIsActive(false);
  };

  const inputRef = useRef();

  useClickOutside(inputRef, handleCloseDropdown);

  return (
    <>
      <div id='mega-menu' onClick={handleMenuClick}>
        <a
          className={`btn-mega fw500 ${staticMenuClass ? staticMenuClass : ''} `}
        >
          <span
            className={`pl30 pl10-xl pr5 fz15 vam flaticon-menu ${
              staticMenuClass ? staticMenuClass : ''
            } `}
          />
          Κατηγορίες
        </a>
        <ul ref={inputRef} className={`menu pl0 ${isActive ? 'active' : ''}`}>
          {categories.map((category) => (
            <li key={category.id}>
              <LinkNP
                href={`/categories/${category.slug}`}
                className='dropdown'
                prefetch={false}
              >
                <span className={`menu-icn ${category.icon}`} />
                <span className='menu-title'>{category.label}</span>
                <IconAngleRight className='menu-arrow' />
              </LinkNP>
              <div className='drop-menu'>
                {category.subcategories.map((subcategory, i) => (
                  <div key={i}>
                    <MegaMenuPillar subcategory={subcategory} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
