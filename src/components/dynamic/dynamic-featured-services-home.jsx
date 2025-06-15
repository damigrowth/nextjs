import dynamic from 'next/dynamic';

const FeaturedServicesHome = dynamic(
  () => import('../section').then((mod) => ({ default: mod.FeaturedServicesHome })),
  {
    ssr: true, // Keep SEO benefits
    loading: () => (
      <section className="pt-0 pb100 pt100 bgorange">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-3">
              <div className="main-title mb30-lg">
                <div className="bg-light rounded mb-2" style={{height: '32px', width: '200px'}}></div>
                <div className="bg-light rounded" style={{height: '16px', width: '150px'}}></div>
              </div>
            </div>
            <div className="col-xl-9">
              <div className="d-flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-light rounded px-3 py-2" style={{height: '40px', width: '120px'}}></div>
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-lg-3 col-sm-6 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="bg-light" style={{height: '200px'}}></div>
                  <div className="card-body">
                    <div className="bg-light rounded mb-2" style={{height: '20px'}}></div>
                    <div className="bg-light rounded mb-2" style={{height: '16px', width: '80%'}}></div>
                    <div className="bg-light rounded" style={{height: '16px', width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  },
);

export default function FeaturedServicesHome_D({ savedServices, ...props }) {
  return <FeaturedServicesHome savedServices={savedServices} {...props} />;
}
