'use client';

import React from 'react';
import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';
import { UserMenuLinkProps } from '@/types/components';

export default function UserMenuLink({ item }: UserMenuLinkProps) {
  const path = usePathname();

  const isProfile = item.path.startsWith('/profile/');

  return (
    <LinkNP
      className={`dropdown-item ${path === item.path ? 'active' : ''} ${
        item.path === '#' ? 'disabled' : ''
      }`}
      href={item.path}
      target={isProfile ? '_blank' : undefined}
      rel={isProfile ? 'noopener' : undefined}
    >
      <i className={`${item.icon} mr10`} />
      <span>{item.name}</span>
    </LinkNP>
  );
}
