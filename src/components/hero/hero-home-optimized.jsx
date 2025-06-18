import HeroContent from './hero-home-content';
import HeroImages from './hero-home-images';

// Static content that renders immediately - matches original structure exactly
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

      {/* Critical LCP H1 - renders immediately with optimized inline styles */}
      <h1
        style={{
          // CRITICAL: Prevent render delay - optimized from original
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

      {/* H2 also renders immediately - exact same as original */}
      <h2 className='heading-p'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
    </div>
  );
}

// Dynamic content that renders immediately - NO loading states
function DynamicHeroContent({ categories }) {
  return <HeroContent categories={categories} />;
}

export default function OptimizedHero({ categories }) {
  return (
    <section className='hero-home12 overflow-hidden'>
      <div className='container'>
        <div className='row'>
          <div className='col-xl-7 hero-left'>
            {/* Static content renders immediately - no data dependencies */}
            <StaticHeroContent />

            {/* Dynamic content renders immediately - NO loading states */}
            <div style={{ marginTop: '20px' }}>
              <DynamicHeroContent categories={categories} />
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
