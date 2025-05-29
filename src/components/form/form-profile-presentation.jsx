'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  InputB,
  MediaGallery,
  SocialsInputs,
  SwitchB,
} from '@/components/input';
import { useFormChanges } from '@/hooks/useFormChanges';
import useEditProfileStore from '@/stores/dashboard/profile';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';
import { updatePresentationInfo } from '@/actions/tenant/presentation';
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
 * Renders the presentation form for editing freelancer profile details.
 * Includes fields for visibility settings, website, Viber, WhatsApp, social media links, and portfolio media gallery.
 * Handles form state, validation, media uploads, and submission via a server action.
 *
 * @param {object} props - The component props.
 * @param {Freelancer} props.freelancer - The freelancer data object.
 * @param {string} props.jwt - The JWT token for authenticated requests.
 * @returns {JSX.Element} The PresentationForm component.
 */
export default function PresentationForm({ freelancer }) {
  /**
   * Zustand store state and setters for presentation form fields.
   */
  const {
    website,
    setWebsite,
    visibility,
    setVisibility,
    socials,
    setSocial,
    viber,
    setViber,
    whatsapp,
    setWhatsapp,
    phone, // Added phone state
    setPhone, // Added phone setter
  } = useEditProfileStore();

  /**
   * Initial state for the server action response.
   * @type {{ data: any, errors: object, message: string | null }}
   */
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  /**
   * Ref to track if a successful form submission has been processed to prevent loops.
   * @type {React.MutableRefObject<boolean>}
   */
  const hasProcessedSuccess = useRef(false);

  /**
   * State hook for managing server action state (response, errors, pending status).
   * @type {[typeof initialState, (formData: FormData) => Promise<typeof initialState>, boolean]}
   */
  const [formState, formAction, isPending] = useActionState(
    updatePresentationInfo,
    initialState,
  );

  /**
   * Local state to track the submission process initiated by the user.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Original values of the form fields loaded from the freelancer data.
   * Used by `useFormChanges` hook for change detection.
   */
  const originalValues = {
    website: freelancer.website || '',
    visibility: freelancer.visibility || {
      phone: false,
      email: false,
      address: false,
    },
    socials: freelancer.socials || {
      facebook: null,
      linkedin: null,
      x: null,
      youtube: null,
      github: null,
      instagram: null,
      behance: null,
      dribbble: null,
    },
    viber: freelancer.viber || null,
    whatsapp: freelancer.whatsapp || null,
    phone: freelancer.phone ? Number(freelancer.phone) : null, // Added phone
  };

  /**
   * Current values of the form fields from the Zustand store.
   * Used by `useFormChanges` hook for change detection.
   */
  const currentValues = {
    website,
    visibility,
    socials,
    viber,
    whatsapp,
    phone: phone ? Number(phone) : null, // Added phone
  };

  /**
   * Custom hook to detect changes in form fields compared to original values.
   * @type {{ changes: object, hasChanges: boolean }}
   */
  const { changes, hasChanges: formFieldsChanged } = useFormChanges(
    currentValues,
    originalValues,
  );

  /**
   * Ref to store the original number of media items.
   * @type {React.MutableRefObject<number>}
   */
  const originalMediaLength = useRef(freelancer.portfolio?.data?.length || 0);

  /**
   * Local state to manage the media gallery items, deletions, and change status.
   * @type {[MediaState, React.Dispatch<React.SetStateAction<MediaState>>]}
   */
  const [mediaState, setMediaState] = useState({
    media: freelancer.portfolio?.data || [],
    deletedMediaIds: [],
    hasChanges: false,
    initialMediaIds: (freelancer.portfolio?.data || [])
      .map((item) => item.id)
      .filter(Boolean),
  });

  /**
   * Processes social media errors from the form state for easier display in SocialsInputs.
   * @returns {object} An object mapping social platforms to their specific error messages.
   */
  const getSocialErrors = () => {
    const errors = {};

    if (formState?.errors?.socials) {
      Object.entries(formState.errors.socials).forEach(([platform, value]) => {
        if (value && value.url && value.url.message) {
          errors[platform] = { message: value.url.message };
        } else if (value && value.message) {
          errors[platform] = { message: value.message };
        }
      });
    }

    return errors;
  };

  /**
   * Processed social media errors.
   */
  const socialErrors = getSocialErrors();

  /**
   * Effect to reset the success processing flag when the component unmounts.
   */
  useEffect(() => {
    return () => {
      hasProcessedSuccess.current = false;
    };
  }, []);
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
          const updatedMedia = freelancer.portfolio?.data || [];

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
  }, [formState, freelancer.portfolio?.data]); // Added freelancer.portfolio?.data dependency

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
  const hasChanges = () => {
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

  /**
   * Handles the form submission process.
   * Performs validation, uploads new media files, and calls the server action to update data.
   * Converts empty strings for website, viber, and whatsapp to null.
   * @param {FormData} formData - The form data (not directly used, values taken from state/changes).
   */
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    if (!hasChanges()) {
      setIsSubmitting(false);

      return;
    }
    try {
      // Step 1: Validate form changes
      const validationFormData = new FormData();

      validationFormData.append('id', freelancer.id);
      validationFormData.append('validateOnly', 'true');

      const formChangesToValidate = {};

      if (changes.website !== undefined)
        formChangesToValidate.website = changes.website;
      if (changes.visibility)
        formChangesToValidate.visibility = changes.visibility;
      if (changes.socials) formChangesToValidate.socials = changes.socials;
      if (changes.viber !== undefined)
        formChangesToValidate.viber = changes.viber;
      if (changes.whatsapp !== undefined)
        formChangesToValidate.whatsapp = changes.whatsapp;
      if (changes.phone !== undefined)
        // Added phone validation check
        formChangesToValidate.phone = changes.phone;

      const mediaValidationState = {
        hasNewMedia: mediaState.media.some((item) => item.file instanceof File),
        hasDeletedMedia: mediaState.deletedMediaIds.length > 0,
        mediaCount: mediaState.media.length,
      };

      validationFormData.append(
        'changes',
        JSON.stringify(formChangesToValidate),
      );
      validationFormData.append(
        'mediaState',
        JSON.stringify(mediaValidationState),
      );

      const validationResult = await formAction(validationFormData);

      if (
        validationResult?.errors &&
        Object.keys(validationResult.errors).length > 0
      ) {
        setIsSubmitting(false);

        return;
      }

      // Step 2: Upload new media files
      let newMediaIds = [];

      const newFiles = mediaState.media
        .filter((item) => item.file && item.file instanceof File)
        .map((item) => item.file);

      if (newFiles.length > 0) {
        const mediaOptions = {
          refId: freelancer.id,
          ref: 'api::freelancer.freelancer',
          field: 'portfolio',
        };

        try {
          newMediaIds = await uploadData(newFiles, mediaOptions);
          if (!newMediaIds.length && newFiles.length > 0) {
            throw new Error('Failed to upload media files');
          }
        } catch (error) {
          setIsSubmitting(false);

          const errorFormData = new FormData();

          errorFormData.append('id', freelancer.id);
          errorFormData.append(
            'error',
            JSON.stringify({
              message: 'Σφάλμα κατά την μεταφόρτωση των αρχείων',
            }),
          );
          await formAction(errorFormData);

          return;
        }
      }

      // Step 3: Prepare final submission data
      const finalFormData = new FormData();

      finalFormData.append('id', freelancer.id);

      const formChanges = {};

      if (changes.website !== undefined) {
        formChanges.website = changes.website === '' ? null : changes.website;
      }
      if (changes.visibility) {
        formChanges.visibility = changes.visibility;
      }
      if (changes.socials) {
        formChanges.socials = changes.socials;
      }
      if (changes.viber !== undefined) {
        formChanges.viber = changes.viber === '' ? null : changes.viber;
      }
      if (changes.whatsapp !== undefined) {
        formChanges.whatsapp =
          changes.whatsapp === '' ? null : changes.whatsapp;
      }
      if (changes.phone !== undefined) {
        // Added phone to final changes
        formChanges.phone = changes.phone === '' ? null : Number(changes.phone);
      }
      finalFormData.append('changes', JSON.stringify(formChanges));

      const remainingMediaIds = mediaState.media
        .filter(
          (item) =>
            item.file && typeof item.file === 'object' && 'id' in item.file,
        )
        .map((item) => item.file.id);

      const allMediaIds = [...remainingMediaIds, ...newMediaIds];

      const hasMediaDeletions = mediaState.deletedMediaIds.length > 0;

      const allMediaDeleted =
        mediaState.media.length === 0 && originalMediaLength.current > 0;

      if (mediaState.hasChanges || hasMediaDeletions || allMediaDeleted) {
        finalFormData.append('remaining-media', JSON.stringify(allMediaIds));
        finalFormData.append(
          'deleted-media',
          JSON.stringify(mediaState.deletedMediaIds),
        );
        if (allMediaDeleted) {
          finalFormData.append('all-media-deleted', 'true');
        }
      }
      hasProcessedSuccess.current = false;
      // Step 4: Call server action
      startTransition(() => {
        formAction(finalFormData);
      });
    } catch (error) {
      const errorFormData = new FormData();

      errorFormData.append('id', freelancer.id);
      errorFormData.append(
        'error',
        JSON.stringify({
          message: 'Προέκυψε σφάλμα κατά την υποβολή',
        }),
      );
      formAction(errorFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit}>
      <div className='form-style1'>
        <div className='bdrb1 pb15 mb25'>
          <h5 className='list-title heading'>Παρουσίαση</h5>
        </div>
        {/* 1st row: Phone - Website */}
        <div className='row mb20'>
          <div className='col-md-3'>
            <InputB
              label='Τηλέφωνο'
              id='phone'
              name='phone'
              type='tel'
              pattern='[0-9]*'
              inputMode='numeric'
              value={phone || ''}
              onChange={setPhone}
              className='form-control input-group'
              errors={formState?.errors?.phone}
              icon='fa fa-phone' // Optional: Add an icon
            />
          </div>
          <div className='col-md-3'>
            <InputB
              label='Ιστότοπος'
              id='website'
              name='website'
              type='url'
              placeholder='https://selida.gr'
              value={website}
              onChange={setWebsite}
              className='form-control input-group'
              errors={formState?.errors?.website}
              icon='fa fa-globe'
            />
          </div>
        </div>
        {/* 2nd row: Visibility Toggles */}
        <label className='form-label fw700 dark-color mb10'>
          Εμφάνιση στο προφίλ
        </label>
        <div className='row mb40'>
          <div className='col-md-2'>
            <SwitchB
              label='Email'
              name='visibility_email'
              initialValue={visibility?.email || false}
              onChange={(checked) => setVisibility('email', checked)}
            />
          </div>
          <div className='col-md-2'>
            <SwitchB
              label='Τηλέφωνο'
              name='visibility_phone'
              initialValue={visibility?.phone || false}
              onChange={(checked) => setVisibility('phone', checked)}
            />
          </div>
          <div className='col-md-2'>
            <SwitchB
              label='Διεύθυνση'
              name='visibility_address'
              initialValue={visibility?.address || false}
              onChange={(checked) => setVisibility('address', checked)}
            />
          </div>
        </div>
        {/* 3rd row: Media Gallery */}
        <label className='form-label fw700 dark-color mb10'>
          Δείγμα εργασιών
        </label>
        <MediaGallery
          initialMedia={freelancer.portfolio?.data || []}
          onUpdate={handleMediaUpdate}
          onSave={handleMediaSave}
          isPending={isSubmitting || isPending}
          custom={true}
          maxSize={15}
          maxVideos={3}
          maxAudio={3}
        />
        {/* 4th row: Viber - Whatsapp */}
        <div className='row mb20 mt40'>
          <div className='col-md-3'>
            <InputB
              label='Viber'
              id='viber'
              name='viber'
              type='tel'
              placeholder='69ΧΧΧΧΧΧΧΧ'
              pattern='[0-9]*'
              inputMode='numeric'
              value={viber || ''}
              onChange={setViber}
              className='form-control input-group'
              errors={formState?.errors?.viber}
              icon='fab fa-viber'
            />
          </div>
          <div className='col-md-3'>
            <InputB
              label='Whatsapp'
              id='whatsapp'
              name='whatsapp'
              type='tel'
              placeholder='69ΧΧΧΧΧΧΧΧ'
              pattern='[0-9]*'
              inputMode='numeric'
              value={whatsapp || ''}
              onChange={setWhatsapp}
              className='form-control input-group'
              errors={formState?.errors?.whatsapp}
              icon='fab fa-whatsapp'
            />
          </div>
        </div>
        {/* 5th row: Social Networks */}
        <label className='form-label fw700 dark-color mt20'>
          Κοινωνικά Δίκτυα
        </label>
        <SocialsInputs
          data={socials}
          username={freelancer.username}
          onChange={setSocial}
          errors={socialErrors}
        />
        {formState?.errors && formState?.errors?.submit && (
          <AlertForm
            type='error'
            message={formState.errors.submit}
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
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
