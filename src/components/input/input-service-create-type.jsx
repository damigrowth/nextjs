'use client';

import React from 'react';

import useCreateServiceStore from '@/stores/service/create/createServiceStore';

import { AlertForm } from '../alert';
import { ServicePrimaryType, ServiceSecondaryType } from '.';

export default function ServiceType({ coverage }) {
  const { typeStep, goBack, errors } = useCreateServiceStore();

  return (
    <div className='ps-widget bdrs12 p30 mb30 overflow-hidden position-relative'>
      <div className='bdrb1'>
        <h3 className='list-title pb5'>Τύπος υπηρεσίας</h3>
        <input id='service-type' name='service-type' type='hidden' />
      </div>
      {!coverage ? (
        <AlertForm
          type='info'
          message='Δεν μπορείτε να προχωρήσετε γιατί δεν έχετε συμπληρώσει το αντίστοιχο πεδίο στη Διαχείριση Προφίλ.'
        />
      ) : (
        <>
          {typeStep === 0 && <ServicePrimaryType coverage={coverage} />}
          {(typeStep === 1 || typeStep === 2) && (
            <ServiceSecondaryType coverage={coverage} />
          )}
          {errors?.field === 'service-type' ? (
            <div>
              <p className='text-danger'>{errors.message}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
