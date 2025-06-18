import React from 'react';
import LinkNP from '@/components/link';

export default function MegaMenuPillar({ subcategory }) {
  return (
    <>
      <LinkNP
        className='h6 p0 mb10 fz15 fw600'
        href={`/ipiresies/${subcategory.slug}`}
        prefetch={false}
      >
        {subcategory.label}
      </LinkNP>
      <ul className='ps-0 mb40'>
        {subcategory.subdivisions.map((subdivision, i) => (
          <li key={i}>
            <LinkNP
              href={`/ipiresies/${subcategory.slug}/${subdivision.slug}`}
              prefetch={false}
            >
              {subdivision.label}
            </LinkNP>
          </li>
        ))}
      </ul>
    </>
  );
}
