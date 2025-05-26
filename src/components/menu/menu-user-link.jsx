'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserMenuLink({ item }) {
  const path = usePathname();

  const isProfile = item.path.startsWith('/profile/');

  return (
    <Link
      className={`dropdown-item ${path === item.path ? 'active' : ''} ${
        item.path === '#' ? 'disabled' : ''
      }`}
      href={item.path}
      target={isProfile ? '_blank' : undefined}
      rel={isProfile ? 'noopener' : undefined}
    >
      <i className={`${item.icon} mr10`} />
      <span>{item.name}</span>
    </Link>
  );
}
