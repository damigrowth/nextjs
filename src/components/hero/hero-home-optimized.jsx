import { Suspense } from 'react';
import HeroImages from './hero-home-images';

// Lazy load heavy SearchBar component AFTER H1 renders
const HeroContent = dynamic(() => import('./hero-home-content'), {
  loading: () => (
    <div className='advance-search-tab searchaki bgc-white p10 bdrs4-sm bdrs60 searchbrd banner-btn position-relative zi1 mt30'>
      <div className='row'>
        <div className='col-12 text-center'>
          <div style={{ padding: '20px', color: '#999' }}>Loading search...</div>
        </div>
      </div>
    </div>
  )
});

// Import dynamic properly
import dynamic from 'next/dynamic';

// Static content that renders immediately - EXACT same classes as before
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

      {/* CRITICAL LCP H1 - Same styling, but with performance optimizations */}
      <h1
        style={{
          // CRITICAL: Keep original font but optimize loading
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#000',
          marginBottom: '25px',
          display: 'block',
          opacity: 1,
          visibility: 'visible',
          // Performance optimizations - invisible to user
          contain: 'layout style paint',
          textRendering: 'optimizeSpeed',
        }}
      >
        Οι καλύτερες Υπηρεσίες
        <br />
        στην οθόνη σου.
      </h1>

      {/* H2 with original class - same styling */}
      <h2 className='heading-p'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
    </div>
  );
}

export default function OptimizedHero({ categories }) {
  return (
    <section className='hero-home12 overflow-hidden'>
      <div className='container'>
        <div className='row'>
          <div className='col-xl-7 hero-left'>
            {/* CRITICAL: Static H1/H2 render immediately - no JavaScript dependency */}
            <StaticHeroContent />

            {/* NON-CRITICAL: SearchBar loads after H1 is painted */}
            <HeroContent categories={categories} />
          </div>
          <div className='col-xl-5 d-none d-xl-block'>
            <HeroImages />
          </div>
        </div>
      </div>
    </section>
  );
}
