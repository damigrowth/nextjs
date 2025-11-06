'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Standard shadcn/ui imports
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import { toast } from 'sonner';

// Icons (lucide-react + brands)
import { Loader2, Phone, Globe, MessageCircle } from 'lucide-react';
import { Icon } from '@/components/icon/brands';

// Auth and utilities
import { formatInput } from '@/lib/utils/validation/formats';
import { populateFormData, parseVisibilityJSON } from '@/lib/utils/form';

// Validation schema and server actions
import {
  profilePresentationUpdateSchema,
  type ProfilePresentationUpdateInput,
} from '@/lib/validations/profile';
import { updateProfilePresentation } from '@/actions/profiles/presentation';
import { updateProfilePresentationAdmin } from '@/actions/admin/profiles/presentation';
import { FormButton } from '../../shared';
import { AuthUser, ProfileWithRelations } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';
import { Profile } from '@prisma/client';

const initialState = {
  success: false,
  message: '',
};

// Default visibility configuration - outside component to prevent re-creation
const initialVisibility = {
  email: true,
  phone: true,
  address: true,
};

// Default socials configuration - outside component to prevent re-creation
const initialSocials = {
  facebook: '',
  instagram: '',
  linkedin: '',
  x: '',
  youtube: '',
  github: '',
  behance: '',
  dribbble: '',
};

// Available social media platforms
const socialPlatformOptions: Option[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'behance', label: 'Behance' },
  { value: 'dribbble', label: 'Dribbble' },
];

interface PresentationInfoFormProps {
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
  adminMode?: boolean;
  hideCard?: boolean;
}

export default function PresentationInfoForm({
  initialUser,
  initialProfile,
  adminMode = false,
  hideCard = false,
}: PresentationInfoFormProps) {
  // Select the appropriate action based on admin mode
  const actionToUse = adminMode
    ? updateProfilePresentationAdmin
    : updateProfilePresentation;

  const [state, action, isPending] = useActionState(actionToUse, initialState);

  const router = useRouter();

  // Extract data from props
  const profile = initialProfile;

  // State for selected social platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const form = useForm<ProfilePresentationUpdateInput>({
    resolver: zodResolver(profilePresentationUpdateSchema),
    defaultValues: {
      phone: '',
      website: '',
      viber: '',
      whatsapp: '',
      visibility: {
        email: true,
        phone: true,
        address: true,
      },
      socials: initialSocials,
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = form;

  // Update form values when initial data is available
  useEffect(() => {
    if (profile) {
      const resetData = {
        phone: profile.phone || '',
        website: profile.website || '',
        viber: profile.viber || '',
        whatsapp: profile.whatsapp || '',
        visibility: profile.visibility || initialVisibility,
        socials: profile.socials || initialSocials,
      };
      form.reset(resetData);

      // Initialize selected platforms based on existing data
      const existingSocials = profile.socials || {};
      const activePlatforms = Object.keys(existingSocials).filter(
        (key) => existingSocials[key as keyof typeof existingSocials] && existingSocials[key as keyof typeof existingSocials] !== ''
      );
      setSelectedPlatforms(activePlatforms);
    }
  }, [profile]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Show success toast
      toast.success(state.message || 'Profile updated successfully');
      // Refresh the page to get updated data
      router.refresh();
    } else if (state.message && !state.success) {
      // Show error toast
      toast.error(state.message);
    }
  }, [state.success, state.message, router]);

  // Form submission handler using utility function
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData using utility function
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['phone', 'website', 'viber', 'whatsapp'], // Simple text fields
      jsonFields: ['visibility', 'socials'], // Objects that need JSON.stringify
      skipEmpty: true, // Skip null/undefined/empty values
    });

    // Add profileId when in admin mode
    if (adminMode && initialProfile?.id) {
      formData.set('profileId', initialProfile.id);
    }

    // Call server action
    action(formData);
  };

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className={hideCard ? 'space-y-6' : 'space-y-6 p-6 border rounded-lg'}
      >
        {/* Contact Fields - All in one row */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' />
                  Τηλέφωνο
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='69XXXXXXXX'
                    maxLength={10}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <Globe className='h-4 w-4' />
                  Ιστοσελίδα
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://www.example.com'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='viber'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <MessageCircle className='h-4 w-4 text-purple-500' />
                  Viber
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='69XXXXXXXX'
                    maxLength={10}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='whatsapp'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <MessageCircle className='h-4 w-4 text-green-500' />
                  WhatsApp
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='69XXXXXXXX'
                    maxLength={10}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Visibility Settings */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium'>Ορατότητα Στοιχείων</h4>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <FormField
              control={form.control}
              name='visibility.email'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>Email</FormLabel>
                    <div className='text-xs text-muted-foreground'>
                      Εμφάνιση email
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(newValue) => {
                        setValue('visibility.email', newValue, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='visibility.phone'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>Τηλέφωνο</FormLabel>
                    <div className='text-xs text-muted-foreground'>
                      Εμφάνιση τηλεφώνου
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(newValue) => {
                        setValue('visibility.phone', newValue, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='visibility.address'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>Διεύθυνση</FormLabel>
                    <div className='text-xs text-muted-foreground'>
                      Εμφάνιση διεύθυνσης
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(newValue) => {
                        setValue('visibility.address', newValue, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 4: Social Media */}
        <div className='space-y-4'>
          <h4 className='text-sm font-medium'>Κοινωνικά Δίκτυα</h4>

          {/* MultiSelect for choosing platforms */}
          <div className='space-y-4'>
            <FormItem>
              <FormLabel>Επιλέξτε Κοινωνικά Δίκτυα</FormLabel>
              <FormControl>
                <MultiSelect
                  options={socialPlatformOptions}
                  selected={selectedPlatforms}
                  onChange={(platforms) => {
                    // Find removed platforms
                    const removedPlatforms = selectedPlatforms.filter(
                      (p) => !platforms.includes(p)
                    );

                    // Clear form values for removed platforms
                    removedPlatforms.forEach((platform) => {
                      setValue(`socials.${platform}` as any, '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    });

                    setSelectedPlatforms(platforms);
                  }}
                  placeholder='Επιλέξτε κοινωνικά δίκτυα...'
                  renderLabel={(option) => (
                    <div className='flex items-center gap-2'>
                      <Icon name={option.value} size={16} />
                      {option.label}
                    </div>
                  )}
                  renderSelected={(option) => (
                    <div className='flex items-center gap-2'>
                      <Icon name={option.value} size={14} />
                      <span className='text-xs'>{option.label}</span>
                    </div>
                  )}
                />
              </FormControl>
            </FormItem>

            {/* Dynamic input fields for selected platforms */}
            {selectedPlatforms.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {selectedPlatforms.includes('facebook') && (
                  <FormField
                    control={form.control}
                    name='socials.facebook'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='facebook' size={16} />
                          Facebook
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://facebook.com/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('instagram') && (
                  <FormField
                    control={form.control}
                    name='socials.instagram'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='instagram' size={16} />
                          Instagram
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://instagram.com/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('linkedin') && (
                  <FormField
                    control={form.control}
                    name='socials.linkedin'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='linkedin' size={16} />
                          LinkedIn
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://linkedin.com/in/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('x') && (
                  <FormField
                    control={form.control}
                    name='socials.x'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='x' size={12} />X (Twitter)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://x.com/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('youtube') && (
                  <FormField
                    control={form.control}
                    name='socials.youtube'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='youtube' size={16} />
                          YouTube
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://youtube.com/your-channel'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('github') && (
                  <FormField
                    control={form.control}
                    name='socials.github'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='github' size={16} />
                          GitHub
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://github.com/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('behance') && (
                  <FormField
                    control={form.control}
                    name='socials.behance'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='behance' size={16} />
                          Behance
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://behance.net/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPlatforms.includes('dribbble') && (
                  <FormField
                    control={form.control}
                    name='socials.dribbble'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Icon name='dribbble' size={16} />
                          Dribbble
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://dribbble.com/your-profile'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          <FormButton
            variant='outline'
            type='button'
            text='Ακύρωση'
            onClick={() => form.reset()}
            disabled={isPending || !isDirty}
          />
          <FormButton
            type='submit'
            text='Αποθήκευση'
            loadingText='Αποθήκευση...'
            loading={isPending}
            disabled={isPending || !isValid || !isDirty}
          />
        </div>
      </form>
    </Form>
  );
}
