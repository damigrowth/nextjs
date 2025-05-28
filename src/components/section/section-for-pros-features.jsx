import AllTimeSelling from './section-for-pros-features-selling';

export default function OurFeature1() {
  return (
    <>
      <section className='our-features pt-0 pb90'>
        <div className='container'>
          <div className='row wow fadeInUp'>
            <div className='col-lg-12'>
              <div className='main-title'>
                <h2>Προσφέρεις υπηρεσίες;</h2>
                <p className='text'>
                  Δες την διαδικασία για να προβληθείς στην Doulitsa. Είναι πολύ
                  απλή!
                </p>
              </div>
            </div>
          </div>
          <AllTimeSelling />
        </div>
      </section>
    </>
  );
}
