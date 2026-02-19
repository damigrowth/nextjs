'use client';

import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config';

interface PlanComparisonProps {
  triggerReason?: string | null;
}

const freePlan = SUBSCRIPTION_PLANS.free;
const promotedPlan = SUBSCRIPTION_PLANS.promoted;

export default function PlanComparison({
  triggerReason,
}: PlanComparisonProps) {
  return (
    <div className='space-y-6'>
      {triggerReason && (
        <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800'>
          {triggerReason}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Basic Plan */}
        <Card className='border-2 border-muted'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Βασικό</CardTitle>
              <Badge variant='outline'>Τρέχον</Badge>
            </div>
            <p className='text-2xl font-bold'>Δωρεάν</p>
          </CardHeader>
          <CardContent className='space-y-3'>
            <FeatureRow
              label={`Έως ${freePlan.maxServices} υπηρεσίες`}
              included
            />
            <FeatureRow
              label={`Έως ${freePlan.maxDailyRefreshes} ανανεώσεις/ημέρα`}
              included
            />
            <FeatureRow label='Περιορισμένη ορατότητα' included />
            <FeatureRow label='Προβολή προφίλ στην κορυφή' included={false} />
            <FeatureRow label='Προβεβλημένες υπηρεσίες' included={false} />
            <FeatureRow label='Αυτόματη ανανέωση υπηρεσιών' included={false} />
          </CardContent>
        </Card>

        {/* Promoted Plan */}
        <Card className='border-2 border-primary shadow-lg'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Προωθημένο</CardTitle>
              <Badge variant='secondary'>Δημοφιλές</Badge>
            </div>
            <p className='text-2xl font-bold'>
              Από 15€
              <span className='text-sm font-normal text-muted-foreground'>
                /μήνα
              </span>
            </p>
          </CardHeader>
          <CardContent className='space-y-3'>
            <FeatureRow label='Προφίλ στην κορυφή αποτελεσμάτων' included />
            <FeatureRow
              label={`Έως ${promotedPlan.maxServices} υπηρεσίες`}
              included
            />
            <FeatureRow
              label='Αυτόματη ημερήσια ανανέωση υπηρεσιών'
              included
            />
            <FeatureRow
              label={`Έως ${promotedPlan.maxFeaturedServices} προβεβλημένες υπηρεσίες`}
              included
            />
            <FeatureRow
              label='Προτεραιότητα στις σχετικές υπηρεσίες'
              included
            />
            <FeatureRow label='Ενότητα "Επιπλέον υπηρεσίες"' included />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className='flex items-center gap-2 text-sm'>
      {included ? (
        <Check className='size-4 text-green-600 shrink-0' />
      ) : (
        <X className='size-4 text-muted-foreground/40 shrink-0' />
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );
}
