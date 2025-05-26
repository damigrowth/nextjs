'use client';

import React from 'react';

import useCreateServiceStore from '@/stores/service/create/createServiceStore';
import useEditServiceStore from '@/stores/service/edit/editServiceStore';

// import FeaturesListEdit from "./input-service-packages-feature-edit";
import AddonsListEdit from './input-service-addon-edit';

export default function AddonListItem({ addon, id, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const {
    editAddon,
    editingAddon,
    addonEditingInput,
    addonEditingMode,
    deleteAddon,
  } = store();

  return (
    <React.Fragment key={id}>
      <tr className='bgc-thm3'>
        <th>
          <h5>{addon.title}</h5>
          <p className='m0'>{addon.description}</p>
        </th>
        <th>
          <span className='h4 fw700'>{addon.price}€</span>
        </th>
        <th className='pl0'>
          <button
            type='button'
            onClick={() => deleteAddon(id)}
            className='btn float-end p0'
          >
            <span className='text-thm2 flaticon-delete fz16 d-flex p-2 ' />
          </button>
          <button
            type='button'
            onClick={() => editAddon(id)}
            className='btn float-end p0'
          >
            <span className='text-thm2 flaticon-pencil fz16 d-flex p-2' />
          </button>
        </th>
      </tr>
      {addonEditingMode && addonEditingInput === id ? (
        <AddonsListEdit id={id} editMode={editMode} />
      ) : null}
    </React.Fragment>
  );
}
