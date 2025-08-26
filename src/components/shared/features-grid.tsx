import React from 'react';
import Image from 'next/image';
import { Star, DollarSign, Shield } from 'lucide-react';

type FeatureItem = {
  title: string;
  desc: string;
  icon: string;
};

type FeaturesData = {
  title: string;
  subtitle?: string;
  image: string;
  alt: string;
  list: FeatureItem[];
};

type Props = {
  data: FeaturesData;
};

const iconMap = {
  'flaticon-badge': Star,
  'flaticon-wallet': DollarSign,
  'flaticon-security': Shield,
};

export default function FeaturesGrid({ data }: Props) {
  return (
    <section className='py-16 lg:py-24 bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Content Section */}
          <div className='order-2 lg:order-1'>
            <h2 className='text-2xl font-bold text-[hsl(var(--dark))] mb-8 leading-tight'>
              {data.title}
            </h2>
            {data.subtitle && (
              <p className='text-base text-[hsl(var(--body))] mb-8'>
                {data.subtitle}
              </p>
            )}

            <div className='space-y-6'>
              {data.list.map((feature, index) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Star;
                return (
                  <div 
                    key={index} 
                    className='flex gap-4 group hover:translate-x-1 transition-transform duration-300'
                  >
                    <div className='flex-shrink-0 w-12 h-12 bg-hsl(var(--primary))/10 rounded-lg flex items-center justify-center group-hover:bg-hsl(var(--primary))/20 transition-colors duration-300'>
                      <IconComponent className='w-6 h-6 text-hsl(var(--primary)) group-hover:scale-110 transition-transform duration-300' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-lg font-semibold text-[hsl(var(--dark))] mb-2'>
                        {feature.title}
                      </h4>
                      <p className='text-base text-[hsl(var(--body))] leading-relaxed'>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image Section */}
          <div className='order-1 lg:order-2'>
            <div className='relative'>
              <Image
                src={data.image}
                alt={data.alt}
                width={600}
                height={600}
                className='w-full h-auto rounded-2xl shadow-2xl object-cover aspect-[4/3] lg:aspect-square'
                loading='lazy'
              />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}