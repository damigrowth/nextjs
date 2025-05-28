'use client';

import React from 'react';

import useCreateServiceStore from '@/stores/service/create/createServiceStore';

import FeaturesListEdit from './input-service-packages-feature-edit';

export default function FeaturesListItem({ feature, index }) {
  const { deleteFeature, editFeature, editingInput, editingMode } =
    useCreateServiceStore();

  return (
    <React.Fragment key={index}>
      <tr className='bgc-thm3'>
        <th scope='row'>{feature.title}</th>
        <th scope='row'>
          {feature.isCheckField ? (
            <div>
              {feature.checked ? (
                <span className='fas fa-check-circle fz18 text-success' />
              ) : (
                <span className='fas fa-times-circle fz18 text-danger' />
              )}
            </div>
          ) : (
            <span>{feature.value}</span>
          )}
        </th>
        <th scope='row'>
          <button
            type='button'
            onClick={deleteFeature}
            className='btn float-end p0'
          >
            <span className='text-thm2 flaticon-delete fz16 d-flex p-2 ' />
          </button>
          <button
            type='button'
            onClick={() => editFeature(index)}
            className='btn float-end p0'
          >
            <span className='text-thm2 flaticon-pencil fz16 d-flex p-2' />
          </button>
        </th>
      </tr>
      {editingMode && editingInput === index ? (
        <FeaturesListEdit index={index} />
      ) : null}
    </React.Fragment>
  );
}
