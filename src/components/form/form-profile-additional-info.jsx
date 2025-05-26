'use client';

import { useActionState, useCallback } from 'react';

import { updateAdditionalInfo } from '@/actions';
import {
  CheckSelect,
  InputB,
  SearchableSelect,
  TextArea,
} from '@/components/input';
import {
  budgetOptions,
  contactTypesOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
  sizeOptions,
} from '@/constants/collections';
import { searchData } from '@/lib/client/operations';
import { INDUSTRIES } from '@/lib/graphql';
import useEditProfileStore from '@/stores/dashboard/profile';
import { normalizeQuery } from '@/utils/queries';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';

export default function AdditionalInfoForm({ freelancer, type }) {
  const {
    terms,
    setTerms,
    minBudget,
    setMinBudget,
    industries,
    setIndustries,
    contactTypes,
    setContactTypes,
    payment_methods,
    setPaymentMethods,
    settlement_methods,
    setSettlementMethods,
    size,
    setSize,
    rate, // Added state
    setRate, // Added setter
    commencement, // Added state
    setCommencement, // Added setter
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateAdditionalInfo,
    initialState,
  );

  const handleIndustries = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(INDUSTRIES);

    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        industriesPage: page,
        industriesPageSize: 10,
      },
    });

    return data;
  }, []);

  const getChangedFields = () => {
    const changes = {};

    // Check rate changes
    if (Number(rate) !== (Number(freelancer.rate) || 0)) {
      changes.rate = Number(rate) || 0;
    }
    // Check commencement changes
    if (Number(commencement) !== (Number(freelancer.commencement) || 0)) {
      changes.commencement = Number(commencement) || 0;
    }

    const sizeDataChanged = size?.data?.id !== freelancer.size?.data?.id;

    if (sizeDataChanged) {
      changes.size = size;
    }
    // Check terms changes
    if (terms !== freelancer.terms) {
      changes.terms = terms;
    }

    // Compare minBudget with original freelancer data
    const minBudgetDataChanged =
      minBudget?.data?.id !== freelancer.minBudget?.data?.id;

    if (minBudgetDataChanged) {
      changes.minBudget = minBudget;
    }

    // Compare industries with original freelancer data
    const industriesDataChanged =
      industries?.data?.length !== freelancer.industries?.data?.length ||
      industries?.data?.some((item) => {
        const original = freelancer.industries?.data?.find(
          (orig) => orig.id === item.id,
        );

        return !original;
      });

    if (industriesDataChanged) {
      changes.industries = industries;
    }

    // Compare contactTypes with original freelancer data
    const contactTypesDataChanged =
      contactTypes?.data?.length !== freelancer.contactTypes?.data?.length ||
      contactTypes?.data?.some((item) => {
        const original = freelancer.contactTypes?.data?.find(
          (orig) => orig.id === item.id,
        );

        return !original;
      });

    if (contactTypesDataChanged) {
      changes.contactTypes = contactTypes;
    }

    // Compare payment_methods with original freelancer data
    const paymentMethodsDataChanged =
      payment_methods?.data?.length !==
        freelancer.payment_methods?.data?.length ||
      payment_methods?.data?.some((item) => {
        const original = freelancer.payment_methods?.data?.find(
          (orig) => orig.id === item.id,
        );

        return !original;
      });

    if (paymentMethodsDataChanged) {
      changes.payment_methods = payment_methods;
    }

    // Compare settlement_methods with original freelancer data
    const settlementMethodsDataChanged =
      settlement_methods?.data?.length !==
        freelancer.settlement_methods?.data?.length ||
      settlement_methods?.data?.some((item) => {
        const original = freelancer.settlement_methods?.data?.find(
          (orig) => orig.id === item.id,
        );

        return !original;
      });

    if (settlementMethodsDataChanged) {
      changes.settlement_methods = settlement_methods;
    }

    return changes;
  };

  const handleSizeSelect = (selected) => {
    const sizeObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.data.label,
            slug: selected.data.slug,
          },
        }
      : null;

    setSize({
      data: sizeObj,
    });
  };

  const handleMinBudgetSelect = (selected) => {
    const minBudgetObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.data.label,
            slug: selected.data.slug,
          },
        }
      : null;

    setMinBudget({
      data: minBudgetObj,
    });
  };

  const hasChanges = () => {
    return Object.keys(getChangedFields()).length > 0;
  };

  const handleSubmit = async (formData) => {
    const changedFields = getChangedFields();

    if (!Object.keys(changedFields).length) return;
    changedFields.id = freelancer.id;
    if (changedFields.size) {
      formData.delete('size');
      if (changedFields.size.data) {
        formData.append('size', changedFields.size);
      }
    }
    // Convert the simple arrays to the correct format for validation
    if (changedFields.contactTypes) {
      formData.delete('contactTypes');
      changedFields.contactTypes.data.forEach((item) => {
        formData.append('contactTypes', item.id);
      });
    }
    if (changedFields.payment_methods) {
      formData.delete('payment_methods');
      changedFields.payment_methods.data.forEach((item) => {
        formData.append('payment_methods', item.id);
      });
    }
    if (changedFields.settlement_methods) {
      formData.delete('settlement_methods');
      changedFields.settlement_methods.data.forEach((item) => {
        formData.append('settlement_methods', item.id);
      });
    }
    formData.append('id', freelancer.id);
    formData.append('changes', JSON.stringify(changedFields));

    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className='form-style1'>
        <div className='bdrb1 pb15 mb25'>
          <h5 className='list-title heading'>Πρόσθετα Στοιχεία</h5>
        </div>
        {/* Added row for commencement and rate */}
        <div className='row mb20'>
          <div className='mb10 col-sm-3'>
            <InputB
              label='Έτος έναρξης δραστηριότητας'
              id='commencement'
              name='commencement'
              type='number'
              min={1900}
              max={2025}
              value={commencement || ''}
              onChange={setCommencement}
              className='form-control input-group'
              errors={formState?.errors?.commencement}
            />
          </div>
          <div className='mb10 col-sm-2'>
            <InputB
              label='Μέση Αμοιβή / ώρα'
              id='rate'
              name='rate'
              type='number'
              min={10}
              max={50000}
              value={rate || ''}
              onChange={setRate}
              className='form-control input-group'
              append='€'
              errors={formState?.errors?.rate}
            />
          </div>
        </div>
        <div className='row mb20'>
          <div className='col-md-4 pb-4'>
            <CheckSelect
              options={contactTypesOptions}
              selectedValues={contactTypes}
              onChange={setContactTypes}
              name='contactTypes'
              label='Τρόποι Επικοινωνίας'
              error={formState?.errors?.contactTypes?.message}
            />
          </div>
          <div className='col-md-4 pb-4'>
            <CheckSelect
              options={paymentMethodsOptions}
              selectedValues={payment_methods}
              onChange={setPaymentMethods}
              name='payment_methods'
              label='Τρόποι Πληρωμής'
              error={formState?.errors?.payment_methods?.message}
            />
          </div>
          <div className='col-md-4 pb-4'>
            <CheckSelect
              options={settlementMethodsOptions}
              selectedValues={settlement_methods}
              onChange={setSettlementMethods}
              name='settlement_methods'
              label='Μέθοδοι Εξόφλησης'
              error={formState?.errors?.settlement_methods?.message}
            />
          </div>
        </div>
        <div className='boxede row mb40 mt40'>
          {type === 'company' && (
            <div className='col-md-3 mb20'>
              <SearchableSelect
                name='size'
                label='Αριθμός Εργαζομένων'
                labelPlural='αριθμοί εργαζομένων'
                value={size.data} // Directly use data property
                staticOptions={sizeOptions}
                onSelect={handleSizeSelect}
                isMulti={false}
                isClearable={true}
                errors={formState?.errors?.size}
              />
            </div>
          )}
          <div className='col-md-4 pb-4'>
            <SearchableSelect
              name='minBudget'
              label='Ελάχιστο Budget Εργασίας'
              labelPlural='ελάχιστο budget'
              value={minBudget.data}
              staticOptions={budgetOptions}
              onSelect={handleMinBudgetSelect}
              isMulti={false}
              isClearable={false}
              errors={formState?.errors?.minBudget}
            />
          </div>
          <div className='mb10 col-md-8'>
            <SearchableSelect
              name='industries'
              label='Κύριοι Κλάδοι Πελατών'
              labelPlural='κύριοι κλάδοι πελατών'
              value={industries.data}
              nameParam='label'
              pageParam='industriesPage'
              pageSizeParam='industriesPageSize'
              pageSize={10}
              maxSelections={10}
              onSearch={handleIndustries}
              onSelect={(selected) => {
                setIndustries({
                  data: selected,
                });
              }}
              isMulti={true}
              isClearable={true}
              formatSymbols
              errors={formState?.errors?.industries}
            />
          </div>
        </div>
        <div className='row mb10'>
          <TextArea
            id='terms'
            name='terms'
            label='Όροι Συνεργασίας'
            placeholder='Εάν έχετε κάποιους συγκεκριμένους όρους που πρέπει να γνωρίζουν όσοι θέλουν να συνεργαστούν μαζί σας μπορείτε να τους συμπληρώσετε εδώ.'
            minLength={80}
            maxLength={5000}
            counter
            value={terms}
            onChange={setTerms}
            errors={formState?.errors?.terms}
          />
        </div>
        {formState?.errors && (
          <AlertForm
            type='error'
            message={formState.errors?.submit}
            className='mt-3'
          />
        )}
        {formState?.message && !formState?.errors?.submit && (
          <AlertForm
            type='success'
            message={formState.message}
            className='mt-3'
          />
        )}
        <SaveButton
          variant='primary'
          orientation='end'
          isPending={isPending}
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
