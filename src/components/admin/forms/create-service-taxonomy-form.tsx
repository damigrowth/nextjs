'use client';

import { useEffect, useActionState, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createServiceTaxonomySchema } from '@/lib/validations/admin';
import { createServiceTaxonomyAction } from '@/actions/admin';
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

type CreateServiceTaxonomyFormValues = z.infer<
  typeof createServiceTaxonomySchema
>;

interface CreateServiceTaxonomyFormProps {
  level: 'category' | 'subcategory' | 'subdivision';
  existingItems: DatasetItem[];
}

export function CreateServiceTaxonomyForm({
  level,
  existingItems,
}: CreateServiceTaxonomyFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createServiceTaxonomyAction,
    null,
  );
  const [imagePreview, setImagePreview] = useState('');

  const form = useForm<CreateServiceTaxonomyFormValues>({
    resolver: zodResolver(createServiceTaxonomySchema),
    mode: 'onChange',
    defaultValues: {
      label: '',
      slug: '',
      level: level,
      parentId: '',
      featured: false,
      icon: '',
      imageUrl: '',
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
      toast.success(state.message || 'Taxonomy created successfully');
      // Navigate back to the list page
      const listPath =
        level === 'category'
          ? '/admin/taxonomies/service/categories'
          : level === 'subcategory'
            ? '/admin/taxonomies/service/subcategories'
            : '/admin/taxonomies/service/subdivisions';
      router.push(listPath);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, level]);

  const handleFormSubmit = (formData: FormData) => {
    const allValues = form.getValues();

    populateFormData(formData, allValues, {
      stringFields: [
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

  // Get parent options based on level
  const getParentOptions = () => {
    if (level === 'subcategory') {
      return existingItems.map((cat) => ({
        id: cat.id,
        label: cat.label || cat.name || cat.id,
      }));
    } else if (level === 'subdivision') {
      const subcategories: Array<{ id: string; label: string }> = [];
      existingItems.forEach((cat) => {
        cat.children?.forEach((sub) => {
          subcategories.push({
            id: sub.id,
            label: `${cat.label || cat.name} > ${sub.label || sub.name}`,
          });
        });
      });
      return subcategories;
    }
    return [];
  };

  const parentOptions = getParentOptions();

  // Auto-generate slug from label using the reusable hook
  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form);

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
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

          {(level === 'subcategory' || level === 'subdivision') && (
            <FormField
              control={form.control}
              name='parentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent{' '}
                    {level === 'subcategory' ? 'Category' : 'Subcategory'} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select parent ${level === 'subcategory' ? 'category' : 'subcategory'}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='label'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter label'
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(e);
                      handleLabelChange(value);
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>The display name for this item</FormDescription>
                <FormMessage />
              </FormItem>
            )}
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

          {level === 'category' && (
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
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Create {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
