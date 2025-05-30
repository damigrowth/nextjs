'use client';

import React from 'react';

import { InputB } from '@/components/input';
import useCreateServiceStore from '@/stores/service/create/createServiceStore';
import useEditServiceStore from '@/stores/service/edit/editServiceStore';

export default function FaqListEdit({ id, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const {
    editingFaq,
    errors,
    cancelEditingFaq,
    saveEditingFaq,
    setEditingFaq,
  } = store();

  return (
    <div colSpan='10' className='table-editing-bg pt30 pb30'>
      <h5 className='table-editing-bg ml30 p0'>Επεξεργασία ερώτησης</h5>
      <div className='table-editing-bg p0 mt30'>
        <div className='px30'>
          <div className='row'>
            <div className='mb20 form-group'>
              <InputB
                label='Αλλαγή Ερώτησης'
                type='text'
                id='editing-faq-question'
                name='editing-faq-question'
                maxLength={80}
                value={editingFaq.question}
                onChange={(formattedValue) =>
                  setEditingFaq('question', formattedValue)
                }
                className='form-control input-group'
                errors={errors}
                capitalize
              />
            </div>
          </div>
          <div className='row'>
            <div className='form-group'>
              <InputB
                label='Αλλαγή Απάντησης'
                type='text'
                id='editing-faq-answer'
                name='editing-faq-answer'
                maxLength={300}
                value={editingFaq.answer}
                onChange={(formattedValue) =>
                  setEditingFaq('answer', formattedValue)
                }
                className='form-control input-group'
                errors={errors}
                capitalize
              />
            </div>
          </div>
        </div>
      </div>
      <div className='table-editing-bg p0 mt30'>
        <div className='px30'>
          <div className='editing-btns'>
            <button
              type='button'
              onClick={cancelEditingFaq}
              className='ud-btn btn-dark-border'
            >
              Ακύρωση Επεξεργασίας
            </button>
            <button
              type='button'
              onClick={saveEditingFaq}
              className='ud-btn btn-thm'
            >
              Ολοκλήρωση Επεξεργασίας
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
