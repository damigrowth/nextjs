'use client';

import React, {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  InputB,
  ProfileImageInput,
  SearchableSelect,
  SwitchB,
  TextArea,
} from '@/components/input';
import { useFormChanges } from '@/hooks/useFormChanges';
import { searchData } from '@/lib/client/operations';
import {
  FREELANCER_PROFILE_CATEGORIES,
  FREELANCER_PROFILE_SKILLS,
  FREELANCER_PROFILE_SUBCATEGORIES,
  ONBASE_ZIPCODES,
  ONSITE_AREAS,
  ONSITE_COUNTIES,
} from '@/lib/graphql';
import useEditProfileStore from '@/stores/dashboard/profile';
import { normalizeQuery } from '@/utils/queries';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';
import { updateBasicInfo } from '@/actions/tenant/basic';
import { uploadData } from '@/actions/shared/upload';

export default function BasicInfoForm({ freelancer, type }) {
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
    tagline,
    setTagline,
    description,
    setDescription,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    skills,
    setSkills,
    coverage,
    setCoverage,
    switchCoverageMode,
    specialization,
    setSpecialization,
    displayName,
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateBasicInfo,
    initialState,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalValues = {
    image: freelancer.image || { data: null },
    tagline: freelancer.tagline,
    description: freelancer.description,
    category: freelancer.category,
    subcategory: freelancer.subcategory,
    skills: freelancer.skills,
    specialization: freelancer.specialization,
    coverage: freelancer.coverage,
  };

  const currentValues = {
    image,
    tagline,
    description,
    category,
    subcategory,
    skills,
    specialization,
    coverage,
  };

  const { changes, hasChanges } = useFormChanges(currentValues, originalValues);

  // Handle Onbase and Onsite Searches
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
      // Use optional chaining and provide a default empty array
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
          type: type || '',
          categorySlug: category.data?.attributes?.slug || '',
          subcategoriesPage: page,
          subcategoriesPageSize: 10,
        },
      });

      return data;
    },
    [category.data?.attributes?.slug, type],
  );

  const handleSkills = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_SKILLS);

      const data = await searchData({
        query,
        searchTerm: searchTerm || '', // Handle empty search term
        searchTermType: 'label',
        page,
        additionalVariables: {
          categorySlug: category.data?.attributes?.slug || '',
          skillsPage: page,
          skillsPageSize: 10,
        },
      });

      return data;
    },
    [category.data?.attributes?.slug],
  );

  const handleOnlineSwitch = () => {
    // Initialize coverage if it's null before switching
    if (coverage === null) {
      useEditProfileStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      // After initializing, call switchCoverageMode
      setTimeout(() => switchCoverageMode('online', freelancer.coverage), 0);
    } else {
      switchCoverageMode('online', freelancer.coverage);
    }
  };

  const handleOnbaseSwitch = () => {
    // Initialize coverage if it's null before switching
    if (coverage === null) {
      useEditProfileStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      // After initializing, call switchCoverageMode
      setTimeout(() => switchCoverageMode('onbase', freelancer.coverage), 0);
    } else {
      switchCoverageMode('onbase', freelancer.coverage);
    }
  };

  const handleOnsiteSwitch = () => {
    // Initialize coverage if it's null before switching
    if (coverage === null) {
      useEditProfileStore.setState((state) => ({
        ...state,
        coverage: defaultCoverage,
      }));
      // After initializing, call switchCoverageMode
      setTimeout(() => switchCoverageMode('onsite', freelancer.coverage), 0);
    } else {
      switchCoverageMode('onsite', freelancer.coverage);
    }
  };

  // Handle category change
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
    setSkills({ data: [] });
    setSpecialization({ data: null });
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

  const handleSkillsSelect = (selected) => {
    const newSkills = selected
      ? selected.map((item) => ({
          id: item.id,
          attributes: item.attributes,
        }))
      : [];

    setSkills({ data: newSkills });
    // Check if current specialization exists in the new skills
    if (
      specialization.data &&
      !newSkills.some((skill) => skill.id === specialization.data.id)
    ) {
      setSpecialization({ data: null });
    }
  };

  const handleSpecializationSelect = (selected) => {
    const specializationObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.data.label,
            slug: selected.data.slug,
          },
        }
      : null;

    setSpecialization({
      data: specializationObj,
    });
  };

  const handleCountiesSelect = (selected) => {
    const newCountyIds = selected ? selected.map((c) => c.id) : [];

    // Use optional chaining for safely accessing coverage.areas.data
    const currentAreas = coverage?.areas?.data || [];

    const updatedAreas = currentAreas.filter((area) => {
      const countyData = area.data?.attributes?.county?.data;

      return countyData && newCountyIds.includes(countyData.id);
    });

    setCoverage('counties', { data: selected });
    setCoverage('areas', { data: updatedAreas });
  };

  // Check if category is selected
  const isCategorySelected = !!category.data;

  const isSubcategorySelected = !!subcategory.data;

  const specializations =
    skills.data?.map((skill) => ({
      id: skill.id,
      slug: skill.attributes?.slug,
      label: skill.attributes?.label || skill.attributes?.name,
    })) || [];

  // Updated handleSubmit function for BasicInfoForm
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    // Only proceed if there are actual changes
    if (!hasChanges) {
      setIsSubmitting(false);

      return;
    }
    try {
      // Step 1: Validate the form first with await to ensure validation completes
      const validationFormData = new FormData();

      validationFormData.append('id', freelancer.id);
      validationFormData.append('validateOnly', 'true');

      // Create validation state with placeholder for new image
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
            refId: freelancer.id,
            ref: 'api::freelancer.freelancer',
            field: 'image',
          };

          // This is a client-side operation, so we use await
          const uploadedIds = await uploadData([image], mediaOptions);

          uploadedImageId = uploadedIds[0];
          if (!uploadedImageId) {
            throw new Error('Image upload failed');
          }
        } catch (error) {
          // Handle image upload error
          setIsSubmitting(false);

          // Create error form data
          const errorFormData = new FormData();

          errorFormData.append('id', freelancer.id);
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

      // Step 3: Final submission with all data including uploaded image
      const finalFormData = new FormData();

      finalFormData.append('id', freelancer.id);

      // Prepare the final state with uploaded image ID
      const serializedValues = {
        ...currentValues,
        // Only include image data if we have a valid ID
        image: uploadedImageId
          ? { data: { id: uploadedImageId } }
          : currentValues.image?.data?.id
            ? currentValues.image // Keep existing image if it has an ID
            : null, // Otherwise set to null, not empty object
      };

      // Make sure we're not sending empty objects
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
      // Submit the final form data with transition for UI updates
      startTransition(() => {
        formAction(finalFormData);
      });
    } catch (error) {
      console.error('Submission error:', error);

      // Handle any unexpected errors
      const errorFormData = new FormData();

      errorFormData.append('id', freelancer.id);
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

  useEffect(() => {
    // This effect will run when formState changes (like when errors occur)
    if (formState?.errors && Object.keys(formState.errors).length > 0) {
      // Preserve the current coverage state during errors
      useEditProfileStore.setState((state) => ({
        ...state,
        coverage: { ...coverage }, // Just make a shallow copy of the current coverage
      }));
    }
  }, [formState?.errors]);

  return (
    <form action={handleSubmit}>
      <div className='form-style1'>
        <div className='bdrb1 pb15 mb10'>
          <h5 className='list-title heading'>Βασικά Στοιχεία</h5>
        </div>
        <p className='text-muted mb0'>
          Για τη δημόσια προβολή του προφίλ θα πρέπει να υπάρχουν:
        </p>
        <div className='text-muted mb30'>
          <div className='d-flex align-items-center mb2'>
            <span className='me-2' style={{ color: '#6c757d' }}>
              •
            </span>
            <span>
              Εικόνα Προφίλ (Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο)
            </span>
          </div>
          <div className='d-flex align-items-center mb2'>
            <span className='me-2' style={{ color: '#6c757d' }}>
              •
            </span>
            <span>Κατηγορία/Υποκατηγορία</span>
          </div>
          <div className='d-flex align-items-center'>
            <span className='me-2' style={{ color: '#6c757d' }}>
              •
            </span>
            <span>Τρόποι παροχής των Υπηρεσιών (τουλάχιστον μία επιλογή)</span>
          </div>
        </div>
        <label className='form-label fw500 dark-color'>Εικόνα Προφίλ*</label>
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
        <div className='mb20 mt20 col-md-6'>
          <InputB
            label='Σύντομη Περιγραφή'
            id='tagline'
            name='tagline'
            type='text'
            value={tagline}
            onChange={setTagline}
            className='form-control input-group'
            errors={formState?.errors?.tagline?.message || null}
          />
        </div>
        <div className='mb20 mt20'>
          <TextArea
            id='description'
            name='description'
            label='Κείμενο (Σχετικά)'
            minLength={80}
            maxLength={5000}
            counter
            value={description}
            onChange={setDescription}
            errors={formState?.errors?.description}
          />
        </div>
        <div className='row mb40'>
          <div className='col-md-4 pb-4'>
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
          <div className='col-md-4'>
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
        <div className='boxede'>
          <label className='form-label fw700 dark-color mb10'>
            Τρόποι παροχής των Υπηρεσιών*
          </label>
          <div className='row '>
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
        <div className='row mb40 mt40'>
          <div className='col-md-6 pb-4'>
            <SearchableSelect
              name='skills'
              label='Δεξιότητες'
              labelPlural='δεξιότητες'
              value={skills.data}
              nameParam='label'
              pageParam='skillsPage'
              pageSizeParam='skillsPageSize'
              pageSize={10}
              onSearch={handleSkills}
              onSelect={handleSkillsSelect}
              isMulti={true}
              maxSelections={5}
              isClearable={true}
              formatSymbols
              capitalize
              errors={formState?.errors?.skills}
              isDisabled={!isCategorySelected || !isSubcategorySelected}
              resetDependency={category.data?.id}
              showOptionsOnType={true}
            />
          </div>
          <div className='col-md-3'>
            <SearchableSelect
              name='specialization'
              label='Εξειδίκευση'
              labelPlural='εξειδικεύσεις'
              value={specialization.data || null}
              staticOptions={specializations}
              onSelect={handleSpecializationSelect}
              isMulti={false}
              isClearable={true}
              formatSymbols
              capitalize
              errors={formState?.errors?.specialization}
              isDisabled={skills?.data?.length === 0}
              resetDependency={
                skills.data ? skills.data.map((s) => s.id).join('-') : 'none'
              }
            />
          </div>
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
          isPending={isSubmitting || isPending}
          hasChanges={hasChanges}
        />
      </div>
    </form>
  );
}
