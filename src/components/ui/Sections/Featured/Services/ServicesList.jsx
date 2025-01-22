// ServicesList.jsx (server component)
import FeaturedServiceCard from "@/components/ui/Cards/FeaturedServiceCard";
import FeaturedServiceSliderCard from "@/components/ui/Cards/FeaturedServiceSliderCard";
import ServicesListWrapper from "./ServicesListWrapper";

export default function ServicesList({ services, fid }) {
  return (
    <ServicesListWrapper>
      <div className="row">
        {services.map((service, i) => {
          if (
            !service?.attributes?.freelancer?.data?.attributes ||
            service.attributes.media?.data?.length === 0
          ) {
            return null;
          }

          return (
            <div
              key={i}
              className="col-sm-6 col-xl-3"
              data-category={
                service.attributes.category?.data?.attributes?.slug || ""
              }
            >
              {service.attributes.media?.data?.length > 1 ? (
                <FeaturedServiceSliderCard
                  service={{ id: service.id, ...service.attributes }}
                  fid={fid}
                />
              ) : (
                <FeaturedServiceCard
                  service={{ id: service.id, ...service.attributes }}
                  fid={fid}
                />
              )}
            </div>
          );
        })}
      </div>
    </ServicesListWrapper>
  );
}
