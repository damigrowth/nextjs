'use client';

import Image from 'next/image';

export default function HeroImages() {
  return (
    <div className='home-hero-img'>
      {/* Main LCP Image - Ultra-Optimized for Next.js 15 */}
      <Image
        width={810}
        height={860}
        style={{
          height: 'fit-content',
          // Critical: Prevent layout shift and ensure fast rendering
          containIntrinsicSize: '810px 860px',
          contentVisibility: 'auto',
        }}
        className='img-0'
        src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750069512/Static/home12-hero-img_g2jdtm.webp'
        alt='Doulitsa Hero Εικόνα'
        priority
        fetchPriority='high'
        quality={85}
        // Optimized responsive sizes for better performance
        sizes='(max-width: 640px) 100vw, (max-width: 828px) 90vw, (max-width: 1200px) 75vw, 810px'
        // Enable modern formats
        placeholder='empty'
        // Optimize decoding
        decoding='async'
        // Prevent render blocking
        loading='eager'
      />

      {/* Optimized secondary images */}
      <div className='img-3-container'>
        <Image
          width={90}
          height={90}
          style={{
            height: 'fit-content',
            containIntrinsicSize: '90px 90px',
          }}
          className='img-3'
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750084063/Static/home12-img-3_rtgiou.webp'
          alt='Doulitsa Hero Illustration'
          loading='lazy'
          quality={75}
          decoding='async'
        />
      </div>

      <div className='iconbox iconbox-small1 bounce-x'>
        <span className='icon flaticon-review'></span>
        <div className='iconbox-inner'>
          <h6>Κριτικές 5*</h6>
          <p>TOP επαγγελματίες</p>
        </div>
      </div>

      <div className='iconbox iconbox-small2 bounce-y'>
        <span className='icon flaticon-rocket'></span>
        <div className='iconbox-inner'>
          <h6>100+ νέες</h6>
          <p>Διαθέσιμες Υπηρεσίες</p>
        </div>
      </div>
    </div>
  );
}
