'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PRICING, SUBSCRIPTION_PLANS } from '@/lib/stripe/config';
import { createCheckoutSession } from '@/actions/subscription';
import { toast } from 'sonner';
import { BillingForm } from '@/components';
import type { AuthUser } from '@/lib/types/auth';
import type { Profile } from '@prisma/client';

interface CheckoutContentProps {
  user: AuthUser;
  profile: Profile;
  defaultInterval: 'month' | 'year';
}

export default function CheckoutContent({
  user,
  profile,
  defaultInterval,
}: CheckoutContentProps) {
  const [interval, setInterval] = useState<'month' | 'year'>(defaultInterval);
  const [isPending, startTransition] = useTransition();

  const pricing = interval === 'year' ? PRICING.annual : PRICING.monthly;
  const plan = SUBSCRIPTION_PLANS.promoted;

  const handleCheckout = () => {
    startTransition(async () => {
      // Provider-agnostic checkout - only needs billing interval
      // Plan defaults to 'promoted' in the action
      const result = await createCheckoutSession({
        billingInterval: interval,
      });

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || 'Κάτι πήγε στραβά');
      }
    });
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Left: Billing Info — reuses existing BillingForm with hideCard prop */}
      <div className='lg:col-span-2'>
        <Card>
          <CardHeader>
            <CardTitle>Στοιχεία Τιμολόγησης</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Τα στοιχεία αυτά χρησιμοποιούνται για την έκδοση παραστατικού
            </p>
          </CardHeader>
          <CardContent>
            <BillingForm
              initialUser={user}
              initialProfile={profile}
              hideCard
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: Plan Summary */}
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Προωθημένο Πακέτο</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Interval Toggle */}
            <div className='flex gap-2'>
              <Button
                variant={interval === 'month' ? 'default' : 'outline'}
                size='sm'
                className='flex-1'
                onClick={() => setInterval('month')}
              >
                Μηνιαία
              </Button>
              <Button
                variant={interval === 'year' ? 'default' : 'outline'}
                size='sm'
                className='flex-1 relative'
                onClick={() => setInterval('year')}
              >
                Ετήσια
                <Badge
                  variant='secondary'
                  className='absolute -top-2 -right-2 text-[10px] px-1'
                >
                  -25%
                </Badge>
              </Button>
            </div>

            <Separator />

            {/* Price Display */}
            <div className='text-center space-y-1'>
              <p className='text-3xl font-bold'>
                {interval === 'year' ? '€15' : '€20'}
                <span className='text-base font-normal text-muted-foreground'>
                  /μήνα
                </span>
              </p>
              {interval === 'year' && (
                <p className='text-sm text-muted-foreground'>
                  €180/έτος (3 μήνες δώρο)
                </p>
              )}
            </div>

            <Separator />

            {/* Benefits Summary */}
            <div className='space-y-2 text-sm'>
              <p className='font-medium'>Περιλαμβάνει:</p>
              <ul className='space-y-1 text-muted-foreground'>
                <li>- Προφίλ στην κορυφή αποτελεσμάτων</li>
                <li>- Έως {plan.maxServices} υπηρεσίες</li>
                <li>- Αυτόματη ημερήσια ανανέωση</li>
                <li>- Έως {plan.maxFeaturedServices} προβεβλημένες ⭐</li>
                <li>- Ενότητα "Επιπλέον υπηρεσίες"</li>
              </ul>
            </div>

            <Separator />

            {/* Checkout Button */}
            <Button
              className='w-full'
              size='lg'
              onClick={handleCheckout}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Μετάβαση στην πληρωμή...
                </>
              ) : (
                `Πληρωμή ${interval === 'year' ? '€180/έτος' : '€20/μήνα'}`
              )}
            </Button>

            <p className='text-xs text-center text-muted-foreground'>
              Ασφαλής πληρωμή μέσω Stripe. Ακύρωση οποτεδήποτε.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
