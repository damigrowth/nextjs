'use client';

import React from 'react';

// Standard shadcn/ui imports
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom components
import { MediaUpload } from '@/components/media';

// Icons
import { Upload, Image, Video, AlertCircle } from 'lucide-react';

// Types
import type { CreateServiceInput } from '@/lib/validations/service';
import type { AuthUser } from '@/lib/types/auth';

// Form context
import { useFormContext } from 'react-hook-form';

interface MediaStepProps {
  user: AuthUser | null;
}

export default function MediaStep({ user }: MediaStepProps) {
  const form = useFormContext<CreateServiceInput>();

  return (
    <>
      <div className='text-center mb-8'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Πολυμέσα υπηρεσίας
        </h3>
        <p className='text-sm text-gray-600 mt-2'>
          Ανεβάστε έως 10 εικόνες ή βίντεο για την υπηρεσία σας (προαιρετικό)
        </p>
      </div>

      <FormField
        control={form.control}
        name='media'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Πολυμέσα</FormLabel>
            <p className='text-sm text-muted-foreground'>
              Προσθέστε εικόνες ή βίντεο για την υπηρεσία σας
            </p>
            <FormControl>
              <MediaUpload
                value={field.value || []}
                onChange={field.onChange}
                uploadPreset='doulitsa_new'
                multiple={true}
                folder={`services/${user?.username}/media`}
                maxFileSize={50000000} // 50MB
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
                error={form.formState.errors.media?.message}
                signed={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
