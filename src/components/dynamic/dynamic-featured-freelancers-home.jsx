import dynamic from 'next/dynamic';

const FeaturedFreelancersHome = dynamic(
  () => import('../section').then((mod) => ({ default: mod.FeaturedFreelancersHome })),
  {
    ssr: true, // Keep SEO benefits
    loading: () => (
      <section className="bgc-dark pb90 pb30-md">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-9">
              <div className="main-title">
                <div className="bg-secondary rounded mb-2" style={{height: '32px', width: '300px'}}></div>
                <div className="bg-secondary rounded" style={{height: '16px', width: '250px'}}></div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="bg-secondary rounded" style={{height: '40px', width: '150px', marginLeft: 'auto'}}></div>
            </div>
          </div>
          <div className="row">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-lg-3 col-sm-6 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px'}}></div>
                    <div className="bg-light rounded mb-2" style={{height: '18px'}}></div>
                    <div className="bg-light rounded mb-2" style={{height: '14px', width: '70%', margin: '0 auto'}}></div>
                    <div className="bg-light rounded" style={{height: '14px', width: '50%', margin: '0 auto'}}></div>
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

export default function FeaturedFreelancersHome_D({ savedFreelancers, ...props }) {
  return <FeaturedFreelancersHome savedFreelancers={savedFreelancers} {...props} />;
}
