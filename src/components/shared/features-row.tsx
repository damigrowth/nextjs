import React from 'react';
import { FileText, Layout, Shield, Headphones } from 'lucide-react';

interface ProcessStep {
  icon: string;
  title: string;
  description: string;
}

interface ProcessStepsData {
  title: string;
  subtitle: string;
  image: string;
  list: ProcessStep[];
}

interface FeaturesRowProps {
  data: ProcessStepsData;
}

const iconMap = {
  'flaticon-cv': FileText,
  'flaticon-web-design': Layout,
  'flaticon-secure': Shield,
  'flaticon-customer-service': Headphones,
};

export default function FeaturesRow({ data }: FeaturesRowProps) {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='mb-16'>
          <h2 className='text-2xl font-bold text-foreground mb-4'>
            {data.title}
          </h2>
          <p className='text-body max-w-2xl'>{data.subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {data.list.map((step, index) => {
            const IconComponent =
              iconMap[step.icon as keyof typeof iconMap] || FileText;

            return (
              <div
                key={index}
                className='group'
              >
                {/* Icon */}
                <div className='mb-6'>
                  <div className='flex items-center justify-center w-16 h-16 bg-orangy rounded-lg text-primary mb-4'>
                    <IconComponent size={28} />
                  </div>
                </div>

                {/* Content */}
                <div className='space-y-3'>
                  <h4 className='text-base font-semibold text-foreground leading-tight'>
                    {step.title}
                  </h4>
                  <p className='text-body text-sm leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
