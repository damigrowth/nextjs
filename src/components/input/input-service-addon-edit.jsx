'use client';

import React from 'react';

import { InputB, TextArea } from '@/components/input';
import useCreateServiceStore from '@/stores/service/create/createServiceStore';
import useEditServiceStore from '@/stores/service/edit/editServiceStore';

export default function AddonsListEdit({ id, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const {
    newAddon,
    editingAddon,
    errors,
    cancelEditingAddon,
    saveEditingAddon,
    setEditingAddon,
  } = store();

  return (
    <tr>
      <td colSpan='10' className='table-editing-bg'>
        <h5 className='table-editing-bg ml30 p0'>Επεξεργασία παροχής</h5>
        <div className='table-editing-bg p0 mt30'>
          <div className='px30'>
            <div className='row pb10'>
              <div className='col-sm-9 table-editing-bg'>
                <InputB
                  label='Αλλαγή Τίτλου'
                  type='text'
                  id='editing-addon-title'
                  name='editing-addon-title'
                  value={editingAddon.title}
                  placeholder={editingAddon.title}
                  maxLength={20}
                  onChange={(formattedValue) =>
                    setEditingAddon('title', formattedValue)
                  }
                  className='form-control input-group'
                  errors={errors}
                  capitalize
                />
              </div>
              <div className='col-sm-3 table-editing-bg'>
                <InputB
                  label='Αλλαγή Τιμής'
                  type='number'
                  id='editing-addon-price'
                  name='editing-addon-price'
                  min={5}
                  max={10000}
                  value={editingAddon.price}
                  onChange={(formattedValue) =>
                    setEditingAddon('price', formattedValue)
                  }
                  className='form-control input-group'
                  errors={errors}
                  append='€'
                />
              </div>
            </div>
            <div className='row'>
              <TextArea
                label='Αλλαγή Περιγραφής'
                id='editing-addon-description'
                name='editing-addon-description'
                rows={1}
                minLength={5}
                maxLength={80}
                value={editingAddon.description}
                onChange={(formattedValue) =>
                  setEditingAddon('description', formattedValue)
                }
                errors={errors}
                capitalize
                counter
              />
            </div>
          </div>
        </div>
        <div className='table-editing-bg p0 mt30'>
          <div className='px30'>
            <div className='editing-btns'>
              <button
                type='button'
                onClick={cancelEditingAddon}
                className='ud-btn btn-dark-border'
              >
                Ακύρωση Επεξεργασίας
              </button>
              <button
                type='button'
                onClick={saveEditingAddon}
                className='ud-btn btn-thm'
              >
                Ολοκλήρωση Επεξεργασίας
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
