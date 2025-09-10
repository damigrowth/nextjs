import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBio } from '@/lib/utils/formatting';
import React from 'react';

type ProfileTermsProps = {
  terms: string | null;
};

export default function ProfileTerms({ terms }: ProfileTermsProps) {
  if (!terms) {
    return null;
  }

  const formattedTerms = formatBio(terms);

  return (
    <section>
      <Card className='rounded-lg border border-border'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-semibold'>Όροι Συνεργασίας</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>{formattedTerms}</div>
        </CardContent>
      </Card>
    </section>
  );
}