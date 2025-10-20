'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ServiceAddons from './service-addons';
import ServiceCalculatedPrice from './service-calculated-price';
import ServiceBuy from './service-buy';

interface ServiceOrderFixedProps {
  price: number;
  addons: PrismaJson.ServiceAddon[];
  isOwner: boolean;
  compact?: boolean;
  profileUserId: string;
  profileDisplayName: string;
  serviceTitle: string;
}

export default function ServiceOrderFixed({
  price,
  addons,
  isOwner,
  compact = false,
  profileUserId,
  profileDisplayName,
  serviceTitle,
}: ServiceOrderFixedProps) {
  return (
    <Card className='mb-6'>
      <CardContent className='p-6'>
        {/* Price Display */}
        <ServiceCalculatedPrice basePrice={price} compact={compact} />

        {/* Addons */}
        {addons.length > 0 && (
          <ServiceAddons addons={addons} compact={compact} />
        )}

        {/* Buy Button */}
        <ServiceBuy
          price={price}
          isOwner={isOwner}
          profileUserId={profileUserId}
          profileDisplayName={profileDisplayName}
          serviceTitle={serviceTitle}
        />
      </CardContent>
    </Card>
  );
}
