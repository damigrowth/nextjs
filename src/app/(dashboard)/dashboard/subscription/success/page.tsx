import { requireProUser } from '@/actions/auth/server';
import { getSubscription } from '@/actions/subscription';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NextLink } from '@/components';

export const metadata = getDashboardMetadata('Επιτυχής Εγγραφή');

export default async function SubscriptionSuccessPage() {
  await requireProUser();

  const subResult = await getSubscription();

  // If no active subscription yet, show pending state
  // (Stripe webhook may still be processing)
  if (
    !subResult.success ||
    subResult.data?.subscription?.status !== 'active'
  ) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold'>Επεξεργασία πληρωμής...</h1>
          <p className='text-muted-foreground'>
            Η πληρωμή σας επεξεργάζεται. Αυτή η σελίδα θα ανανεωθεί αυτόματα.
          </p>
        </div>
        <meta httpEquiv='refresh' content='5' />
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center py-20 space-y-6'>
      <Card className='max-w-md w-full'>
        <CardContent className='pt-6 text-center space-y-4'>
          <CheckCircle2 className='size-16 text-green-600 mx-auto' />
          <h1 className='text-2xl font-bold'>Καλώς ήρθατε στο Προωθημένο!</h1>
          <p className='text-muted-foreground'>
            Η συνδρομή σας ενεργοποιήθηκε επιτυχώς. Απολαύστε όλα τα
            προνόμια του Προωθημένου πακέτου.
          </p>

          <div className='space-y-2 pt-4'>
            <Button asChild className='w-full'>
              <NextLink href='/dashboard/services'>
                Διαχείριση Υπηρεσιών
              </NextLink>
            </Button>
            <Button asChild variant='outline' className='w-full'>
              <NextLink href='/dashboard'>
                Πίνακας Ελέγχου
              </NextLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
