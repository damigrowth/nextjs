'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import useServiceOrderStore from '@/lib/stores/use-service-order-store';

interface ServiceBuyProps {
  price: number;
  isOwner: boolean;
}

export default function ServiceBuy({ price, isOwner }: ServiceBuyProps) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, [price, setOrder, calculateTotal]);

  const handleSendMessage = () => {
    // TODO: Implement message sending logic
    console.log('Sending message:', message);
    setIsOpen(false);
    setMessage('');
  };

  if (isOwner) {
    return null;
  }

  const buttonText =
    price === 0 || price === null ? 'Επικοινωνήστε' : `Σύνολο ${order?.total}€`;

  return (
    <div className='w-full'>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className='w-full' size='lg'>
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Στείλτε μήνυμα</DialogTitle>
            <DialogDescription>
              Επικοινωνήστε με τον πάροχο υπηρεσιών για αυτήν την υπηρεσία.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='message'>Μήνυμα</Label>
              <Textarea
                id='message'
                placeholder='Γράψτε το μήνυμά σας εδώ...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className='resize-none'
              />
            </div>
            {order?.total > 0 && (
              <div className='bg-gray-50 p-3 rounded-md'>
                <div className='text-sm text-gray-600 mb-1'>
                  Σύνολο παραγγελίας:
                </div>
                <div className='text-lg font-semibold text-primary'>
                  {order.total}€
                </div>
                {order.addons.length > 0 && (
                  <div className='text-xs text-gray-500 mt-1'>
                    Περιλαμβάνει {order.addons.length} επιπλέον υπηρεσί
                    {order.addons.length === 1 ? 'α' : 'ες'}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Ακύρωση
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              Αποστολή μηνύματος
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
