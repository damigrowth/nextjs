import React from 'react';
import Image from 'next/image';
import { Search, MessageCircle, Shield } from 'lucide-react';

type Props = {};

const processSteps = [
  {
    icon: Search,
    title: 'Βρες τον καλύτερο',
    description:
      'Δες τις αξιολογήσεις και εντόπισε το καλύτερο επαγγελματικό προφίλ για αυτό που ψάχνεις.',
  },
  {
    icon: MessageCircle,
    title: 'Επιλέξτε τη συνεργασία σας',
    description:
      'Επικοινώνησε με τον επαγγελματία για να σε ενημερώσει πως θα προχωρήσετε.',
  },
  {
    icon: Shield,
    title: 'Μείνε Ασφαλής',
    description:
      'Προτίμησε τα Πιστοποιημένα Προφίλ που έχουν διασταυρωθεί ότι υπάρχουν πραγματικά.',
  },
];

export default function FeaturesImageAbout({}: Props) {
  return (
    <section className='relative mx-auto max-w-4xl h-[900px] flex items-center lg:px-5 lg:pt-15 lg:pb-15 '>
      {/* Background pseudo-element equivalent - matches .cta-banner-about2:before */}
      <div className='absolute inset-y-0 left-0 w-[71%] bg-bluey rounded-lg lg:rounded-none' />

      {/* Background Image - hidden on mobile, visible on xl+ */}
      <Image
        height={701}
        width={717}
        className='hidden xl:block absolute right-0 top-0 h-full object-contain'
        src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750070110/Static/about-page-image-3_bzuclt.webp'
        alt='about'
      />

      <div className='container mx-auto px-6 relative z-10'>
        <div className='flex flex-wrap'>
          <div className='w-full md:w-11/12'>
            <div className='mb-16'>
              <h2 className='title text-xl lg:text-2xl font-bold capitalize mb-4 text-dark'>
                Ψάχνεις για κάποια Υπηρεσία;
              </h2>
              <p className='text-body leading-relaxed'>
                Ξεκίνα την αναζήτηση και κάνε Doulitsa 😉
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
          {processSteps.map((step, index) => (
            <div
              key={index}
              className='bg-white p-4 rounded-xl shadow-sm relative mb-6'
            >
              <step.icon className='text-primary text-3xl mb-4 block' />
              <h4 className='text-dark font-semibold text-lg mt-5 mb-2'>
                {step.title}
              </h4>
              <p className='text-body leading-relaxed mb-0'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
