'use client';

import React, { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/client';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Types
import { AuthUser } from '@/lib/types/auth';
import { ActionResponse } from '@/lib/types/api';

// Validation
import {
  upgradeToProSchema,
  type UpgradeToProInput,
} from '@/lib/validations/user';

// Actions
import { upgradeToProAccount } from '@/actions/auth/upgrade-to-pro';

// Icons
import { AlertTriangle, Loader2 } from 'lucide-react';

interface UpgradeToProFormProps {
  user: AuthUser | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialState: ActionResponse = {
  success: false,
  message: '',
};

export default function UpgradeToProForm({
  user,
  onSuccess,
  onCancel,
}: UpgradeToProFormProps) {
  const [state, action, isPending] = useActionState(
    upgradeToProAccount,
    initialState,
  );
  const [isTransitionPending, startTransition] = useTransition();
  const router = useRouter();
  const { refetch: refreshSession } = useSession();

  const form = useForm<UpgradeToProInput>({
    resolver: zodResolver(upgradeToProSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
    },
    mode: 'onChange',
  });

  const {
    formState: { isValid },
  } = form;

  // Track if success toast was already shown to prevent duplicates
  const toastShownRef = React.useRef(false);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    const valid = await form.trigger();

    if (!valid) {
      return;
    }

    startTransition(() => {
      action(formData);
    });
  };

  // Handle form submission responses
  React.useEffect(() => {
    if (state.success && state.message && !toastShownRef.current) {
      toastShownRef.current = true;

      toast.success(state.message, { id: 'upgrade-to-pro-success' });

      // Close dialog
      onSuccess?.();

      // Refresh session so client-side reflects new type/role
      refreshSession();

      // Redirect to onboarding
      router.push('/onboarding');
    } else if (!state.success && state.message) {
      toast.error(state.message, { id: 'upgrade-to-pro-error' });
    }

    if (!state.success) {
      toastShownRef.current = false;
    }
  }, [state, onSuccess, refreshSession, router]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Αλλαγή σε Επαγγελματικό λογαριασμό</DialogTitle>
        <DialogDescription>
          Αναβαθμίστε τον λογαριασμό σας σε επαγγελματικό για να προσφέρετε
          υπηρεσίες στην πλατφόρμα.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form action={handleFormSubmit} className='space-y-4'>
          {/* Warning Alert */}
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Προσοχή:</strong> Η αλλαγή είναι μόνιμη. Μετά την
              αναβάθμιση θα πρέπει να συμπληρώσετε το επαγγελματικό σας προφίλ
              για να συνεχίσετε.
            </AlertDescription>
          </Alert>

          {/* Display Name */}
          <FormField
            control={form.control}
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Όνομα Εμφάνισης</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='π.χ. Γιάννης Παπαδόπουλος'
                    autoComplete='off'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pro Type Selection */}
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Τύπος Λογαριασμού</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className='flex flex-col gap-3'
                  >
                    {/* Hidden input to include role in native FormData */}
                    <input type='hidden' name='role' value={field.value ?? ''} />
                    <FormItem className='flex items-center space-x-3 space-y-0'>
                      <FormControl>
                        <RadioGroupItem value='freelancer' />
                      </FormControl>
                      <FormLabel className='font-normal cursor-pointer'>
                        Επαγγελματίας
                      </FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center space-x-3 space-y-0'>
                      <FormControl>
                        <RadioGroupItem value='company' />
                      </FormControl>
                      <FormLabel className='font-normal cursor-pointer'>
                        Επιχείρηση
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isPending || isTransitionPending}
            >
              Ακύρωση
            </Button>
            <Button
              type='submit'
              disabled={isPending || isTransitionPending || !isValid}
            >
              {isPending || isTransitionPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Αναβάθμιση...
                </>
              ) : (
                'Αναβάθμιση Λογαριασμού'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
