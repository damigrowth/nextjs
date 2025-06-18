'use client';

import React from 'react';
import LinkNP from '@/components/link';

import useHomeStore from '@/stores/home/homeStore';

export default function AllTaxonomiesList({ list, tabIndex }) {
  const { taxonomy } = useHomeStore();

  return (
    <>
      {taxonomy === tabIndex &&
        list.map((tax, i) => (
          <div key={i} className='col'>
            <div className='skill-list-style1 mb20'>
              <ul className='p-0 mb-0'>
                {tax.map((item, i2) => {
                  // Προσδιορισμός του τύπου (pros, companies, ipiresies)
                  const getItemType = () => {
                    if (item.type) {
                      // Για νέο query format
                      const typeSlug = item.type.data?.attributes?.slug;

                      if (typeSlug === 'company') return 'companies';
                      if (typeSlug === 'freelancer') return 'pros';
                    } else {
                      // Για παλιό query format
                      // Αν είναι στην πρώτη καρτέλα (freelancers)
                      if (tabIndex === 0) return 'pros';

                      // Αν είναι στη δεύτερη καρτέλα (services)
                      return 'ipiresies';
                    }
                  };

                  // Προσδιορισμός του path
                  const getItemPath = () => {
                    const type = getItemType();

                    if (type === 'pros' || type === 'companies') {
                      if (item.category && item.category.data) {
                        return `${item.category.data.attributes.slug}/${item.slug}`;
                      }

                      return item.slug;
                    } else {
                      // Για υπηρεσίες
                      return item.slug;
                    }
                  };

                  const type = getItemType();

                  const path = getItemPath();

                  return (
                    <li key={i2}>
                      <LinkNP href={`/${type}/${path}`}>
                        {item.plural || item.label}
                      </LinkNP>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
    </>
  );
}
