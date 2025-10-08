'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateServiceStatus, togglePublished, toggleFeatured } from '@/actions/admin/services';
import { Switch } from '@/components/ui/switch';

const editServiceSettingsSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'published', 'rejected', 'inactive']),
  featured: z.boolean(),
});

type EditServiceSettingsFormValues = z.infer<typeof editServiceSettingsSchema>;

interface EditServiceSettingsFormProps {
  service: {
    id: number;
    status: string;
    featured: boolean;
  };
}

export function EditServiceSettingsForm({ service }: EditServiceSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditServiceSettingsFormValues>({
    resolver: zodResolver(editServiceSettingsSchema),
    mode: 'onChange',
    defaultValues: {
      status: service.status as any,
      featured: service.featured,
    },
  });

  const onSubmit = async (data: EditServiceSettingsFormValues) => {
    startTransition(async () => {
      try {
        // Update status if changed
        if (data.status !== service.status) {
          const statusResult = await updateServiceStatus({
            serviceId: service.id,
            status: data.status,
          });

          if (!statusResult.success) {
            toast.error(statusResult.error || 'Failed to update status');
            return;
          }
        }

        // Update featured if changed
        if (data.featured !== service.featured) {
          const featuredResult = await toggleFeatured({
            serviceId: service.id,
          });

          if (!featuredResult.success) {
            toast.error(featuredResult.error || 'Failed to update featured status');
            return;
          }
        }

        toast.success('Service settings updated successfully');
        form.reset(data); // Reset form with new values to clear isDirty state
        router.refresh();
      } catch (error) {
        toast.error('An error occurred while updating the service');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='pending'>Pending Review</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control the visibility and approval status of this service
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='featured'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel>Featured Service</FormLabel>
                <FormDescription>
                  Featured services appear prominently in search results
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => form.reset()}
            disabled={isPending || !form.formState.isDirty}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isPending || !form.formState.isValid || !form.formState.isDirty}
          >
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
