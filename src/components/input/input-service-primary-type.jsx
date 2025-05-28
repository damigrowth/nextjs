'use client';

import React from 'react';

import useCreateServiceStore from '@/stores/service/create/createServiceStore';

import { AlertForm } from '../alert';

export default function ServicePrimaryType({ coverage }) {
  const { type, setType } = useCreateServiceStore();

  return (
    <div className='pt20'>
      <h4 className='list-title pb10'>
        Παρέχετε την συγκεκριμένη υπηρεσία, <br />
        με την φυσική σας παρουσία ή online (απομακρυσμένα) ;
      </h4>
      <div className='mb20-lg mt20 mb20'>
        <button
          className={`ud-btn btn-thm2 add-joining ${type.presence ? 'active' : ''}`}
          type='button'
          onClick={() => setType('presence')}
          disabled={!coverage.onbase && !coverage.onsite}
        >
          Φυσική Παρουσία
        </button>
        <button
          className={`ud-btn btn-thm2 add-joining mr10-lg mr20 ${type.online ? 'active' : ''}`}
          type='button'
          onClick={() => setType('online')}
        >
          Online
        </button>
      </div>
      {!coverage.onbase && !coverage.onsite && (
        <AlertForm
          type='info'
          message={`Δεν μπορείτε να επιλέξετε "Φυσική παρουσία" γιατί δεν έχετε επιλέξει το Προσφέρω τις υπηρεσίες "Στον χώρο μου" ή "Στον χώρο του πελάτη" στη Διαχείριση Προφίλ.`}
        />
      )}
    </div>
  );
}
