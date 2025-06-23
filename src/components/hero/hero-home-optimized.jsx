import HeroImages from './hero-home-images';

// Lazy load heavy SearchBar component AFTER H1 renders
const HeroContent = dynamic(() => import('./hero-home-content'), {
  loading: () => (
    <div className='hero-home-loading'>
      <div className='row-div'>
        <div className='inner'>
          <div className='inner-text'>Loading search...</div>
        </div>
      </div>
    </div>
  ),
});

// Import dynamic properly
import dynamic from 'next/dynamic';

// Static content that renders immediately - EXACT same classes as before
function StaticHeroContent() {
  return (
    <div className='home-hero-content'>
      <span className='tag'>
        <a href='/categories'>Κατάλογος Υπηρεσιών</a>
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
      <h2
        style={{
          fontFamily: 'sans-serif',
          fontSize: '15px',
          fontWeight: 400,
          lineHeight: 1.85,
          color: '#222',
          marginBottom: '0px',
        }}
      >
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
    </div>
  );
}

export default function OptimizedHero({ categories }) {
  return (
    <section className='home-hero'>
      <div className='home-hero-container'>
        <div className='row-div'>
          <div className='home-hero-left'>
            {/* CRITICAL: Static H1/H2 render immediately - no JavaScript dependency */}
            <StaticHeroContent />

            {/* NON-CRITICAL: SearchBar loads after H1 is painted */}
            <HeroContent categories={categories} />
          </div>
          <div className='home-hero-right'>
            <HeroImages />
          </div>
        </div>
      </div>
    </section>
  );
}
