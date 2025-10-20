'use client';

import React, { useEffect } from 'react';
import useServiceOrderStore from '@/lib/stores/use-service-order-store';
import { StartChatDialog } from '@/components/messages/start-chat-dialog';

interface ServiceBuyProps {
  price: number;
  isOwner: boolean;
  profileUserId: string;
  profileDisplayName: string;
  serviceTitle: string;
}

export default function ServiceBuy({
  price,
  isOwner,
  profileUserId,
  profileDisplayName,
  serviceTitle,
}: ServiceBuyProps) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, [price, setOrder, calculateTotal]);

  if (isOwner) {
    return null;
  }

  // Build pre-populated message based on service and addons
  const buildInitialMessage = () => {
    let message = `Ενδιαφέρομαι για την υπηρεσία "${serviceTitle}"`;

    if (order?.total && order.total > 0) {
      message += ` (${order.total}€)`;

      if (order.addons.length > 0) {
        message += `\n\nΠρόσθετα:\n`;
        order.addons.forEach((addon) => {
          message += `- ${addon.title} (+${addon.price}€)\n`;
        });
      }
    }

    message += '\n\n';
    return message;
  };

  const buttonText =
    price === 0 || price === null ? 'Επικοινωνήστε' : `Σύνολο ${order?.total}€`;

  return (
    <div className='w-full'>
      <StartChatDialog
        recipientId={profileUserId}
        recipientName={profileDisplayName}
        initialMessage={buildInitialMessage()}
        customTrigger={buttonText}
      />
    </div>
  );
}
