'use client';

import dynamic from 'next/dynamic';

const AllTaxonomies = dynamic(() => import('../content').then(mod => ({ default: mod.AllTaxonomies })), {
  ssr: false,
  loading: () => (
    <section className='pb40 pt40'>
      <div className='container'>
        <div className='main-title text-center mb-4'>
          <h2>Δημοφιλείς Κατηγορίες</h2>
          <p>Φόρτωση κατηγοριών...</p>
        </div>
        <div className='row'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='col-sm-6 col-lg-4 mb-4'>
              <div className='placeholder-glow'>
                <div className='placeholder col-12 bg-light rounded' style={{ height: '120px' }}></div>
                <div className='placeholder col-8 bg-light mt-2'></div>
                <div className='placeholder col-6 bg-light mt-1'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function AllTaxonomies_D(props) {
  return <AllTaxonomies {...props} />;
}
