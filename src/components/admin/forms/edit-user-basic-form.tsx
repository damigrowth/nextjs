'use client';

import { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserBasicInfoSchema } from '@/lib/validations/admin';
import { updateUserBasicInfoAction } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { populateFormData } from '@/lib/utils/form';

// Form schema without userId (passed separately)
const editUserBasicFormSchema = updateUserBasicInfoSchema.omit({ userId: true });
type EditUserBasicFormValues = z.infer<typeof editUserBasicFormSchema>;

interface EditUserBasicFormProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    username?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export function EditUserBasicForm({ user }: EditUserBasicFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateUserBasicInfoAction, null);

  const form = useForm<EditUserBasicFormValues>({
    resolver: zodResolver(editUserBasicFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: user.name || '',
      email: user.email,
      username: user.username || '',
      displayName: user.displayName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success('User information updated successfully');
      router.refresh();
      form.reset(form.getValues());
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, form]);

  const handleFormSubmit = (formData: FormData) => {
    const allValues = form.getValues();
    const payload = {
      userId: user.id,
      name: allValues.name,
      email: allValues.email,
      username: allValues.username,
      displayName: allValues.displayName,
      firstName: allValues.firstName,
      lastName: allValues.lastName,
    };

    populateFormData(formData, payload, {
      stringFields: ['userId', 'name', 'email', 'username', 'displayName', 'firstName', 'lastName'],
    });

    formAction(formData);
  };

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder='John Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='user@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='johndoe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder='John D.' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-2'>
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
