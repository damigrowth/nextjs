import React from 'react';
import Image from 'next/image';

export default function NotificationItem({ image, text1, text2 }) {
  return (
    <div className='notif_list d-flex align-items-center bdrb1 pb15 mb10'>
      <Image height={40} width={40} src={image} alt='notif' />
      <div className='details ml10'>
        <p className='text mb-0'>{text1}</p>
        <p className='text mb-0'>{text2}</p>
      </div>
    </div>
  );
}
