import ServiceCard1 from "@/components/dashboard/card/ServiceCard1";
import FeaturedServiceSliderCard from "../../Cards/FeaturedServiceSliderCard";
import FeaturedServiceCard from "../../Cards/FeaturedServiceCard";

export function ServicesTab({ services, fid }) {
  if (!services) {
    return (
      <div className="row">
        <p>Δεν βρέθηκαν αποθηκευμένες υπηρεσίες</p>
      </div>
    );
  }
  return (
    <div className="row">
      {services.map((service, i) => {
        if (!service?.freelancer?.data?.attributes) return null;
        return (
          <div key={i} className="col-sm-6 col-xl-3">
            {service.media?.data?.length > 1 ? (
              <FeaturedServiceSliderCard
                service={service}
                fid={fid}
                showDelete={true}
              />
            ) : (
              <FeaturedServiceCard
                service={service}
                fid={fid}
                showDelete={true}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
