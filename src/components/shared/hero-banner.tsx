import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

type HeroData = {
  title: string;
  description: string;
};

type DecorativeImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  animated?: boolean;
};

type Props = {
  data: HeroData;
  backgroundImage?: string;
  backgroundColor?: string;
  decorativeImages?: DecorativeImage[];
  buttonConfig?: {
    text: string;
    href: string;
    icon?: React.ReactNode | string;
  };
  className?: string;
  contentClassName?: string;
};

const getImagePositionClasses = (position: DecorativeImage['position']) => {
  switch (position) {
    case 'top-left':
      return 'absolute left-0 top-0';
    case 'top-right':
      return 'absolute right-0 top-0';
    case 'bottom-left':
      return 'absolute left-0 bottom-0';
    case 'bottom-right':
      return 'absolute right-0 bottom-0';
    default:
      return 'absolute left-0 top-0';
  }
};

const getIconComponent = (icon: React.ReactNode | string | undefined) => {
  if (typeof icon === 'string') {
    switch (icon) {
      case 'ArrowRight':
        return <ArrowRight className='w-4 h-4' />;
      default:
        return null;
    }
  }
  return icon;
};

export default function HeroBanner({
  data,
  backgroundImage = 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750251218/Static/cta-about-banner_brm1gg.webp',
  backgroundColor,
  decorativeImages,
  buttonConfig,
  className = '',
  contentClassName = '',
}: Props) {
  // Determine container classes based on whether we're using background image or color
  const containerClasses = backgroundColor
    ? `${backgroundColor} h-80 px-5 lg:px-20`
    : 'h-80';

  return (
    <section className={`pt-14 px-4 lg:px-6 pb-6 ${className}`}>
      <div
        className={`max-w-4xl mx-auto rounded-2xl relative flex items-center overflow-hidden ${containerClasses}`}
      >
        {/* Background Image (only if no backgroundColor) */}
        {!backgroundColor && backgroundImage && (
          <Image
            src={backgroundImage}
            alt='Banner background'
            fill
            className='object-cover rounded-2xl'
            priority
          />
        )}

        {/* Decorative Images */}
        {decorativeImages?.map((image, index) => (
          <Image
            key={index}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className={`${getImagePositionClasses(image.position)} ${
              image.animated
                ? `${index === 0 ? 'animate-bounce-left' : 'animate-bounce-right'}`
                : ''
            }`}
          />
        ))}

        {/* Content */}
        <div
          className={`container mx-auto px-4 relative z-10 ${contentClassName}`}
        >
          <div className='w-full xl:w-5/12 max-w-xl'>
            <h2 className='text-white text-2xl md:text-4xl font-bold mb-4 md:mb-6'>
              {data.title}
            </h2>
            <p className='text-white mb-8 text-base md:text-lg opacity-90'>
              {data.description}
            </p>
            {buttonConfig && (
              <a
                href={buttonConfig.href}
                className='inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors'
              >
                {buttonConfig.text}
                {getIconComponent(buttonConfig.icon)}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
