'use client';

import React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

type TestimonialData = {
  id: string;
  text: string;
  author: {
    name: string;
    role: string;
    image: string;
  };
};

type Props = {};

const testimonials: TestimonialData[] = [
  {
    id: 'dimitris',
    text: 'Η επιχείρηση μου είναι μια μικρή ξενοδοχειακή μονάδα. Η Doulitsa με βοηθάει να βρίσκω επαγγελματίες που δεν θα μπορούσα να προσλάβω σε μόνιμη θέση.',
    author: {
      name: 'Δημήτρης Κ.',
      role: 'Ξενοδόχος',
      image: 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071235/Static/dimitris140_wuoksx.webp',
    },
  },
  {
    id: 'katerina',
    text: 'Βρήκα γρήγορα έναν επαγγελματία designer για να μου σχεδιάσει ένα καινούργιο logo και έμεινα απόλυτα ικανοποιημένη!',
    author: {
      name: 'Κατερίνα Ζ.',
      role: 'Επιχειρηματίας',
      image: 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071209/Static/katerina140_ztoig5.webp',
    },
  },
  {
    id: 'marios',
    text: 'Μέσα από την πλατφόρμα σας μπόρεσα να παρουσιάσω όλη τη δουλειά μου και να με εντοπίσουν νέους πελάτες, αλλά και συνεργάτες.',
    author: {
      name: 'Μάριος Θ.',
      role: 'Web Developer',
      image: 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071225/Static/marios140_qokg42.webp',
    },
  },
];

function TestimonialContent({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <div className='text-center'>
      <div className='mb-12'>
        <Quote className='text-secondary text-5xl mx-auto mb-11' />
        <h4 className='text-primary text-2xl font-bold font-sans leading-8 max-w-3xl mx-auto'>
          "{testimonial.text}"
        </h4>
      </div>
    </div>
  );
}

function TestimonialNav({ testimonials }: { testimonials: TestimonialData[] }) {
  const [activeIndex, setActiveIndex] = React.useState(1); // Start with Katerina (index 1) as active

  return (
    <div className='relative'>
      {/* Content Display */}
      <div className='mb-8'>
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`${index === activeIndex ? 'block' : 'hidden'}`}
          >
            <TestimonialContent testimonial={testimonial} />
          </div>
        ))}
      </div>

      {/* Navigation Pills */}
      <nav className='flex justify-center flex-wrap gap-4'>
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            onClick={() => setActiveIndex(index)}
            className={`flex items-center bg-white rounded-full px-6 py-3 border transition-all hover:shadow-sm ${
              index === activeIndex
                ? 'shadow-sm border-third'
                : 'border-border hover:border-gray-300'
            }`}
          >
            <Image
              height={70}
              width={70}
              className='h-18 w-18 object-cover rounded-full mr-8'
              src={testimonial.author.image}
              alt={testimonial.author.name}
            />
            <div className='text-left'>
              <h6 className='text-dark font-medium text-base mb-0 leading-tight'>
                {testimonial.author.name}
                <br />
                <small className='text-body text-sm font-normal'>
                  {testimonial.author.role}
                </small>
              </h6>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function TestimonialsAbout({}: Props) {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-wrap items-center justify-center'>
          {/* Title Section */}
          <div className='w-full lg:w-1/2 mx-auto mb-16'>
            <div className='text-center'>
              <h2 className='title text-2xl lg:text-3xl font-bold mb-4 text-dark'>
                Είπαν για εμάς
              </h2>
              <p className='paragraph text-body leading-relaxed mt-3'>
                Αν θέλετε να μπείτε εδώ, στείλτε μας τα σχόλια σας για την πλατφόρμα με email.
              </p>
            </div>
          </div>
        </div>

        <div className='flex justify-center'>
          <div className='w-full xl:w-5/6 mx-auto'>
            <TestimonialNav testimonials={testimonials} />
          </div>
        </div>
      </div>
    </section>
  );
}
