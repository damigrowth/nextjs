'use client';

import dynamic from 'next/dynamic';

const MegaMenu = dynamic(() => import('../menu/menu-mega'), {
  ssr: false,
  loading: () => (
    <div className='mega-menu-loading'>
      <a className='btn-mega fw500'>
        <span className='pl30 pl10-xl pr5 fz15 vam flaticon-menu' />
        Κατηγορίες
      </a>
    </div>
  ),
});

export default function MegaMenu_D(props) {
  return <MegaMenu {...props} />;
}
