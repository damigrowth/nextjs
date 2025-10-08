'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { AddonFields } from '@/components/shared/addon-fields';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateService } from '@/actions/admin/services';
import { serviceEditSchema } from '@/lib/validations/service';

// Use the addons schema from dashboard with all validations (includes uniqueness checks)
const editServiceAddonsSchema = serviceEditSchema.pick({
  addons: true,
});

type EditServiceAddonsFormValues = z.infer<typeof editServiceAddonsSchema>;

interface EditServiceAddonsFormProps {
  service: {
    id: number;
    addons: Array<{
      title: string;
      description: string;
      price: number;
    }>;
  };
}

export function EditServiceAddonsForm({ service }: EditServiceAddonsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditServiceAddonsFormValues>({
    resolver: zodResolver(editServiceAddonsSchema),
    mode: 'onChange',
    defaultValues: {
      addons: service.addons || [],
    },
  });

  const onSubmit = async (data: EditServiceAddonsFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateService({
          serviceId: service.id,
          addons: data.addons,
        });

        if (result.success) {
          toast.success('Service addons updated successfully');
          form.reset(data);
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
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <AddonFields control={form.control} name='addons' maxAddons={3} />

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
              disabled={isPending || !form.formState.isDirty || !form.formState.isValid}
            >
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
