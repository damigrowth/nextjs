import React from 'react';

import { logout } from '@/actions';

export default function LogoutLink({ item, custom }) {
  return (
    <form action={logout}>
      <button type='submit' className='dropdown-item'>
        <i className={`${item.icon} ${custom ? 'mr10' : 'mr15'}`} />
        {item.name}
      </button>
    </form>
  );
}
