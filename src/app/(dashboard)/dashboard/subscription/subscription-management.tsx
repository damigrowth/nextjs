'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cancelSubscription } from '@/actions/subscription';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';
import { toast } from 'sonner';
import { Loader2, Crown, AlertTriangle } from 'lucide-react';
import type { Subscription } from '@prisma/client';

interface SubscriptionManagementProps {
  subscription: Subscription | null;
}

export default function SubscriptionManagement({
  subscription,
}: SubscriptionManagementProps) {
  const [isPending, startTransition] = useTransition();
  const { open: openSheet } = useSubscriptionSheetStore();

  const isActive = subscription?.status === 'active';
  const isCanceling = isActive && subscription?.cancelAtPeriodEnd;

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelSubscription(true);
      if (result.success) {
        toast.success('Η συνδρομή θα ακυρωθεί στο τέλος της τρέχουσας περιόδου');
      } else {
        toast.error(result.error || 'Κάτι πήγε στραβά');
      }
    });
  };

  // Free plan state
  if (!subscription || subscription.plan === 'free' || subscription.status === 'canceled') {
    return (
      <Card className='w-full max-w-lg shadow-lg'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            Βασικό Πακέτο
            <Badge variant='outline'>Δωρεάν</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Αναβαθμίστε στο Προωθημένο πακέτο για περισσότερες δυνατότητες.
          </p>
          <Button className='w-full sm:w-auto' onClick={() => openSheet()}>
            <Crown className='size-4' />
            Αναβάθμιση σε Προωθημένο
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card className='w-full max-w-lg shadow-lg'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          Προωθημένο Πακέτο
          <Badge>{isActive ? 'Ενεργό' : subscription.status}</Badge>
          {isCanceling && (
            <Badge variant='destructive'>Ακυρώνεται</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-muted-foreground'>Χρέωση</p>
            <p className='font-medium'>
              {subscription.billingInterval === 'year' ? '€180/έτος' : '€20/μήνα'}
            </p>
          </div>
          <div>
            <p className='text-muted-foreground'>Επόμενη χρέωση</p>
            <p className='font-medium'>
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString('el-GR')
                : '-'}
            </p>
          </div>
        </div>

        {isCanceling && (
          <>
            <Separator />
            <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3'>
              <AlertTriangle className='size-4 text-amber-600 mt-0.5 shrink-0' />
              <p className='text-sm text-amber-800'>
                Η συνδρομή σας θα λήξει στις{' '}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('el-GR')
                  : ''}
                . Μετά τη λήξη, θα επιστρέψετε στο Βασικό πακέτο.
              </p>
            </div>
          </>
        )}

        <Separator />

        <div className='flex gap-2'>
          {!isCanceling && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' size='sm' disabled={isPending}>
                  {isPending ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    'Ακύρωση Συνδρομής'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ακύρωση Συνδρομής</AlertDialogTitle>
                  <AlertDialogDescription>
                    Είστε σίγουροι ότι θέλετε να ακυρώσετε τη συνδρομή σας; Θα
                    διατηρήσετε πρόσβαση στις δυνατότητες έως το τέλος της
                    τρέχουσας περιόδου χρέωσης.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Ακύρωση Συνδρομής
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
