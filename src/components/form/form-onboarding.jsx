'use client';

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  InputB,
  MediaGallery,
  ProfileImageInput,
  SearchableSelect,
  SwitchB,
  TextArea,
} from '@/components/input';
import { useFormChanges } from '@/hooks/useFormChanges';
import { searchData } from '@/lib/client/operations';
import {
  FREELANCER_PROFILE_CATEGORIES,
  FREELANCER_PROFILE_SUBCATEGORIES,
  ONBASE_ZIPCODES,
  ONSITE_AREAS,
  ONSITE_COUNTIES,
} from '@/lib/graphql';
import useOnboardingStore from '@/stores/dashboard/onboarding';
import { normalizeQuery } from '@/utils/queries';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';
import { HeadingOnboarding } from '../heading';
import { updateOnboardingInfo } from '@/actions/tenant/onboarding';
import { uploadData } from '@/actions/shared/upload';

/**
 * @typedef {import('@/lib/types').Freelancer} Freelancer
 * @typedef {import('@/lib/types').StrapiMedia} StrapiMedia
 * @typedef {import('@/lib/types').StrapiMediaItem} StrapiMediaItem
 */
/**
 * @typedef {object} MediaState
 * @property {StrapiMediaItem[]} media - Current list of media items (existing and new).
 * @property {number[]} deletedMediaIds - IDs of media items marked for deletion.
 * @property {boolean} hasChanges - Flag indicating if media state has changed from original.
 * @property {number[]} initialMediaIds - IDs of the media items initially loaded.
 */

/**
 * Renders the onboarding form for new freelancer profiles.
 * Includes fields for profile image, category, subcategory, description,
 * service provision methods (coverage), and portfolio.
 * Handles form state, validation, media uploads, and submission via a server action.
 *
 * @param {object} props - The component props.
 * @param {string} props.fid - The freelancer ID.
 * @param {string} props.displayName - The freelancer display name.
 * @param {string} props.type - The freelancer type.
 * @returns {JSX.Element} The OnboardingForm component.
 */
export default function OnboardingForm({ fid, displayName, type, token }) {
  // Create a default coverage object to use when coverage is null
  const defaultCoverage = {
    online: false,
    onbase: false,
    onsite: false,
    address: '',
    area: { data: null },
    county: { data: null },
    zipcode: { data: null },
    counties: { data: [] },
    areas: { data: [] },
  };

  const {
    image,
    setImage,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    description,
    setDescription,
    coverage,
    setCoverage,
    switchCoverageMode,
  } = useOnboardingStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateOnboardingInfo,
    initialState,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Original values for useFormChanges (initial freelancer data)
  const originalValues = {
    image: { data: null },
    category: { data: null },
    subcategory: { data: null },
    description: '',
    coverage: defaultCoverage,
  };

  // Current values from Zustand store
  const currentValues = {
    image,
    category,
    subcategory,
    description,
    coverage,
  };

  const { changes, hasChanges: formFieldsChanged } = useFormChanges(
    currentValues,
    originalValues,
  );

  const originalMediaLength = useRef(0); // Always 0 for onboarding

  const hasProcessedSuccess = useRef(false);

  const [mediaState, setMediaState] = useState({
    media: [],
    deletedMediaIds: [],
    hasChanges: false,
    initialMediaIds: [],
  });

  /**
   * Effect to handle resetting the media state after a successful form submission.
   * Dispatches a custom event to reset MediaGallery state and updates local media state.
   * Uses `setTimeout` to avoid potential render loops.
   */
  useEffect(() => {
    const isSuccess = formState?.message && !formState?.errors;

    if (isSuccess && !hasProcessedSuccess.current) {
      hasProcessedSuccess.current = true;
      if (typeof window !== 'undefined') {
        document.dispatchEvent(new CustomEvent('media-gallery-reset'));
        setTimeout(() => {
          // Use formState.data for the updated media after a successful submission
          const updatedMedia = formState.data?.portfolio?.data || [];

          setMediaState((prev) => {
            if (
              compareMediaArrays(prev.media, updatedMedia) &&
              prev.deletedMediaIds.length === 0 &&
              !prev.hasChanges
            ) {
              return prev;
            }

            return {
              media: updatedMedia,
              deletedMediaIds: [],
              hasChanges: false,
              initialMediaIds: updatedMedia
                .map((item) => item.id)
                .filter(Boolean),
            };
          });
          originalMediaLength.current = updatedMedia.length;
        }, 20);
      }
    } else if (!isSuccess) {
      hasProcessedSuccess.current = false;
    }
  }, [formState]);

  /**
   * Updates the media state based on changes from the MediaGallery component.
   * Calculates if the media state has changed compared to the original state.
   * @param {StrapiMediaItem[]} media - The updated list of media items.
   * @param {number[]} deletedIds - The list of IDs marked for deletion in this update.
   */
  const handleMediaUpdate = (media, deletedIds) => {
    setMediaState((prev) => {
      const combinedDeletedIds = Array.from(
        new Set([...prev.deletedMediaIds, ...deletedIds]),
      );

      const mediaContentChanged = !compareMediaArrays(prev.media, media);

      const deletedIdsContentChanged = !arraysEqual(
        prev.deletedMediaIds,
        combinedDeletedIds,
      );

      if (!mediaContentChanged && !deletedIdsContentChanged) {
        return prev;
      }

      const hasNewFiles = media.some((item) => item.file instanceof File);

      const hasDeletedFiles = combinedDeletedIds.length > 0;

      const hasLengthChanged = media.length !== originalMediaLength.current;

      const isInitialState =
        media.length === 0 &&
        originalMediaLength.current === 0 &&
        !hasDeletedFiles;

      const newHasChanges = isInitialState
        ? false
        : hasNewFiles || hasDeletedFiles || hasLengthChanged;

      return {
        ...prev,
        media,
        deletedMediaIds: combinedDeletedIds,
        hasChanges: newHasChanges,
      };
    });
  };

  /**
   * Compares two arrays of media items for equality based on content.
   * Handles both existing Strapi media objects (by ID) and new File objects (by name/size).
   * @param {StrapiMediaItem[]} arr1 - The first media array.
   * @param {StrapiMediaItem[]} arr2 - The second media array.
   * @returns {boolean} True if the arrays contain the same media items, false otherwise.
   */
  const compareMediaArrays = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    const getMediaHash = (item) => {
      if (typeof window !== 'undefined' && item.file instanceof File) {
        return `file_${item.file.name}_${item.file.size}`;
      } else if (
        item.file &&
        typeof item.file === 'object' &&
        'id' in item.file
      ) {
        return `id_${item.file.id}`;
      }

      return JSON.stringify(item);
    };

    const set1 = new Set(arr1.map(getMediaHash));

    const set2 = new Set(arr2.map(getMediaHash));

    return arr2.every((item) => set1.has(getMediaHash(item)));
  };

  /**
   * Compares two arrays of primitive values (e.g., numbers) for equality.
   * @param {Array<number|string>} a - The first array.
   * @param {Array<number|string>} b - The second array.
   * @returns {boolean} True if the arrays contain the same elements, false otherwise.
   */
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();

    const sortedB = [...b].sort();

    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  /**
   * Callback passed to MediaGallery's onSave prop. Updates media state.
   * @param {StrapiMediaItem[]} media - The current media items in the gallery.
   * @param {number[]} deletedIds - IDs marked for deletion.
   * @returns {Promise<boolean>} Always returns true to indicate success to MediaGallery.
   */
  const handleMediaSave = async (media, deletedIds) => {
    handleMediaUpdate(media, deletedIds);

    return true;
  };

  /**
   * Determines if there are any changes in the form fields or the media gallery.
   * @returns {boolean} True if there are changes, false otherwise.
   */
  const hasFormChanges = () => {
    const formHasChanges = formFieldsChanged;

    const mediaHasChanges = mediaState.hasChanges;

    const hasDeletedMedia = mediaState.deletedMediaIds.length > 0;

    const hasReturnedToInitialState =
      mediaState.media.length === 0 &&
      originalMediaLength.current === 0 &&
      mediaState.deletedMediaIds.length === 0;

    const allMediaDeleted =
      mediaState.media.length === 0 && originalMediaLength.current > 0;

    if (hasReturnedToInitialState) {
      return formHasChanges;
    }
    if (allMediaDeleted) {
      return true;
    }

    return formHasChanges || mediaHasChanges || hasDeletedMedia;
  };

  // Search handlers for categories and subcategories (same as BasicInfoForm)
  const handleFreelancerCategories = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_CATEGORIES);

      const data = await searchData({
        query,
        searchTerm,
        searchTermType: 'label',
        page,
        additionalVariables: {
          categoriesPage: page,
          categoriesPageSize: 10,
        },
      });

      return data;
    },
    [],
  );

  const handleFreelancerSubcategories = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_SUBCATEGORIES);

      const data = await searchData({
        query,
        searchTerm,
        searchTermType: 'label',
        page,
        additionalVariables: {
          categorySlug: category.data?.attributes?.slug || '',
          type: type || '',
          subcategoriesPage: page,
          subcategoriesPageSize: 10,
        },
      });

      return data;
    },
    [category.data?.attributes?.slug],
  );

  // Handle Onbase and Onsite Searches (same as BasicInfoForm)
  const handleOnbaseZipcodes = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(ONBASE_ZIPCODES);

    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        onbaseZipcodesPage: page,
        onbaseZipcodesPageSize: 10,
      },
    });

    return data;
  }, []);

  const handleOnsiteCounties = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(ONSITE_COUNTIES);

    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        onsiteCountiesPage: page,
        onsiteCountiesPageSize: 10,
      },
    });

    return data;
  }, []);

  const handleOnsiteAreas = useCallback(
    async (searchTerm, page = 1) => {
      const countyIds = coverage?.counties?.data?.map((c) => c.id) || [];

      const query = normalizeQuery(ONSITE_AREAS);

      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          onsiteAreasPage: page,
          onsiteAreasPageSize: 10,
          counties: countyIds,
        },
      });

      return data;
    },
    [coverage?.counties?.data],
  );

  // Handle category change (same as BasicInfoForm)
  const handleCategorySelect = (selected) => {
    const categoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;

    setCategory({ data: categoryObj });
    // Reset dependent fields when changing category
    setSubcategory({ data: null });
  };

  const handleSubcategorySelect = (selected) => {
    const subcategoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;

    setSubcategory({ data: subcategoryObj });
  };

  // Handle coverage switches (same pattern as BasicInfoForm)
  const handleOnlineSwitch = () => {
    if (coverage === null) {
      useOnboardingStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      setTimeout(() => switchCoverageMode('online'), 0);
    } else {
      switchCoverageMode('online');
    }
  };

  const handleOnbaseSwitch = () => {
    if (coverage === null) {
      useOnboardingStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      setTimeout(() => switchCoverageMode('onbase'), 0);
    } else {
      switchCoverageMode('onbase');
    }
  };

  const handleOnsiteSwitch = () => {
    if (coverage === null) {
      useOnboardingStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      setTimeout(() => switchCoverageMode('onsite'), 0);
    } else {
      switchCoverageMode('onsite');
    }
  };

  const handleCountiesSelect = (selected) => {
    const newCountyIds = selected ? selected.map((c) => c.id) : [];

    const currentAreas = coverage?.areas?.data || [];

    const updatedAreas = currentAreas.filter((area) => {
      const countyData = area.data?.attributes?.county?.data;

      return countyData && newCountyIds.includes(countyData.id);
    });

    setCoverage('counties', { data: selected });
    setCoverage('areas', { data: updatedAreas });
  };

  const isCategorySelected = !!category.data;

  /**
   * Handles the form submission process (same pattern as BasicInfoForm).
   * Performs validation, uploads new media files, and calls the server action to update data.
   * @param {FormData} formData - The form data (not directly used, values taken from state/changes).
   */
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    // Only proceed if there are actual changes
    if (!hasFormChanges()) {
      setIsSubmitting(false);

      return;
    }

    try {
      // Step 1: Validate the form first with await to ensure validation completes
      const validationFormData = new FormData();

      validationFormData.append('id', fid);
      validationFormData.append('validateOnly', 'true');

      // Create validation state with placeholder for new image (same as BasicInfoForm)
      const formStateForValidation = {
        ...currentValues,
        image:
          image instanceof File ? { isNewFile: true } : currentValues.image,
      };

      validationFormData.append(
        'currentFormState',
        JSON.stringify(formStateForValidation),
      );
      validationFormData.append('changes', JSON.stringify(changes));

      const mediaValidationState = {
        hasNewMedia: mediaState.media.some((item) => item.file instanceof File),
        hasDeletedMedia: mediaState.deletedMediaIds.length > 0,
        mediaCount: mediaState.media.length,
      };

      validationFormData.append(
        'mediaState',
        JSON.stringify(mediaValidationState),
      );

      // Call server action WITH await to ensure validation completes
      const validationResult = await formAction(validationFormData);

      // Check validation result
      if (
        validationResult?.errors &&
        Object.keys(validationResult.errors).length > 0
      ) {
        setIsSubmitting(false);

        return; // Stop the submission if validation fails
      }

      // Step 2: Only if validation passed and we have a new image, upload it
      let uploadedImageId = null;

      if (image instanceof File) {
        try {
          const mediaOptions = {
            refId: fid,
            ref: 'api::freelancer.freelancer',
            field: 'image',
          };

          // This is a client-side operation, so we use await
          const uploadedIds = await uploadData([image], mediaOptions, token);

          uploadedImageId = uploadedIds[0];
          if (!uploadedImageId) {
            throw new Error('Image upload failed');
          }
        } catch (error) {
          // Handle image upload error
          setIsSubmitting(false);

          // Create error form data
          const errorFormData = new FormData();

          errorFormData.append('id', fid);
          errorFormData.append(
            'error',
            JSON.stringify({
              message: 'Σφάλμα κατά την μεταφόρτωση της εικόνας',
            }),
          );
          // Submit error WITH await
          await formAction(errorFormData);

          return;
        }
      }

      // Step 3: Upload portfolio media files
      let newPortfolioIds = [];

      const newPortfolioFiles = mediaState.media
        .filter((item) => item.file && item.file instanceof File)
        .map((item) => item.file);

      if (newPortfolioFiles.length > 0) {
        const mediaOptions = {
          refId: fid,
          ref: 'api::freelancer.freelancer',
          field: 'portfolio',
        };

        try {
          newPortfolioIds = await uploadData(newPortfolioFiles, mediaOptions, token);
          if (!newPortfolioIds.length && newPortfolioFiles.length > 0) {
            throw new Error('Failed to upload portfolio files');
          }
        } catch (error) {
          setIsSubmitting(false);

          const errorFormData = new FormData();

          errorFormData.append('id', fid);
          errorFormData.append(
            'error',
            JSON.stringify({
              message: 'Σφάλμα κατά την μεταφόρτωση των δειγμάτων εργασιών',
            }),
          );
          await formAction(errorFormData);

          return;
        }
      }

      // Step 4: Final submission with all data including uploaded image
      const finalFormData = new FormData();

      finalFormData.append('id', fid);

      // Prepare the final state with uploaded image ID (same as BasicInfoForm)
      const serializedValues = {
        ...currentValues,
        // Only include image data if we have a valid ID
        image: uploadedImageId
          ? { data: { id: uploadedImageId } }
          : currentValues.image?.data?.id
            ? currentValues.image // Keep existing image if it has an ID
            : null, // Otherwise set to null, not empty object
      };

      // Make sure we're not sending empty objects (same as BasicInfoForm)
      if (
        serializedValues.image &&
        (!serializedValues.image.data || !serializedValues.image.data.id)
      ) {
        serializedValues.image = null;
      }

      finalFormData.append(
        'currentFormState',
        JSON.stringify(serializedValues),
      );
      finalFormData.append('changes', JSON.stringify(changes));

      // Handle portfolio media (same pattern as PresentationForm)
      const remainingPortfolioIds = mediaState.media
        .filter(
          (item) =>
            item.file && typeof item.file === 'object' && 'id' in item.file,
        )
        .map((item) => item.file.id);

      const allPortfolioIds = [...remainingPortfolioIds, ...newPortfolioIds];

      const hasMediaDeletions = mediaState.deletedMediaIds.length > 0;

      const allMediaDeleted =
        mediaState.media.length === 0 && originalMediaLength.current > 0;

      if (mediaState.hasChanges || hasMediaDeletions || allMediaDeleted) {
        finalFormData.append(
          'remaining-media',
          JSON.stringify(allPortfolioIds),
        );
        finalFormData.append(
          'deleted-media',
          JSON.stringify(mediaState.deletedMediaIds),
        );
        if (allMediaDeleted) {
          finalFormData.append('all-media-deleted', 'true');
        }
      }

      finalFormData.append('onboardingComplete', 'true'); // Flag to redirect after completion

      // Reset success flag before submission
      hasProcessedSuccess.current = false;

      // Submit the final form data with transition for UI updates
      startTransition(() => {
        formAction(finalFormData);
      });
    } catch (error) {
      console.error('Submission error:', error);

      // Handle any unexpected errors
      const errorFormData = new FormData();

      errorFormData.append('id', fid);
      errorFormData.append(
        'error',
        JSON.stringify({
          message: 'Unexpected error during submission',
        }),
      );
      formAction(errorFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to handle coverage state preservation during errors (same as BasicInfoForm)
  useEffect(() => {
    if (formState?.errors && Object.keys(formState.errors).length > 0) {
      // Preserve the current coverage state during errors
      useOnboardingStore.setState((state) => ({
        ...state,
        coverage: { ...coverage }, // Just make a shallow copy of the current coverage
      }));
    }
  }, [formState?.errors]);

  return (
    <>
      <HeadingOnboarding />
      <form action={handleSubmit} className='onboarding-form'>
        <div className='form-style1'>
          <div className='bdrb1 pb15 mb25'>
            <h5 className='list-title heading'>Ολοκλήρωση Εγγραφής</h5>
          </div>

          {/* Image */}
          <label className='form-label dark-color mb0'>Εικόνα Προφίλ *</label>
          <p>Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο.</p>
          <ProfileImageInput
            name='image'
            image={
              image?.data?.attributes?.formats?.thumbnail?.url ||
              image?.data?.attributes?.url
            }
            onChange={(newImage) => {
              // Make sure we're setting the image correctly for both File objects and API data
              if (newImage instanceof File) {
                setImage(newImage);
              } else {
                setImage({ data: newImage?.data || null });
              }
            }}
            errors={formState?.errors?.image}
            displayName={displayName}
          />

          {/* Category/Subcategory */}
          <div className='row mt20'>
            <div className='col-md-6 pb-4'>
              <SearchableSelect
                name='category'
                label='Κατηγορία*'
                labelPlural='κατηγορίες'
                value={category.data}
                nameParam='label'
                pageParam='categoriesPage'
                pageSizeParam='categoriesPageSize'
                pageSize={10}
                onSearch={handleFreelancerCategories}
                onSelect={handleCategorySelect}
                isMulti={false}
                isClearable={true}
                formatSymbols
                capitalize
                errors={formState?.errors?.category}
              />
            </div>
            <div className='col-md-6'>
              <SearchableSelect
                name='subcategory'
                label='Υποκατηγορία*'
                labelPlural='υποκατηγορίες'
                value={subcategory.data}
                nameParam='label'
                pageParam='subcategoriesPage'
                pageSizeParam='subcategoriesPageSize'
                pageSize={10}
                onSearch={handleFreelancerSubcategories}
                onSelect={handleSubcategorySelect}
                isMulti={false}
                isClearable={true}
                formatSymbols
                capitalize
                errors={formState?.errors?.subcategory}
                isDisabled={!isCategorySelected}
                resetDependency={category.data?.id}
              />
            </div>
          </div>

          {/* Description */}
          <div className='mb20'>
            <label
              htmlFor='description'
              className='heading-color ff-heading fw500 mb0'
            >
              Περιγραφή*
            </label>
            <p>Μια περιγραφή για εσάς και τις υπηρεσίες που προσφέρετε.</p>
            <TextArea
              id='description'
              name='description'
              label='Περιγραφή*'
              placeholder='Τουλάχιστον 80 χαρακτήρες (2-3 προτάσεις)'
              minLength={80}
              maxLength={5000}
              counter
              value={description}
              onChange={setDescription}
              errors={formState?.errors?.description}
              hideLabel={true}
            />
          </div>

          {/* Service Provision Methods (Coverage) */}
          <div className='boxede mt30 mb20'>
            <label className='form-label fw700 dark-color mb10'>
              Τρόποι παροχής των Υπηρεσιών*
            </label>
            <div className='row coverage-fields'>
              <label className='form-label dark-color mb10'>
                Προσφέρω τις υπηρεσίες:
              </label>
              <div className='col-md-2'>
                <SwitchB
                  label='Online'
                  name='online'
                  initialValue={coverage?.online || false}
                  onChange={handleOnlineSwitch}
                  id='online-switch'
                />
              </div>
              <div className='col-md-2'>
                <SwitchB
                  label='Στον χώρο μου'
                  name='onbase'
                  initialValue={coverage?.onbase || false}
                  onChange={handleOnbaseSwitch}
                  id='onbase-switch'
                />
              </div>
              <div className='col-md-4'>
                <SwitchB
                  label='Στον χώρο του πελάτη'
                  name='onsite'
                  initialValue={coverage?.onsite || false}
                  onChange={handleOnsiteSwitch}
                  id='onsite-switch'
                />
              </div>
              {formState?.errors?.coverage ? (
                <div>
                  <p className='text-danger mb0 pb0'>
                    {formState.errors.coverage.message}
                  </p>
                </div>
              ) : null}
            </div>
            {coverage?.onbase && (
              <div className='row mb20 mt20'>
                <div className='col-md-3 pb-2'>
                  <InputB
                    label='Διεύθυνση'
                    id='address'
                    name='address'
                    type='text'
                    value={coverage?.address || ''}
                    onChange={(value) => setCoverage('address', value)}
                    className='form-control input-group'
                    errors={formState?.errors?.address}
                  />
                </div>
                <div className='col-md-3 pb-2'>
                  <SearchableSelect
                    name='zipcode'
                    label='Τ.Κ.'
                    labelPlural='Τ.Κ.'
                    value={coverage?.zipcode?.data}
                    nameParam='name'
                    pageParam='coverageZipcodePage'
                    pageSizeParam='coverageZipcodePageSize'
                    pageSize={10}
                    onSearch={handleOnbaseZipcodes}
                    onSelect={(selected) => {
                      setCoverage('zipcode', {
                        data: selected,
                      });
                      setCoverage('area', {
                        data: selected?.data?.attributes?.area?.data || null,
                      });
                      setCoverage('county', {
                        data: selected?.data?.attributes?.county?.data || null,
                      });
                    }}
                    isMulti={false}
                    isClearable={true}
                    formatSymbols
                    capitalize
                    errors={formState?.errors?.zipcode}
                  />
                </div>
                <div className='col-md-3 pb-2'>
                  <SearchableSelect
                    name='area'
                    label='Περιοχή'
                    value={coverage?.area?.data}
                    isDisabled={true}
                    formatSymbols
                    capitalize
                    errors={formState?.errors?.area}
                    customStyles={{
                      indicatorsContainer: () => ({ display: 'none' }),
                    }}
                  />
                </div>
                <div className='col-md-3 pb-2'>
                  <SearchableSelect
                    name='county'
                    label='Νομός'
                    value={coverage?.county?.data}
                    isMulti={false}
                    isClearable={true}
                    isDisabled={true}
                    formatSymbols
                    capitalize
                    errors={formState?.errors?.county}
                    customStyles={{
                      indicatorsContainer: () => ({ display: 'none' }),
                    }}
                  />
                </div>
              </div>
            )}
            {coverage?.onsite && (
              <div className='row mb20'>
                <div className='col-md-6 pb-4'>
                  <SearchableSelect
                    name='counties'
                    label='Νομοί'
                    labelPlural='νομοί'
                    value={coverage?.counties?.data}
                    nameParam='name'
                    pageParam='coverageCountiesPage'
                    pageSizeParam='coverageCountiesPageSize'
                    pageSize={10}
                    onSearch={handleOnsiteCounties}
                    onSelect={handleCountiesSelect}
                    isMulti={true}
                    isClearable={true}
                    formatSymbols
                    capitalize
                    errors={formState?.errors?.counties}
                  />
                </div>
                <div className='col-md-6'>
                  <SearchableSelect
                    name='areas'
                    label='Περιοχές'
                    labelPlural='περιοχές'
                    value={coverage?.areas?.data}
                    nameParam='areaTerm'
                    pageParam='coverageAreasPage'
                    pageSizeParam='coverageAreasPageSize'
                    pageSize={10}
                    onSearch={handleOnsiteAreas}
                    onSelect={(selected) => {
                      setCoverage('areas', {
                        data: selected,
                      });
                    }}
                    isMulti={true}
                    isClearable={true}
                    formatSymbols
                    capitalize
                    key={(coverage?.counties?.data || [])
                      .map((c) => c.id)
                      .join('-')}
                    errors={formState?.errors?.areas}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Portfolio */}
          <label className='form-label fw700 dark-color mb0 mt10'>
            Portfolio - Δείγμα εργασιών (προαιρετικό)
          </label>
          <p className='text-muted mb0'>
            Αρχεία από εργασίες που έχετε υλοποιήσει.
          </p>
          <MediaGallery
            initialMedia={[]}
            onUpdate={handleMediaUpdate}
            onSave={handleMediaSave}
            isPending={isSubmitting || isPending}
            custom={true}
            maxSize={15}
            maxVideos={3}
            maxAudio={3}
          />

          {formState?.errors && formState?.errors?.submit && (
            <AlertForm
              type='error'
              message={formState.errors.submit.message}
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
            orientation='center'
            isPending={isSubmitting || isPending}
            hasChanges={hasFormChanges()}
            defaultText='Ολοκλήρωση Εγγραφής'
            loadingText='Ολοκλήρωση Εγγραφής...'
          />
        </div>
      </form>
    </>
  );
}
