'use client';

import React, { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function RadioBox({ options, paramName }) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const getInitialParamsValue = () => searchParams.get(paramName);

  const [selectedValue, setSelectedValue] = useState(getInitialParamsValue());

  const [isPending, startTransition] = useTransition();

  const handleChange = (value) => {
    setSelectedValue(value); // Update selectedValue immediately
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      params.set(paramName, value);
      params.set('page', 1);
      router.push(pathname + '?' + params.toString(), {
        scroll: false,
      });
    });
  };

  return (
    <div
      data-pending={isPending ? '' : undefined}
      className='card-body card-body px-0 pt-0'
    >
      <div className='radiobox-style1'>
        <div className='radio-element'>
          {options.map((option, i) => {
            const isChecked = selectedValue === option.value;

            return (
              <label
                key={i}
                className='form-check d-flex align-items-center mb15'
                style={{ cursor: 'pointer' }}
              >
                <input
                  className='form-check-input'
                  type='radio'
                  name={`flexRadioDefault`}
                  id={`flexRadioDefault${option.value}`}
                  onChange={() => handleChange(option.value)}
                  style={{
                    marginTop: '0px',
                    borderWidth: isChecked ? '4.5px' : '1px',
                    backgroundImage: 'none',
                    backgroundColor: 'transparent',
                  }}
                />
                <span
                  className='form-check-label'
                  htmlFor={`flexRadioDefault${option.value}`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
