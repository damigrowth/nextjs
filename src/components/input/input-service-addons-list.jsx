'use client';

import React from 'react';

import useCreateServiceStore from '@/stores/service/create/createServiceStore';
import useEditServiceStore from '@/stores/service/edit/editServiceStore';

import AddonListItem from './input-service-addon';

export default function AddonsList({ custom, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const { addons } = store();

  return (
    <div
      className={
        custom
          ? 'table-style2 table-responsive bdr1'
          : 'table-style2 table-responsive bdr1 mb30 mt30'
      }
    >
      <table
        className='table table-borderless mb-0'
        style={{ backgroundColor: 'white' }}
      >
        <colgroup>
          <col style={{ width: '65%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        {addons.length ? (
          <>
            <thead className='t-head'>
              <tr>
                <th className='col pl30' scope='col'>
                  <span>Πρόσθετο</span>
                </th>
                <th className='col pl30' scope='col'>
                  <span>Τιμή</span>
                </th>
              </tr>
            </thead>
            <tbody className='t-body'>
              {addons.map((addon, id) => (
                <AddonListItem
                  addon={addon}
                  id={id}
                  key={id}
                  editMode={editMode}
                />
              ))}
            </tbody>
          </>
        ) : null}
      </table>
    </div>
  );
}
