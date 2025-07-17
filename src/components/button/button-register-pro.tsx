import React from 'react';
import LinkNP from '../link';
import { getToken } from '@/actions/auth/token';

export default async function RegisterProButton() {
  const token = await getToken();

  if (token) return null;

  return (
    <LinkNP className='mx15-xl mx30' href='/register#pro'>
      <span className='hide-below-1400 pb0'>Καταχώριση Επαγγελματία</span>
    </LinkNP>
  );
}
