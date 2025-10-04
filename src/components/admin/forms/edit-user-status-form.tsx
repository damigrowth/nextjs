'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserStatusSchema } from '@/lib/validations/admin';
import { updateUserStatus, setUserRole } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type FormData = z.infer<typeof updateUserStatusSchema>;

interface EditUserStatusFormProps {
  user: {
    id: string;
    role: string;
    type: string;
    step: string;
    emailVerified: boolean;
    confirmed: boolean;
    blocked: boolean;
  };
}

export function EditUserStatusForm({ user }: EditUserStatusFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(updateUserStatusSchema),
    defaultValues: {
      userId: user.id,
      role: user.role as any,
      type: user.type as 'user' | 'pro',
      step: user.step as any,
      emailVerified: user.emailVerified,
      confirmed: user.confirmed,
      blocked: user.blocked,
    },
  });

  async function handleSubmit(data: FormData) {
    // Check if critical fields are being changed
    const criticalChange =
      data.role !== user.role ||
      data.blocked !== user.blocked ||
      data.step !== user.step;

    if (criticalChange) {
      setPendingData(data);
      setShowConfirmDialog(true);
      return;
    }

    await performUpdate(data);
  }

  async function performUpdate(data: FormData) {
    setIsLoading(true);

    try {
      // Update role separately if changed
      if (data.role && data.role !== user.role) {
        const roleResult = await setUserRole({
          userId: data.userId,
          role: data.role,
        });

        if (!roleResult.success) {
          toast.error(roleResult.error || 'Failed to update role');
          setIsLoading(false);
          return;
        }
      }

      // Update other status fields
      const statusData = {
        userId: data.userId,
        type: data.type,
        step: data.step,
        emailVerified: data.emailVerified,
        confirmed: data.confirmed,
        blocked: data.blocked,
      };

      const result = await updateUserStatus(statusData);

      if (result.success) {
        toast.success('User status updated successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setPendingData(null);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='user'>User</SelectItem>
                      <SelectItem value='freelancer'>Επαγγελματίας</SelectItem>
                      <SelectItem value='company'>Επιχείρηση</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    User&apos;s role in the system
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='user'>User</SelectItem>
                      <SelectItem value='pro'>Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Account type (user or professional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='step'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journey Step</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select step' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='EMAIL_VERIFICATION'>
                        Email Verification
                      </SelectItem>
                      <SelectItem value='ONBOARDING'>Onboarding</SelectItem>
                      <SelectItem value='DASHBOARD'>Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    User&apos;s current step in the onboarding journey
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='emailVerified'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Email Verified</FormLabel>
                    <FormDescription>
                      Mark user&apos;s email as verified
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmed'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Confirmed</FormLabel>
                    <FormDescription>
                      User account confirmation status
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='blocked'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 border-destructive/50'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base text-destructive'>
                      Blocked
                    </FormLabel>
                    <FormDescription>
                      Block user from accessing the platform
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Critical Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to make critical changes to the user&apos;s account. This
              includes role changes, blocking status, or journey step
              modifications. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingData && performUpdate(pendingData)}
            >
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
