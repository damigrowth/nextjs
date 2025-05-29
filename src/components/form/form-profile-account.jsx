'use client';

import { startTransition, useActionState, useState } from 'react';

import { useFormChanges } from '@/hooks/useFormChanges';
import useEditProfileStore from '@/stores/dashboard/profile';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';
import { InputB, ProfileImageInput } from '../input';
import { ChangePasswordForm, DeleteAccountForm } from '.';
import { updateAccountInfo } from '@/actions/tenant/account';
import { uploadData } from '@/actions/shared/upload';

export default function AccountForm({ freelancer, type }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateAccountInfo,
    initialState,
  );

  const isUser = type === 'user';

  const { image, setImage, email, username, displayName, setDisplayName } =
    useEditProfileStore();

  // Conditionally define values based on user type
  const originalValues = {
    displayName: freelancer.displayName,
    ...(isUser && { image: freelancer.image || { data: null } }), // Include image only for users
  };

  const currentValues = {
    displayName,
    ...(isUser && { image }), // Include image only for users
  };

  // Use custom hook to track changes
  const { changes, hasChanges } = useFormChanges(currentValues, originalValues);

  const [isSubmitting, setIsSubmitting] = useState(false); // Added state

  // Updated handleSubmit function
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    // Only proceed if there are actual changes
    if (!hasChanges) {
      setIsSubmitting(false);

      return;
    }
    try {
      if (isUser) {
        // --- Start of isUser specific logic ---
        // Step 1: Validate the form first
        const validationFormData = new FormData();

        validationFormData.append('id', freelancer.id);
        validationFormData.append('type', type); // Add type
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
              ref: 'api::freelancer.freelancer', // Assuming the ref is the same, adjust if needed
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
        finalFormData.append('type', type); // Add type

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
        // --- End of isUser specific logic ---
      } else {
        // --- Start of non-user (freelancer) logic ---
        // Original simpler submission
        const simpleFormData = new FormData(); // Use a different name to avoid confusion

        simpleFormData.append('id', freelancer.id);
        simpleFormData.append('type', type); // Add type
        // Only include changes relevant to non-image fields if needed,
        // otherwise, just pass the detected changes.
        // For simplicity, passing all detected changes (which won't include image for non-users)
        simpleFormData.append('changes', JSON.stringify(changes));
        startTransition(() => {
          formAction(simpleFormData); // Call the action directly
        });
        // --- End of non-user (freelancer) logic ---
      }
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

  return (
    <>
      <form action={handleSubmit} className='ps-widget bdrs4 position-relative'>
        <div className='form-style1'>
          <div className='bdrb1 pb15 mb25'>
            <h5 className='list-title heading'>Λογαριασμός</h5>
          </div>
          {isUser && (
            <div className='row'>
              <label className='form-label fw500 dark-color'>
                Εικόνα Προφίλ
              </label>
              <ProfileImageInput
                name='image'
                image={
                  image?.data?.attributes?.formats?.thumbnail?.url ||
                  image?.data?.attributes?.url
                }
                displayName={displayName}
                onChange={(newImage) => {
                  // Make sure we're setting the image correctly for both File objects and API data
                  if (newImage instanceof File) {
                    setImage(newImage);
                  } else {
                    setImage({ data: newImage?.data || null });
                  }
                }}
                errors={formState?.errors?.image}
              />
            </div>
          )}
          <div className='row'>
            <div className='mb10 col-md-3'>
              <InputB
                label='Email*'
                id='email'
                name='email'
                type='email'
                value={email}
                className='form-control input-group'
                disabled={true}
              />
            </div>
            <div className='mb10 col-md-3'>
              <InputB
                label='Username*'
                id='username'
                name='username'
                type='text'
                value={username}
                className='form-control input-group'
                disabled={true}
              />
            </div>
            <div className='mb10 col-md-3'>
              <InputB
                label='Όνομα προβολής*'
                id='displayName'
                name='displayName'
                type='text'
                value={displayName}
                onChange={setDisplayName}
                className='form-control input-group'
                errors={formState?.errors?.displayName}
              />
            </div>
          </div>
          <div className='ps-widget bdrs4 overflow-hidden position-relative pt10 pb10'>
            <button
              type='button'
              className='btn-none'
              data-bs-toggle='modal'
              data-bs-target='#changePasswordModal'
            >
              Αλλαγή Κωδικού
            </button>
          </div>
          {formState?.errors && (
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
            orientation='end'
            isPending={isSubmitting || isPending} // Update isPending check
            hasChanges={hasChanges}
            variant='primary'
          />
        </div>
      </form>
      <ChangePasswordForm />
      <DeleteAccountForm username={username} />
    </>
  );
}
