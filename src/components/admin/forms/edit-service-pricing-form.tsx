'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { updateService } from '@/actions/admin/services';
import { Currency } from '@/components/ui/currency';

const editServicePricingSchema = z.object({
  price: z.number().min(0, 'Price must be a positive number'),
  fixed: z.boolean(),
  duration: z.number().min(0, 'Duration must be a positive number'),
  subscriptionType: z.enum(['month', 'year', 'per_case', 'per_hour', 'per_session']).optional(),
});

type EditServicePricingFormValues = z.infer<typeof editServicePricingSchema>;

interface EditServicePricingFormProps {
  service: {
    id: number;
    price: number;
    fixed: boolean;
    duration: number | null;
    subscriptionType: string | null;
  };
}

export function EditServicePricingForm({ service }: EditServicePricingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditServicePricingFormValues>({
    resolver: zodResolver(editServicePricingSchema),
    mode: 'onChange',
    defaultValues: {
      price: service.price,
      fixed: service.fixed,
      duration: service.duration || 0,
      subscriptionType: (service.subscriptionType as any) || undefined,
    },
  });

  const watchFixed = form.watch('fixed');

  const onSubmit = async (data: EditServicePricingFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateService({
          serviceId: service.id,
          ...data,
        });

        if (result.success) {
          toast.success('Service pricing updated successfully');
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
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price {watchFixed ? '(Required)' : '(Hidden)'}</FormLabel>
                <FormControl>
                  <Currency
                    currency='€'
                    position='right'
                    placeholder={watchFixed ? 'e.g., 50' : 'Price hidden'}
                    min={1}
                    max={10000}
                    allowDecimals={false}
                    value={field.value || 0}
                    onValueChange={field.onChange}
                    disabled={!watchFixed || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='fixed'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel>Hide Price</FormLabel>
                  <div className='text-xs text-muted-foreground'>
                    Price won't be displayed publicly
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={!field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(!checked);
                      if (checked) {
                        form.setValue('price', 0, { shouldValidate: false });
                        form.clearErrors('price');
                      } else {
                        form.clearErrors('price');
                      }
                      form.trigger('price');
                    }}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (days)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='e.g., 7'
                  min={0}
                  max={365}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  disabled={isPending}
                />
              </FormControl>
              <div className='text-xs text-muted-foreground'>
                Estimated completion time in days (optional)
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='subscriptionType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Type (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select subscription type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='month'>Monthly</SelectItem>
                  <SelectItem value='year'>Yearly</SelectItem>
                  <SelectItem value='per_case'>Per Case</SelectItem>
                  <SelectItem value='per_hour'>Per Hour</SelectItem>
                  <SelectItem value='per_session'>Per Session</SelectItem>
                </SelectContent>
              </Select>
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
