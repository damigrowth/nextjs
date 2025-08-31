'use client';

import React, { useActionState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons (lucide-react only)
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  Globe,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Dribbble,
} from 'lucide-react';

// Custom X icon
import XCustom from '@/components/icon/x-custom';

// Auth and utilities
import { formatInput } from '@/lib/utils/validation/formats';
import {
  populateFormData,
  parseVisibilityJSON,
  parseSocialsJSON,
} from '@/lib/utils/form';

// Validation schema and server action
import {
  profilePresentationUpdateSchema,
  type ProfilePresentationUpdateInput,
} from '@/lib/validations/profile';
import { updateProfilePresentation } from '@/actions/profiles/presentation';
import { FormButton } from '../shared';
import { AuthUser, ProfileWithRelations } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';

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
  facebook: { url: '' },
  instagram: { url: '' },
  linkedin: { url: '' },
  x: { url: '' },
  youtube: { url: '' },
  github: { url: '' },
  behance: { url: '' },
  dribbble: { url: '' },
};

interface PresentationInfoFormProps {
  initialUser: AuthUser | null;
  initialProfile: ProfileWithRelations | null;
}

export default function PresentationInfoForm({
  initialUser,
  initialProfile,
}: PresentationInfoFormProps) {
  const [state, action, isPending] = useActionState(
    updateProfilePresentation,
    initialState,
  );

  const router = useRouter();

  // Extract data from props
  const profile = initialProfile;

  const form = useForm<ProfilePresentationUpdateInput>({
    resolver: zodResolver(profilePresentationUpdateSchema),
    defaultValues: {
      phone: '',
      website: '',
      viber: '',
      whatsapp: '',
      visibility: initialVisibility,
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
        visibility: parseVisibilityJSON(profile.visibility),
        socials: parseSocialsJSON(profile.socials),
      };
      form.reset(resetData);
    }
  }, [profile, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Refresh the page to get updated data
      router.refresh();
    }
  }, [state.success, router]);

  // Form submission handler using utility function
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData using utility function
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['phone', 'website', 'viber', 'whatsapp'], // Simple text fields
      jsonFields: ['visibility', 'socials'], // Objects that need JSON.stringify
      skipEmpty: true, // Skip null/undefined/empty values
    });

    // Call server action
    action(formData);
  };

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
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
                      onCheckedChange={field.onChange}
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
                      onCheckedChange={field.onChange}
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
                      onCheckedChange={field.onChange}
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='socials.facebook.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Facebook className='h-4 w-4' />
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

            <FormField
              control={form.control}
              name='socials.instagram.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Instagram className='h-4 w-4' />
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

            <FormField
              control={form.control}
              name='socials.linkedin.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Linkedin className='h-4 w-4' />
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

            <FormField
              control={form.control}
              name='socials.x.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <XCustom className='h-3 w-3' />X (Twitter)
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

            <FormField
              control={form.control}
              name='socials.youtube.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Youtube className='h-4 w-4' />
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

            <FormField
              control={form.control}
              name='socials.github.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Github className='h-4 w-4' />
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

            <FormField
              control={form.control}
              name='socials.behance.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <span className='h-4 w-4 text-xs font-bold flex items-center justify-center'>
                      Be
                    </span>
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

            <FormField
              control={form.control}
              name='socials.dribbble.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Dribbble className='h-4 w-4' />
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
          </div>
        </div>

        {/* Error Display */}
        {state.message && !state.success && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {state.message && state.success && (
          <Alert className='border-green-200 bg-green-50 text-green-800'>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

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
