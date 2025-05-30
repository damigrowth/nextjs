'use client';

import React from 'react';

export function PreviousButton({ onClick, show, disabled }) {
  if (!show) return null;

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='ud-btn btn-white bdrs4 d-flex align-items-center gap-2 default-box-shadow p3'
      disabled={disabled}
    >
      <span className='d-flex align-items-center flaticon-left fz20' />
      <span>Πίσω</span>
    </button>
  );
}

export function NextButton({ onClick, show, disabled, isDisabled, isPending }) {
  if (!show) return null;

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type='button'
      disabled={disabled || isPending}
      onClick={handleClick}
      className={`ud-btn btn-dark bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3 ${
        isDisabled ? 'btn-dark-disabled' : ''
      }`}
    >
      <span>{isPending ? 'Αποθήκευση...' : 'Επόμενο'}</span>
      {isPending ? (
        <div className='spinner-border spinner-border-sm' role='status'>
          <span className='sr-only'></span>
        </div>
      ) : (
        <span className='d-flex align-items-center flaticon-right fz20' />
      )}
    </button>
  );
}

export function NavigationButtons({
  showPrevious,
  onPreviousClick,
  showNext,
  onNextClick,
  nextDisabled,
  isPending,
}) {
  return (
    <div className='row align-items-center justify-content-between pt10'>
      <div className='col-auto'>
        <PreviousButton
          onClick={onPreviousClick}
          show={showPrevious}
          disabled={isPending}
        />
      </div>
      <div className='col-auto'>
        <NextButton
          onClick={onNextClick}
          show={showNext}
          disabled={nextDisabled}
          isDisabled={nextDisabled}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
