"use client";

import TextArea from "@/components/inputs/TextArea";
import useEditProfileStore from "@/store/dashboard/profile";
import { useActionState, useCallback } from "react";
import { updateAdditionalInfo } from "@/lib/profile/update";
import SaveButton from "../../buttons/SaveButton";
import SearchableSelect from "../../Archives/Inputs/SearchableSelect";
import { INDUSTRIES, MIN_BUDGETS } from "@/lib/graphql/queries/main/additional";
import { normalizeQuery } from "@/utils/queries";
import { searchData } from "@/lib/client/operations";
import CheckSelect from "../../Archives/Inputs/CheckSelect";
import {
  contactTypesOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
} from "@/data/global/collections";

export default function AdditionalInfoForm() {
  const {
    terms,
    setTerms,
    minBudgets,
    setMinBudgets,
    industries,
    setIndustries,
    contactTypes,
    setContactTypes,
    payment_methods,
    setPaymentMethods,
    settlement_methods,
    setSettlementMethods,
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateAdditionalInfo,
    initialState
  );

  const handleMinBudgets = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(MIN_BUDGETS);
    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        minBudgetsPage: page,
        minBudgetsPageSize: 10,
      },
    });

    return data;
  }, []);

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

  const hasChanges = () => {};

  // Handle Onbase and Onsite Searches

  return (
    <form action={formAction}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Πρόσθετα Στοιχεία</h5>
        </div>

        <div className="row mb10">
          <div className="col-md-4">
            <SearchableSelect
              name="minBudgets"
              label="Ελάχιστο Budget"
              labelPlural="ελάχιστα budget"
              value={minBudgets}
              nameParam="label"
              pageParam="minBudgetsPage"
              pageSizeParam="minBudgetsPageSize"
              pageSize={10}
              onSearch={handleMinBudgets}
              onSelect={(selected) => {
                // Sort the selected items by value
                const sortedSelected = [...selected].sort((a, b) => {
                  const valueA = a.attributes?.value || 0;
                  const valueB = b.attributes?.value || 0;
                  return valueA - valueB;
                });

                setMinBudgets({
                  data: sortedSelected,
                });
              }}
              isMulti={true}
              isClearable={true}
              formatSymbols
            />
          </div>
          <div className="mb10 col-md-5">
            <SearchableSelect
              name="industries"
              label="Κύριοι Κλάδοι Πελατών"
              labelPlural="κύριοι κλάδοι πελατών"
              value={industries}
              nameParam="label"
              pageParam="industriesPage"
              pageSizeParam="industriesPageSize"
              pageSize={10}
              onSearch={handleIndustries}
              onSelect={(selected) => {
                setIndustries({
                  data: selected,
                });
              }}
              isMulti={true}
              isClearable={true}
              formatSymbols
              maxSelections={3}
            />
          </div>
        </div>
        <div className="row mb10">
          <div className="col-md-4">
            <CheckSelect
              options={contactTypesOptions}
              selectedValues={contactTypes}
              onChange={setContactTypes}
              name="contactTypes"
              label="Τρόποι Επικοινωνίας"
            />
          </div>
          <div className="col-md-4">
            <CheckSelect
              options={paymentMethodsOptions}
              selectedValues={payment_methods}
              onChange={setPaymentMethods}
              name="payment_methods"
              label="Τρόποι Πληρωμής"
            />
          </div>
          <div className="col-md-4">
            <CheckSelect
              options={settlementMethodsOptions}
              selectedValues={settlement_methods}
              onChange={setSettlementMethods}
              name="settlement_methods"
              label="Μέθοδοι Εξόφλησης"
            />
          </div>
        </div>

        <div className="row mb10">
          <TextArea
            id="terms"
            name="terms"
            label="Όροι Συνεργασίας"
            minLength={80}
            maxLength={5000}
            counter
            value={terms}
            onChange={setTerms}
            error={formState.errors.terms}
          />
        </div>
        <SaveButton isPending={isPending} hasChanges={hasChanges()} />
        {formState.errors.submit && (
          <div className="mt10 text-error">{formState.errors.submit}</div>
        )}
        {formState.message && !formState.errors.submit && (
          <div className="mt10 text-success">{formState.message}</div>
        )}
      </div>
    </form>
  );
}
