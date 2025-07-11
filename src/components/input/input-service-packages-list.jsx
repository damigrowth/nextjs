'use client';

import React, { useEffect } from 'react';

import { InputB, TextArea } from '@/components/input';
import useCreateServiceStore from '@/stores/service/create/createServiceStore';
import { IconFloppyDisk } from '@/components/icon/fa';

import NewFeatureInputs from './input-service-packages-feature-create';
import FeaturesList from './input-service-packages-features';

export default function Packages() {
  const {
    errors,
    savePackages,
    packages,
    tier,
    setTier,
    setMinPrice,
    setPackageValues,
    showNewFeatureInputs,
    handleShowNewFeatureInputs,
  } = useCreateServiceStore();

  // useEffect(() => {
  //   if (tier === "standard") {
  //     setMinPrice("basic", "standard");
  //   }
  //   if (tier === "premium") {
  //     setMinPrice("standard", "premium");
  //   }
  // }, [tier]);
  useEffect(() => {
    if (errors.tier === 'basic') {
      setTier('basic');
    }
    if (errors.tier === 'standard') {
      setTier('standard');
    }
    if (errors.tier === 'premium') {
      setTier('premium');
    }
  }, [errors, setTier]);

  return (
    <div>
      <h4 className='text-thm bgc-thm7 service-package-badge fit px30 py10 bold'>
        {packages[tier].nav.title}
      </h4>
      <div className='mb20 mt20'>
        <TextArea
          id={`package-description-${tier}`}
          name={`package-description-${tier}`}
          label='Περιγραφή'
          rows='1'
          draggable='false'
          minLength={10}
          maxLength={85}
          errors={errors}
          value={packages[tier].description}
          onChange={(formattedValue) =>
            setPackageValues('description', formattedValue)
          }
          capitalize
          formatSymbols
          counter
        />
      </div>
      <div className='pt10'>
        <h5 className='mb20'>Παροχές</h5>
        <div className='col-md-6 text-start'>
          <button
            type='button'
            onClick={handleShowNewFeatureInputs}
            className='ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3'
          >
            <span>{packages[tier].nav.button}</span>
            <span className='d-flex align-items-center flaticon-button fz20' />
          </button>
        </div>
        {showNewFeatureInputs && <NewFeatureInputs />}
        <FeaturesList />
      </div>
      <div className='col-sm-6 '>
        <div className='mb20 form-group'>
          <InputB
            label='Τιμή'
            type='number'
            id='package-price'
            name='package-price'
            errors={errors}
            min={packages[tier].nav.minPrice}
            value={packages[tier].price}
            onChange={(formattedValue) =>
              setPackageValues('price', formattedValue)
            }
            className='form-control input-group'
            append='€'
          />
        </div>
      </div>
      <div className='row pt10 '>
        <div className='col-sm-6 text-start pb-4'>
          {packages[tier].nav.previous ? (
            <button
              type='button'
              onClick={() => setTier(packages[tier].nav.previous.tier)}
              className='ud-btn btn-dark-border bdrs4 d-flex align-items-center gap-2 default-box-shadow p3'
            >
              <span className='d-flex align-items-center flaticon-left fz20' />
              <span>{packages[tier].nav.previous.text}</span>
            </button>
          ) : null}
        </div>
        <div className='col-sm-6 text-end d-flex justify-content-end align-items-center'>
          {packages[tier].nav.next ? (
            <button
              type='button'
              onClick={() => setTier(packages[tier].nav.next.tier)}
              className='ud-btn btn-thm2 bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3'
            >
              <span>{packages[tier].nav.next.text}</span>
              <span className='d-flex align-items-center flaticon-right fz20' />
            </button>
          ) : null}
        </div>
      </div>
      {errors?.field === 'service-packages' ? (
        <div className='mt20'>
          <p className='text-danger'>{errors.message}</p>
        </div>
      ) : null}
      <button
        type='button'
        className='ud-btn btn-thm mt40 no-rotate'
        onClick={savePackages}
      >
        Αποθήκευση
        <IconFloppyDisk />
      </button>
    </div>
  );
}
