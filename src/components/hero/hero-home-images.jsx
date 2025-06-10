'use client';

import Image from 'next/image';

export default function HeroImages() {
  return (
    <div className='home12-hero-img'>
      {/* Main LCP Image - Ultra-Optimized for Next.js 15 */}
      <Image
        width={810}
        height={860}
        style={{ 
          height: 'fit-content',
          // Critical: Prevent layout shift and ensure fast rendering
          containIntrinsicSize: '810px 860px',
          contentVisibility: 'auto'
        }}
        className='img-0'
        src='/images/about/home12-hero-img.png'
        alt='Doulitsa Hero Εικόνα'
        priority
        fetchPriority='high'
        quality={85}
        // Optimized responsive sizes for better performance
        sizes='(max-width: 640px) 100vw, (max-width: 828px) 90vw, (max-width: 1200px) 75vw, 810px'
        // Enable modern formats
        placeholder="empty"
        // Optimize decoding
        decoding="async"
        // Prevent render blocking
        loading="eager"
      />

      {/* Optimized secondary images */}
      <div className='position-relative'>
        <Image
          width={90}
          height={90}
          style={{ 
            height: 'fit-content',
            containIntrinsicSize: '90px 90px'
          }}
          className='img-3 bounce-y'
          src='/images/team/home12-img-3.png'
          alt='Doulitsa Hero Illustration'
          loading='lazy'
          quality={75}
          decoding="async"
        />
      </div>

      <div className='iconbox-small1 text-start d-flex wow fadeInRight default-box-shadow4 bounce-x animate-up-1'>
        <span className='icon flaticon-review'></span>
        <div className='details pl20'>
          <h6 className='mb-1'>Κριτικές 5*</h6>
          <p className='text fz13 mb-0'>TOP επαγγελματίες</p>
        </div>
      </div>

      <div className='iconbox-small2 text-start d-flex wow fadeInLeft default-box-shadow4 bounce-y animate-up-2'>
        <span className='icon flaticon-rocket'></span>
        <div className='details pl20'>
          <h6 className='mb-1'>100+ νέες</h6>
          <p className='text fz13 mb-0'>Διαθέσιμες Υπηρεσίες</p>
        </div>
      </div>
    </div>
  );
}
