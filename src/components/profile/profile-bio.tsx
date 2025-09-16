import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatText } from '@/lib/utils/formatting';
import React from 'react';

type ProfileBioProps = {
  bio: string | null;
};

export default function ProfileBio({ bio }: ProfileBioProps) {
  if (!bio) {
    return null;
  }

  const formattedBio = formatText(bio);

  return (
    <section>
      <Card className='rounded-lg border border-border'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-semibold'>Σχετικά</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>{formattedBio}</div>
        </CardContent>
      </Card>
    </section>
  );
}
