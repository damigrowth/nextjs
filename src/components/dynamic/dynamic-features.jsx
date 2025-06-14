'use client';

import dynamic from 'next/dynamic';

const Features = dynamic(() => import('../section').then(mod => ({ default: mod.Features })), {
  ssr: false,
  loading: () => (
    <section className='our-features pb40 pb30-md pt40 bgc-dark'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='main-title text-center'>
              <h2 style={{ color: '#5bbb7b' }}>Ψάχνεις κάποια υπηρεσία;</h2>
              <h3 className='heading-p' style={{ color: '#ffffff' }}>
                Βρες Επαγγελματίες και Υπηρεσίες που Ταιριάζουν στις Ανάγκες
                σου.
              </h3>
            </div>
          </div>
        </div>
        <div className='row'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='col-sm-6 col-lg-3'>
              <div className='iconbox-style1 at-home12 p-0 text-center'>
                <div className='icon before-none'>
                  <div className='placeholder-glow'>
                    <span className='placeholder bg-success rounded-circle' style={{ width: '60px', height: '60px', display: 'inline-block' }}></span>
                  </div>
                </div>
                <div className='details textpad'>
                  <div className='placeholder-glow'>
                    <div className='placeholder col-8 bg-success mt-3 mx-auto'></div>
                    <div className='placeholder col-12 bg-light mt-2'></div>
                    <div className='placeholder col-10 bg-light mt-1'></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function Features_D() {
  return <Features />;
}
