'use client';

import dynamic from 'next/dynamic';

const Stats = dynamic(() => import('../section/section-stats'), {
  ssr: false,
  loading: () => (
    <section className='bggreenorange'>
      <div className='container'>
        <div className='row align-items-md-center'>
          <div className='col-md-6 col-lg-8 mb30-md'>
            <div className='main-title'>
              <h2 className='title'>
                Βρες τους πιο αξιόλογους επαγγελματίες
              </h2>
              <p className='paragraph'>
                Η Doulitsa επιβραβεύει και ξεχωρίζει τους καλύτερους
                επαγγελματίες, γιατί θέλουμε να μένουν όλοι ικανοποιημένοι.
              </p>
            </div>
            <div className='row'>
              <div className='col-sm-6 col-lg-4'>
                <div className='funfact_one'>
                  <div className='details'>
                    <div className='placeholder-glow'>
                      <span className='placeholder col-3 bg-success'></span>
                    </div>
                    <p className='text mb-0'>Φόρτωση στατιστικών...</p>
                  </div>
                </div>
              </div>
              <div className='col-sm-6 col-lg-4'>
                <div className='funfact_one'>
                  <div className='details'>
                    <div className='placeholder-glow'>
                      <span className='placeholder col-3 bg-success'></span>
                    </div>
                    <p className='text mb-0'>Φόρτωση στατιστικών...</p>
                  </div>
                </div>
              </div>
              <div className='col-sm-6 col-lg-4'>
                <div className='funfact_one'>
                  <div className='details'>
                    <h2>Μας προτείνουν</h2>
                    <p className='text mb-0'>Φόρτωση...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-6 col-lg-4 col-xl-4'>
            <div className='ui-hightest-rated mb15'>
              <div className='placeholder-glow p-4'>
                <div className='placeholder col-12 bg-light mb-2' style={{ height: '100px' }}></div>
                <div className='placeholder col-8 bg-light'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
});

export default function Stats_D() {
  return <Stats />;
}
