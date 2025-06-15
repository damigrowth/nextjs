import FeaturedServiceCard from '../card/card-service-featured';
import FeaturedServiceSliderCard from '../card/card-service-featured-slider';

export default function ServicesTab({ services, fid }) {
  if (!services || services?.length === 0) {
    return (
      <div className='row'>
        <p>Δεν βρέθηκαν αποθηκευμένες υπηρεσίες</p>
      </div>
    );
  }

  return (
    <div className='row'>
      {services.map((service, i) => {
        if (!service?.freelancer?.data?.attributes) return null;

        // For saved services dashboard, savedStatus is always true
        const savedStatus = true;

        return (
          <div key={service.id} className='col-sm-6 col-xl-3'>
            {service.media?.data?.length > 1 ? (
              <FeaturedServiceSliderCard
                service={service}
                fid={fid}
                showDelete={true}
                savedStatus={savedStatus}
              />
            ) : (
              <FeaturedServiceCard
                service={service}
                fid={fid}
                showDelete={true}
                savedStatus={savedStatus}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
