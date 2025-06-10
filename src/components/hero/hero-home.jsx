import { Suspense } from 'react';
import { inspect } from '@/utils/inspect';

import HeroContent from './hero-home-content';
import HeroImages from './hero-home-images';

// Static content that renders immediately
function StaticHeroContent() {
  return (
    <div className='home12-hero-content'>
      <span className='d-inline-block tag mb15 fit'>
        <a
          href='/categories'
          className='text-decoration-none text-white hover:text-white'
        >
          Κατάλογος Υπηρεσιών
        </a>
      </span>

      {/* Critical LCP H1 - renders immediately with inline styles */}
      <h1
        style={{
          // CRITICAL: Prevent render delay
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#000',
          marginBottom: '25px',
          display: 'block',
          fontDisplay: 'swap',
          contain: 'layout style paint',
          willChange: 'auto',
          opacity: 1,
          visibility: 'visible',
          transform: 'none',
        }}
      >
        Οι καλύτερες Υπηρεσίες
        <br />
        στην οθόνη σου.
      </h1>

      {/* H2 also renders immediately */}
      <h2 className='heading-p'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
    </div>
  );
}

// Dynamic content that waits for data
function DynamicHeroContent({ categories }) {
  return <HeroContent categories={categories} />;
}

export default function Hero({ categories }) {
  return (
    <section className='hero-home12 overflow-hidden'>
      <div className='container'>
        <div className='row'>
          <div className='col-xl-7 hero-left'>
            {/* Static content renders immediately - no data dependencies */}
            <StaticHeroContent />

            {/* Dynamic content renders when data is ready */}
            <div style={{ marginTop: '20px' }}>
              <Suspense
                fallback={
                  <div
                    style={{
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                    ></div>
                    <span>Φόρτωση επιλογών...</span>
                  </div>
                }
              >
                <DynamicHeroContent categories={categories} />
              </Suspense>
            </div>
          </div>
          <div className='col-xl-5 d-none d-xl-block'>
            <HeroImages />
          </div>
        </div>
      </div>
    </section>
  );
}
