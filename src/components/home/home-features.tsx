'use client';

import React from 'react';
import { Search } from 'lucide-react';
import {
  FlaticonCv,
  FlaticonWebDesign,
  FlaticonSecure,
  FlaticonCustomerService,
} from '@/components/icon/flaticon';
import { featuresData } from '@/constants/datasets/data';

type FeatureData = {
  iconClass: string;
  title: string;
  description: string;
};

type Props = {
  features?: FeatureData[];
};

// Map icon class names to Flaticon components
function getFeatureIcon(iconClass: string) {
  const iconMap: { [key: string]: React.ReactNode } = {
    'flaticon-cv': <FlaticonCv size={40} />,
    'flaticon-web-design': <FlaticonWebDesign size={40} />,
    'flaticon-secure': <FlaticonSecure size={40} />,
    'flaticon-customer-service': <FlaticonCustomerService size={40} />,
  };

  return iconMap[iconClass] || <Search size={40} />;
}

export default function FeaturesHome({ features }: Props) {
  // Use provided features or fallback to default data
  const featuresItems = features || featuresData;

  return (
    <section className='py-30 pt-10 pb-10 md:pb-8 bg-dark'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-wrap'>
          <div className='w-full'>
            <div className='text-center mb-12'>
              <h2 className='text-xl lg:text-2xl font-bold mb-4 text-fourth'>
                Ψάχνεις κάποια υπηρεσία;
              </h2>
              <h3 className='text-sm text-white font-normal'>
                Βρες Επαγγελματίες και Υπηρεσίες που Ταιριάζουν στις Ανάγκες
                σου.
              </h3>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          {featuresItems.map((feature, index) => (
            <div key={index} className='w-full sm:w-1/2 lg:w-1/4'>
              <div className='bg-transparent rounded-xl mb-1 mt-5 py-10 px-8 pb-8 relative transition-all duration-300 ease-in-out text-center group hover:shadow-lg'>
                <div className='bg-bluey border border-gray-500 rounded-full h-28 w-28 leading-30 mb-5 transition-all duration-300 ease-in-out text-primary text-4xl relative z-10 group-hover:bg-third group-hover:text-white group-hover:shadow-none flex items-center justify-center place-self-center'>
                  {getFeatureIcon(feature.iconClass)}
                </div>
                <div className='px-8 pb-5 pt-2'>
                  <h4 className='text-sm font-bold mb-1 leading-6 pb-2 text-fourth'>
                    {feature.title}
                  </h4>
                  <p className='text-white'>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
