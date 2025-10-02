'use client';

import React, { forwardRef } from 'react';

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
import type { Profile } from '@prisma/client';

// Form context
import { useFormContext } from 'react-hook-form';

interface MediaStepProps {
  user: AuthUser | null;
  profile: Profile | null;
  mediaRef?: React.RefObject<any>;
}

export default function MediaStep({ user, profile, mediaRef }: MediaStepProps) {
  const form = useFormContext<CreateServiceInput>();

  return (
    <FormField
      control={form.control}
      name='media'
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <MediaUpload
              ref={mediaRef}
              value={field.value || []}
              onChange={field.onChange}
              uploadPreset='doulitsa_new'
              multiple={true}
              folder={`users/${profile?.username}/services/media`}
              maxFileSize={50000000} // 50MB
              maxFiles={10}
              allowedFormats={[
                'jpg',
                'jpeg',
                'png',
                'webp',
                'mp4',
                'webm',
                'ogg',
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
  );
}
