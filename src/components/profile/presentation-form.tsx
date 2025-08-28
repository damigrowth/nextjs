'use client';

import React, { useRef, useActionState, useEffect } from 'react';
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

// Custom components
import { MediaUpload } from '@/components/media';

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
import { useDashboard } from '../providers';
import { populateFormData, parseJSONValue } from '@/lib/utils/form';

// Validation schema and server action (FOLLOW EXISTING PATTERNS)
import { presentationSchema } from '@/lib/validations/profile';
import { updateProfilePresentation } from '@/actions/profiles/presentation';
import { FormButton } from '../shared';

const initialState = {
  success: false,
  message: '',
};

export default function PresentationForm() {
  const [state, action, isPending] = useActionState(
    updateProfilePresentation,
    initialState,
  );

  // Auth context
  const { user, isLoading, hasProfile, phone, website, viber, whatsapp, visibility, socials, portfolio } = useDashboard();

  // Media upload refs
  const mediaRef = useRef<any>(null);

  const form = useForm({
    resolver: zodResolver(presentationSchema),
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
      socials: {
        facebook: { url: '' },
        instagram: { url: '' },
        linkedin: { url: '' },
        x: { url: '' },
        youtube: { url: '' },
        github: { url: '' },
        behance: { url: '' },
        dribbble: { url: '' },
      },
      portfolio: [],
    },
    mode: 'onChange', // Real-time validation
  });

  const {
    formState: { errors, isValid, isDirty },
    getValues,
  } = form;

  // Update form values when auth data loads
  useEffect(() => {
    if (!isLoading && hasProfile) {
      console.log('Loading presentation form data:', {
        visibility: visibility,
        hasProfile: hasProfile,
      });

      form.reset({
        phone: phone || '',
        website: website || '',
        viber: viber || '',
        whatsapp: whatsapp || '',
        visibility: parseJSONValue(visibility, {
          email: true,
          phone: true,
          address: true,
        }),
        socials: parseJSONValue(socials, {
          facebook: { url: '' },
          instagram: { url: '' },
          linkedin: { url: '' },
          x: { url: '' },
          youtube: { url: '' },
          github: { url: '' },
          behance: { url: '' },
          dribbble: { url: '' },
        }),
        portfolio: portfolio || [],
      });
    }
  }, [hasProfile, isLoading, phone, website, viber, whatsapp, visibility, socials, portfolio, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      console.log(
        'Presentation form updated successfully - layout will refresh with new data',
      );
    }
  }, [state.success]);

  // Form submission handler - EXACT PATTERN FROM CURRENT FORMS
  const handleFormSubmit = (formData: FormData) => {
    // Handle media uploads if needed
    if (mediaRef.current?.hasFiles()) {
      mediaRef.current.uploadFiles();
    }

    // Get all form values and populate FormData using ENHANCED utility
    const allValues = getValues();

    populateFormData(formData, allValues, {
        stringFields: ['phone', 'website', 'viber', 'whatsapp'],
        jsonFields: ['visibility', 'socials', 'portfolio'],
        skipEmpty: true,
    });

    // Call server action
    action(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8 border rounded-lg'>
        <Loader2 className='w-6 h-6 animate-spin' />
        <span className='ml-2'>Φόρτωση...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
      >
        {/* Row 1: Phone and Website */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
        </div>

        {/* Row 2: Visibility Settings */}
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

        {/* Row 3: Portfolio */}
        <FormField
          control={form.control}
          name='portfolio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Χαρτοφυλάκιο</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Προσθέστε έργα από το χαρτοφυλάκιό σας
              </p>
              <FormControl>
                <MediaUpload
                  ref={mediaRef}
                  value={field.value || []}
                  onChange={field.onChange}
                  uploadPreset='doulitsa_new'
                  multiple={true}
                  folder={`users/${user?.username}/portfolio`}
                  maxFileSize={5000000} // 5MB
                  maxFiles={10}
                  allowedFormats={[
                    'jpg',
                    'jpeg',
                    'png',
                    'webp',
                    'mp4',
                    'mov',
                    'avi',
                  ]}
                  placeholder='Ανεβάστε εικόνες ή βίντεο'
                  error={errors.portfolio?.message}
                  signed={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 4: Viber and WhatsApp */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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

        {/* Row 5: Social Media */}
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
