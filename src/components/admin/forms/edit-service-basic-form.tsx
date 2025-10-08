'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateService } from '@/actions/admin/services';
import { serviceEditSchema } from '@/lib/validations/service';
import { z } from 'zod';

// Use only title and description from dashboard schema
const editServiceBasicSchema = serviceEditSchema.pick({
  title: true,
  description: true,
});

type EditServiceBasicFormValues = z.infer<typeof editServiceBasicSchema>;

interface EditServiceBasicFormProps {
  service: {
    id: number;
    title: string;
    description: string;
  };
}

export function EditServiceBasicForm({ service }: EditServiceBasicFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditServiceBasicFormValues>({
    resolver: zodResolver(editServiceBasicSchema),
    mode: 'onChange',
    defaultValues: {
      title: service.title,
      description: service.description,
    },
  });

  const onSubmit = async (data: EditServiceBasicFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateService({
          serviceId: service.id,
          ...data,
        });

        if (result.success) {
          toast.success('Service updated successfully');
          form.reset(data); // Reset form with new values to clear isDirty state
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update service');
        }
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
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter service title'
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <div className='text-sm text-muted-foreground'>
                {field.value?.length || 0}/100 characters
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter service description'
                  className='min-h-[120px]'
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <div className='text-sm text-muted-foreground'>
                {field.value?.length || 0}/5000 characters
              </div>
              <FormMessage />
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
