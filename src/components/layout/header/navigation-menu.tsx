import React from 'react';
import LinkNP from '@/components/link';

export default function NavMenu() {
  return (
    <ul className='flex list-none m-0 p-0 bg-transparent'>
      <li className='inline-block m-0 p-0 font-medium'>
        <LinkNP href='/categories' className='block px-4 py-[18px] text-center rounded-full hover:bg-white/10 hover:text-green-600 transition-all duration-300 relative before:content-[""] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 before:bg-green-600 before:transition-all before:duration-300 hover:before:w-full hover:before:left-0'>
          <span>Υπηρεσίες</span>
        </LinkNP>
      </li>
      <li className='inline-block m-0 p-0 font-medium'>
        <LinkNP href='/pros' className='block px-4 py-[18px] text-center rounded-full hover:bg-white/10 hover:text-green-600 transition-all duration-300 relative before:content-[""] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 before:bg-green-600 before:transition-all before:duration-300 hover:before:w-full hover:before:left-0'>
          <span className='title'>Επαγγελματίες</span>
        </LinkNP>
      </li>
      <li className='inline-block m-0 p-0 font-medium'>
        <LinkNP href='/companies' className='block px-4 py-[18px] text-center rounded-full hover:bg-white/10 hover:text-green-600 transition-all duration-300 relative before:content-[""] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 before:bg-green-600 before:transition-all before:duration-300 hover:before:w-full hover:before:left-0'>
          <span className='title'>Επιχειρήσεις</span>
        </LinkNP>
      </li>
    </ul>
  );
}
