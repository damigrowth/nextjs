'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FaqFields } from '@/components/shared/faq-fields';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateService } from '@/actions/admin/services';
import { serviceEditSchema } from '@/lib/validations/service';

// Use the FAQ schema from dashboard with all validations (includes uniqueness checks)
const editServiceFaqSchema = serviceEditSchema.pick({
  faq: true,
});

type EditServiceFaqFormValues = z.infer<typeof editServiceFaqSchema>;

interface EditServiceFaqFormProps {
  service: {
    id: number;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export function EditServiceFaqForm({ service }: EditServiceFaqFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditServiceFaqFormValues>({
    resolver: zodResolver(editServiceFaqSchema),
    mode: 'onChange',
    defaultValues: {
      faq: service.faq || [],
    },
  });

  const onSubmit = async (data: EditServiceFaqFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateService({
          serviceId: service.id,
          faq: data.faq,
        });

        if (result.success) {
          toast.success('Service FAQ updated successfully');
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
          <FaqFields control={form.control} name='faq' maxFaq={5} />

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
