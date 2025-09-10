import React from 'react';
import { MessageCircle, CreditCard, Shield, Users, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ProfileFeaturesProps = {
  budget?: string | null;
  size?: string | null;
  contactMethods?: string[];
  paymentMethods?: string[];
  settlementMethods?: string[];
};

const iconMap = {
  contact: MessageCircle,
  payment: CreditCard,
  settlement: Shield,
  size: Users,
  budget: Wallet,
};

export default function ProfileFeatures({
  budget,
  size,
  contactMethods = [],
  paymentMethods = [],
  settlementMethods = [],
}: ProfileFeaturesProps) {
  const features = [
    {
      id: 'contact',
      title: 'Επικοινωνία',
      Icon: iconMap.contact,
      items: contactMethods,
      visible: contactMethods.length > 0,
    },
    {
      id: 'payment',
      title: 'Τρόποι Πληρωμής',
      Icon: iconMap.payment,
      items: paymentMethods,
      visible: paymentMethods.length > 0,
    },
    {
      id: 'settlement',
      title: 'Μέθοδος Εξόφλησης',
      Icon: iconMap.settlement,
      items: settlementMethods,
      visible: settlementMethods.length > 0,
    },
    {
      id: 'size',
      title: 'Αριθμός Εργαζομένων',
      Icon: iconMap.size,
      items: size ? [size] : [],
      visible: !!size,
    },
    {
      id: 'budget',
      title: 'Ελάχιστο Budget',
      Icon: iconMap.budget,
      items: budget ? [budget] : [],
      visible: !!budget,
    },
  ];

  const visibleFeatures = features.filter((f) => f.visible);

  if (visibleFeatures.length === 0) {
    return null;
  }

  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 py-5'>
      {visibleFeatures.map((feature) => (
        <div key={feature.id}>
          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0'>
              <div className='relative inline-block text-2xl text-primary z-10 transition-all duration-300 ease-in-out before:content-[""] before:bg-orangy before:rounded-full before:absolute before:-bottom-1 before:-right-2 before:h-8 before:w-8 before:-z-10 before:transition-all before:duration-300 before:ease-in-out hover:before:bg-sixth'>
                <feature.Icon className='h-10 w-10' />
              </div>
            </div>
            <div className='flex-1 min-w-0'>
              <h5 className='text-sm font-bold text-foreground mb-3'>
                {feature.title}
              </h5>
              <div className='flex flex-wrap'>
                {feature.items.map((item, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='inline-block text-2sm font-medium mb-1 mr-1 py-1 px-2.5 text-center bg-muted text-muted-foreground border-none rounded-xl'
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
