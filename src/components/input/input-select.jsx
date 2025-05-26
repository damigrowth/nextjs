'use client';

import { useRef, useState } from 'react';

import { useClickOutside } from '@/hooks/useClickOutside';

export default function SelectInput({
  id,
  name,
  value,
  onSelect,
  label,
  errors,
  data = [],
}) {
  const [open, setOpen] = useState(false);

  const initialSelectState = {
    id: 0,
    title: 'Επιλογή...',
  };

  const [selectedItem, setSelectedItem] = useState(initialSelectState);

  const inputRef = useRef();

  const handleCloseDropdown = () => {
    setOpen(false);
  };

  const handleSelect = (id, title) => {
    onSelect({ id, title });
    setOpen(false);
  };

  useClickOutside(inputRef, handleCloseDropdown);

  // console.log("selectedItem", selectedItem);
  return (
    <fieldset ref={inputRef} className='form-style1'>
      <label className='heading-color ff-heading fw500 mb10'>{label}</label>
      {/* <input
        type="text"
        name={name}
        id={id}
        value={JSON.stringify(value)}
        hidden
        readOnly
      /> */}
      <div className='bootselect-multiselect'>
        <div className='dropdown bootstrap-select'>
          <button
            type='button'
            className='btn dropdown-toggle btn-light'
            data-bs-toggle='dropdown'
            onClick={() => setOpen(!open)}
          >
            <div className='filter-option'>
              <div className='filter-option-inner'>
                <div className='filter-option-inner-inner'>{value}</div>
              </div>
            </div>
          </button>
          <div className={open ? 'dropdown-menu show' : 'dropdown-menu'}>
            <div
              className='inner show'
              style={{
                maxHeight: '300px',
                overflowX: 'auto',
              }}
            >
              <ul className='dropdown-menu inner show'>
                {data?.map((item, i) => (
                  <li key={i} className='selected active'>
                    <a
                      onClick={() => handleSelect(item.id, item.title)}
                      className={`dropdown-item ${
                        selectedItem.id !== null && item.id === selectedItem.id
                          ? 'active selected'
                          : ''
                      }`}
                    >
                      <span className='text'>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {errors?.field === name ? (
        <div>
          <p className='text-danger'>{errors?.message}</p>
        </div>
      ) : null}
    </fieldset>
  );
}
