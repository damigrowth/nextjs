"use client";

import React from "react";

export function PreviousButton({ onClick, show, disabled }) {
  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="ud-btn btn-white bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
      disabled={disabled}
    >
      <span className="d-flex align-items-center flaticon-left fz20" />
      <span>Πίσω</span>
    </button>
  );
}

export function NextButton({ onClick, show, disabled, isDisabled }) {
  if (!show) return null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`ud-btn btn-dark bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3 ${
        isDisabled ? "btn-dark-disabled" : ""
      }`}
    >
      <span>Επόμενο</span>
      <span className="d-flex align-items-center flaticon-right fz20" />
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
    <div className="row justify-content-between pt10">
      <div className="fit text-start">
        <PreviousButton
          onClick={onPreviousClick}
          show={showPrevious}
          disabled={isPending}
        />
      </div>
      <div className="fit text-end d-flex justify-content-end align-items-center">
        <NextButton
          onClick={onNextClick}
          show={showNext}
          disabled={nextDisabled}
          isDisabled={nextDisabled}
        />
      </div>
    </div>
  );
}
