import React from 'react';
import { Star, DollarSign, Shield } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: 'Ξεχώρισε τους κορυφαίους',
    description:
      'Σύγκρινε και εντόπισε τα επαγγελματικά προφίλ που συγκεντρώνουν τις καλύτερες αξιολογήσεις.',
  },
  {
    icon: DollarSign,
    title: 'Χωρίς κρυφά κόστη',
    description:
      'Δεν υπάρχουν κρυφές χρεώσεις ή προμήθειες. Πληρώνεις στους επαγγελματίες το ποσό της προσφοράς τους.',
  },
  {
    icon: Shield,
    title: 'Ασφάλεια και Πιστοποίηση',
    description:
      'Θεωρούμε την ασφάλεια ως τον πιο σημαντικό παράγοντα, για αυτό πιστοποιούμε τα επαγγελματικά προφίλ για να έχεις το κεφάλι σου ήσυχο.',
  },
];

export default function FeaturesAbout() {
  return (
    <section className='py-16 lg:py-24 bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Content Section */}
          <div className='order-2 lg:order-1'>
            <h2 className='text-2xl font-bold text-[hsl(var(--dark))] mb-8 leading-tight'>
              Είσαι έτοιμος για την επόμενη συνεργασία σου;
            </h2>

            <div className='space-y-6'>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className='flex gap-4 group hover:translate-x-1 transition-transform duration-300'
                  >
                    <div className='flex-shrink-0 w-12 h-12 bg-hsl(var(--primary))/10 rounded-lg flex items-center justify-center group-hover:bg-hsl(var(--primary))/20 transition-colors duration-300'>
                      <Icon className='w-6 h-6 text-hsl(var(--primary)) group-hover:scale-110 transition-transform duration-300' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-lg font-semibold text-[hsl(var(--dark))] mb-2'>
                        {feature.title}
                      </h4>
                      <p className='text-base text-[hsl(var(--body))] leading-relaxed'>
                        {feature.description}
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
              <img
                src='https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                alt='Επιχειρηματική συνάντηση - Doulitsa platform'
                className='w-full h-auto rounded-2xl shadow-2xl object-cover aspect-[4/3] lg:aspect-square'
                loading='lazy'
                width={600}
                height={600}
              />
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
