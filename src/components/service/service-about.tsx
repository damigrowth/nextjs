import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatText } from '@/lib/utils/formatting';
import ProfileFeatures from '@/components/profile/profile-features';
import React from 'react';

type Props = {
  description?: string;
  tags?: string[];
  budget?: string | null;
  size?: string | null;
  contactMethods?: string[];
  paymentMethods?: string[];
  settlementMethods?: string[];
};

export default function ServiceAbout({
  description,
  tags = [],
  budget,
  size,
  contactMethods = [],
  paymentMethods = [],
  settlementMethods = [],
}: Props) {
  const formattedDescription = description && formatText(description);
  const hasProfileFeatures =
    budget ||
    size ||
    contactMethods.length > 0 ||
    paymentMethods.length > 0 ||
    settlementMethods.length > 0;

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-semibold'>Περιγραφή</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Service Description */}
        {description && (
          <div className='space-y-1 mb-14'>{formattedDescription}</div>
        )}

        {/* Service Tags */}
        {tags.length > 0 && (
          <div className='pb-4'>
            <h6 className='text-sm font-semibold mb-3'>Χαρακτηριστικά</h6>
            <div className='flex flex-wrap gap-1'>
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant='outline'
                  className='inline-block text-sm font-semibold mb-1.5 mr-1.5 py-2 px-2 text-center border border-muted-foreground rounded-xl text-muted-foreground'
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Profile Features */}
        {hasProfileFeatures && (
          <ProfileFeatures
            budget={budget}
            size={size}
            contactMethods={contactMethods}
            paymentMethods={paymentMethods}
            settlementMethods={settlementMethods}
          />
        )}

        {/* Show message if no content */}
        {!description && tags.length === 0 && !hasProfileFeatures && (
          <p className='text-sm text-muted-foreground italic'>
            Δεν έχουν καταχωρηθεί πρόσθετες πληροφορίες για αυτή την υπηρεσία
          </p>
        )}
      </CardContent>
    </Card>
  );
}
