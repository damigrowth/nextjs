"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { components } from "react-select";
import { RotatingLines } from "react-loader-spinner";
import { formatInput } from "@/utils/InputFormats/formats";

const LoadingMessage = ({ children, isPaginating, ...props }) => (
  <components.LoadingMessage {...props}>
    <div className="flex items-center justify-center space-x-2">
      <RotatingLines
        visible={true}
        height="20"
        width="20"
        color="grey"
        strokeWidth="4"
        animationDuration="0.65"
        ariaLabel="loading-results"
      />
      <span>
        {isPaginating ? "Φόρτωση περισσότερων..." : "Φόρτωση αποτελεσμάτων..."}
      </span>
    </div>
  </components.LoadingMessage>
);

const NoOptionsMessage = ({ children, selectProps, ...props }) => {
  if (selectProps.error) {
    return (
      <components.NoOptionsMessage {...props}>
        <div className="text-error">
          <span>{selectProps.error}</span>
          {selectProps.isRetrying && (
            <div className="mt-1">
              <RotatingLines
                visible={true}
                height="16"
                width="16"
                color="grey"
                strokeWidth="4"
                animationDuration="0.65"
                ariaLabel="retrying"
              />
              <span className="ml-2">Επανάληψη...</span>
            </div>
          )}
        </div>
      </components.NoOptionsMessage>
    );
  }

  return (
    <components.NoOptionsMessage {...props}>
      {children}
    </components.NoOptionsMessage>
  );
};

export default function SearchableSelect({
  name,
  value,
  label,
  labelPlural,
  defaultValue,
  isMulti = false,
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  isRetrying = false,
  onSearch,
  onSelect,
  nameParam = "name",
  pageParam = "page",
  pageSizeParam = "pageSize",
  pageSize = 10,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
  defaultPlaceholder = "Επιλογή...",
  defaultEmptyMessage,
  customStyles,
  errors,
  allowNewTerms = false,
  newTermValue = "new",
  ariaLabel,
  maxSelections,
  staticOptions,
  resetDependency,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    isSearching: false,
    isPaginating: false,
  });
  const [retryCount, setRetryCount] = useState(0);
  const [newTerms, setNewTerms] = useState([]);
  const [optionsCacheKey, setOptionsCacheKey] = useState(0);
  const maxRetries = 3;

  const selectedValue = useMemo(() => {
    if (!value) return isMulti ? [] : null;

    if (isMulti) {
      if (value.data && Array.isArray(value.data)) {
        return value.data.map((item) => ({
          value: item.id,
          label:
            item.attributes?.name || item.attributes?.label || item.label || "",
          data: item, // Preserve the full item
        }));
      }
      if (Array.isArray(value)) {
        return value.map((item) => ({
          value: item.id,
          label:
            item.attributes?.name || item.attributes?.label || item.label || "",
          data: item, // Preserve the full item
        }));
      }
      return [];
    }

    if (value.value && value.label) return value;
    if (value.id) {
      return {
        value: value.id,
        label:
          value.label ||
          value.attributes?.name ||
          value.attributes?.label ||
          "",
        data: value, // Preserve the full item
      };
    }
    return null;
  }, [value, isMulti]);

  const loadOptions = async (search, prevOptions, { page }) => {
    const isPaginating = prevOptions?.length > 0;
    setLoadingStates((prev) => ({
      ...prev,
      isSearching: !isPaginating,
      isPaginating: isPaginating,
    }));

    try {
      if (staticOptions) {
        // Handle static options
        const filtered = staticOptions.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        );
        const options = filtered.map((item) => ({
          value: item.id,
          label: item.label,
          data: item,
        }));
        return {
          options,
          hasMore: false,
          additional: { page: page + 1 },
        };
      }

      const formattedSearch = formatInput({
        value: search,
        capitalize,
        formatNumbers,
        formatSpaces,
        formatSymbols,
        lowerCase,
      });

      const variables = {
        [nameParam]: formattedSearch,
        [pageParam]: page,
        [pageSizeParam]: pageSize,
      };

      const response = await onSearch(formattedSearch, page, variables);

      if (!response) {
        throw new Error("No response from search");
      }

      const options =
        response.data?.map((item) => ({
          value: item.id,
          label:
            item.attributes.name || item.attributes.label || item.label || "",
          data: item, // Keep the complete item
        })) || [];

      const pagination = response.meta?.pagination;
      const hasMore = pagination
        ? pagination.page < pagination.pageCount
        : false;

      setRetryCount(0);

      const filteredNewTerms = newTerms.filter((term) =>
        term.label.toLowerCase().includes(search.toLowerCase())
      );

      return {
        options: [...options, ...filteredNewTerms],
        hasMore,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      console.error("Error loading options:", error);
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        return loadOptions(search, prevOptions, { page });
      }
      return {
        options: prevOptions || [],
        hasMore: false,
        additional: { page },
      };
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        isSearching: false,
        isPaginating: false,
      }));
    }
  };

  const handleSelect = (option) => {
    if (!onSelect) return;

    if (isMulti) {
      const formattedOptions =
        option?.map((opt) => ({
          id: opt.value || opt.id,
          attributes: opt.data.attributes,
          data: opt.data, // Keep the complete item
          isNewTerm: opt.isNewTerm,
        })) || [];

      const limitedOptions = maxSelections
        ? formattedOptions.slice(0, maxSelections)
        : formattedOptions;

      onSelect(limitedOptions);
    } else {
      const formattedOption = option
        ? {
            id: option.value,
            attributes: option.data.attributes,
            data: option.data, // Keep the complete item
            isNewTerm: option.isNewTerm,
          }
        : null;

      onSelect(formattedOption);
    }
  };

  const handleKeyDown = (event) => {
    if (
      !allowNewTerms ||
      !isMulti ||
      !event.target.value ||
      event.key !== "Enter"
    )
      return;

    event.preventDefault();
    const termValue = formatInput({
      value: event.target.value,
      capitalize,
      formatNumbers,
      formatSpaces,
      formatSymbols,
      lowerCase,
    });

    let uniqueId = `${newTermValue}-${Date.now()}`;

    const newTerm = {
      id: uniqueId,
      value: uniqueId,
      label: termValue,
      data: {
        id: uniqueId,
        attributes: {
          label: termValue,
        },
      },
      attributes: {
        label: termValue,
      },
      isNewTerm: true,
    };

    setNewTerms((prev) => [...prev, newTerm]);
    const updatedValue = value ? [...value, newTerm] : [newTerm];
    handleSelect(updatedValue);
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--light-color)",
      borderColor: state.isFocused
        ? "var(--primary-color)"
        : errors?.field === name
        ? "var(--error-color)"
        : "var(--border-color)",
      boxShadow: state.isFocused
        ? "0 0 0 1px var(--primary-color)"
        : errors?.field === name
        ? "0 0 0 1px var(--error-color)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--primary-color)"
          : errors?.field === name
          ? "var(--error-color)"
          : "var(--border-color)",
      },
    }),
    multiValue: (base) => ({
      ...base,
      borderRadius: "8px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "15px",
      paddingLeft: "10px",
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: "0px",
      paddingRight: "0px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      borderTopRightRadius: "8px",
      borderBottomRightRadius: "8px",
    }),
    menu: (base) => ({
      ...base,
      position: "absolute",
      width: "100%",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
    }),
    ...customStyles,
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOptionsCacheKey((prev) => prev + 1);
  }, [resetDependency]);

  if (!isMounted) return null;

  return (
    <fieldset className="form-style1">
      {label && (
        <label htmlFor={name} className="heading-color ff-heading fw500 mb10">
          {label}
          {maxSelections && value?.data?.length > 0 && (
            <span className="text-sm text-muted ml-2">
              {" "}
              ({value.data.length}/{maxSelections})
            </span>
          )}
        </label>
      )}
      <AsyncPaginate
        inputId={name}
        name={name}
        value={selectedValue}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isLoading={loadingStates.isSearching}
        isClearable={isClearable}
        isSearchable={isSearchable}
        onChange={handleSelect}
        loadOptions={loadOptions}
        additional={{
          page: 1,
        }}
        debounceTimeout={300}
        placeholder={defaultPlaceholder}
        noOptionsMessage={({ inputValue }) =>
          defaultEmptyMessage || `Δεν βρέθηκαν ${labelPlural}`
        }
        classNamePrefix="select"
        className={
          isMulti
            ? "basic-multi-select select-input"
            : "basic-single select-input"
        }
        onKeyDown={handleKeyDown}
        styles={selectStyles}
        components={{
          LoadingMessage: (props) => (
            <LoadingMessage
              {...props}
              isPaginating={loadingStates.isPaginating}
            />
          ),
          NoOptionsMessage,
        }}
        error={errors?.field === name ? errors.message : null}
        isRetrying={retryCount > 0}
        aria-label={ariaLabel || label}
        cacheUniqs={[optionsCacheKey]}
      />
      {errors?.field === name && (
        <div className="mt-1">
          <p className="text-error text-sm">{errors.message}</p>
        </div>
      )}
    </fieldset>
  );
}
