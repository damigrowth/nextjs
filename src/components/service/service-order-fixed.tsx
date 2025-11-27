'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import ServiceAddons from './service-addons';
import ServiceCalculatedPrice from './service-calculated-price';
import ServiceBuy from './service-buy';

interface ServiceOrderFixedProps {
  price: number;
  addons: PrismaJson.ServiceAddon[];
  compact?: boolean;
  profileUserId: string;
  profileDisplayName: string;
  serviceTitle: string;
}

export default function ServiceOrderFixed({
  price,
  addons,
  compact = false,
  profileUserId,
  profileDisplayName,
  serviceTitle,
}: ServiceOrderFixedProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === profileUserId;
  return (
    <Card className='mb-6'>
      <CardContent className='p-6 flex flex-col'>
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
          compact={compact}
        />
      </CardContent>
    </Card>
  );
}
