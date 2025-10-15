'use client';

import { useEffect, useActionState } from 'react';
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
import type { DatasetItem } from '@/lib/types/datasets';
import { LabelField, SlugField } from './taxonomy-form-fields';
import { useSlugHandlers } from './use-slug-handlers';
import { CloudinaryMediaPicker } from '@/components/media/cloudinary-media-picker';
import type { CloudinaryResource } from '@/lib/types/cloudinary';

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
      image: taxonomy.image || null,
    },
  });

  // Watch the label field for changes using useWatch
  const labelValue = useWatch({ control: form.control, name: 'label' });

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
      ],
      booleanFields: ['featured'],
      jsonFields: ['image'],
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
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <CloudinaryMediaPicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Browse and select an image from your Cloudinary Media Library
              </FormDescription>
              <FormMessage />
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
