'use client';

import React from 'react';

import useServiceOrderStore from '@/stores/order/service';

export default function PackagesBtns({ packages }) {
  const { setOrder, calculateTotal } = useServiceOrderStore();

  const handleSelectPackage = (pack) => {
    setOrder({ packages: [pack] });
    // console.log("PACKAGEBTNS", pack);
    calculateTotal();
  };

  return (
    <tr>
      <th scope='row' />
      {packages.map((pack, i) => (
        <td key={i}>
          <button
            onClick={() => handleSelectPackage(pack)}
            className='ud-btn btn-thm'
          >
            Επιλογή
            <i className='fal fa-arrow-right-long' />
          </button>
        </td>
      ))}
    </tr>
  );
}
