'use client';

import { useEffect, useActionState, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateServiceTaxonomySchema } from '@/lib/validations/admin';
import { updateServiceTaxonomyAction } from '@/actions/admin';
import { populateFormData } from '@/lib/utils/form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { DatasetItem } from '@/lib/types/datasets';
import { LabelField, SlugField } from './taxonomy-form-fields';
import { useSlugHandlers } from './use-slug-handlers';

type EditTaxonomyItemFormValues = z.infer<typeof updateServiceTaxonomySchema>;

interface EditTaxonomyItemFormProps {
  taxonomy: Pick<
    DatasetItem,
    'id' | 'label' | 'slug' | 'description' | 'icon' | 'image'
  > & {
    level: 'category' | 'subcategory' | 'subdivision';
    parentId?: string;
    parentLabel?: string;
    featured?: boolean;
    hasImage?: boolean;
  };
  existingItems: DatasetItem[];
}

export function EditTaxonomyItemForm({
  taxonomy,
  existingItems,
}: EditTaxonomyItemFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateServiceTaxonomyAction,
    null,
  );
  const [imagePreview, setImagePreview] = useState(
    taxonomy.image?.secure_url || taxonomy.image?.url || '',
  );

  const form = useForm<EditTaxonomyItemFormValues>({
    resolver: zodResolver(updateServiceTaxonomySchema),
    mode: 'onChange',
    defaultValues: {
      id: taxonomy.id,
      label: taxonomy.label,
      slug: taxonomy.slug,
      description: taxonomy.description || '',
      level: taxonomy.level,
      parentId: taxonomy.parentId || '',
      featured: taxonomy.featured || false,
      icon: taxonomy.icon || '',
      imageUrl: taxonomy.image?.secure_url || taxonomy.image?.url || '',
    },
  });

  // Watch the imageUrl and label fields for changes using useWatch
  const imageUrl = useWatch({ control: form.control, name: 'imageUrl' });
  const labelValue = useWatch({ control: form.control, name: 'label' });

  // Update image preview when imageUrl changes
  useEffect(() => {
    if (imageUrl && imageUrl.trim() !== '') {
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }
  }, [imageUrl]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Taxonomy updated successfully');
      // Reset form to clear dirty state - this will trigger a re-render
      // with the updated values without needing router.refresh()
      form.reset(form.getValues());
      // No router.refresh() needed - ISR revalidation on the server
      // will ensure fresh data on next navigation
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, form]);

  const handleFormSubmit = (formData: FormData) => {
    const allValues = form.getValues();

    populateFormData(formData, allValues, {
      stringFields: [
        'id',
        'label',
        'slug',
        'description',
        'level',
        'parentId',
        'icon',
        'imageUrl',
      ],
      booleanFields: ['featured'],
    });

    formAction(formData);
  };

  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form);

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>Unique identifier (read-only)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='level'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>Taxonomy level (read-only)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <LabelField
            form={form}
            isPending={isPending}
            onLabelChange={handleLabelChange}
            placeholder='Enter label'
            description='The display name for this item'
          />

          <SlugField
            form={form}
            isPending={isPending}
            placeholder='enter-slug'
            description='URL-friendly identifier (auto-generated from label)'
            existingItems={existingItems}
            onRegenerate={handleSlugRegenerate}
            currentLabel={labelValue || ''}
          />

          {taxonomy.level === 'category' && (
            <>
              <FormField
                control={form.control}
                name='featured'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select featured status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='true'>Yes</SelectItem>
                        <SelectItem value='false'>No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only categories can be featured
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder='flaticon-icon-name' {...field} />
                    </FormControl>
                    <FormDescription>Icon class name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter description'
                  className='min-h-[100px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='imageUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder='https://example.com/image.jpg' {...field} />
              </FormControl>
              <FormDescription>
                Enter the full URL of the image (Cloudinary or other CDN)
              </FormDescription>
              <FormMessage />
              {imagePreview && (
                <div className='mt-4 border rounded-lg p-4 bg-muted/50'>
                  <p className='text-sm font-medium mb-2'>Image Preview:</p>
                  <div className='relative w-full h-48 rounded-md overflow-hidden bg-gray-100'>
                    <Image
                      src={imagePreview}
                      alt='Preview'
                      fill
                      className='object-contain'
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type='submit' disabled={isPending || !form.formState.isDirty}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
