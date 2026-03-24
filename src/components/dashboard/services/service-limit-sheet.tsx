'use client';

import { useEffect } from 'react';
import { AlertCircle, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NextLink } from '@/components';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';

const LIMIT_MESSAGE =
  'Έχετε φτάσει το μέγιστο όριο υπηρεσιών για το πλάνο σας.';

/**
 * Auto-opens the subscription upgrade sheet on mount and renders
 * fallback content so the user sees a meaningful page if they close the sheet.
 */
export default function ServiceLimitSheet() {
  const { open } = useSubscriptionSheetStore();

  useEffect(() => {
    open(LIMIT_MESSAGE);
  }, [open]);

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-6 py-10'>
            <div className='text-center space-y-4 pt-6'>
              <div className='mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center'>
                <AlertCircle className='w-6 h-6 text-amber-600' />
              </div>

              <h1 className='text-2xl font-bold text-gray-900'>
                Όριο υπηρεσιών
              </h1>
            </div>

            <div className='text-center'>
              <p className='text-gray-700'>{LIMIT_MESSAGE}</p>
              <p className='text-gray-500 text-sm mt-2'>
                Αναβαθμίστε το πακέτο σας για να δημιουργήσετε περισσότερες
                υπηρεσίες.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
              <Button size='lg' onClick={() => open(LIMIT_MESSAGE)}>
                <Crown className='w-4 h-4 mr-2' />
                Αναβάθμιση Πακέτου
              </Button>

              <Button asChild variant='outline' size='lg'>
                <NextLink href='/dashboard/services'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Διαχείριση Υπηρεσιών
                </NextLink>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
