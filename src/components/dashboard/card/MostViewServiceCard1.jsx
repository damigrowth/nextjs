import ServiceCardFile from "@/components/ui/Cards/ServiceCardFile";
import ServiceCardFiles from "@/components/ui/Cards/ServiceCardFiles";
import Link from "next/link";

export default function MostViewServiceCard1({ data }) {
  const media = data.attributes.media;

  return (
    <div className="listing-style1 list-style d-block d-xl-flex align-items-center border-0 mb10">
      <div className="small-list flex-shrink-0 bdrs4">
        {media.data.length > 1 ? (
          <ServiceCardFiles
            media={media?.data?.map((item) => item.attributes)}
            path={`/s/${data.attributes.slug}`}
          />
        ) : (
          <ServiceCardFile
            file={media?.data[0]?.attributes}
            path={`/s/${data.attributes.slug}`}
          />
        )}
      </div>
      <div className="list-content flex-grow-1 pt10 pb10 pl15 pl0-lg">
        <h6 className="list-title mb-2">
          <Link href="/service-single">{data.attributes.title}</Link>
        </h6>
        <div className="list-meta d-flex justify-content-between align-items-center">
          <div className="review-meta d-flex align-items-center">
            <i className="fas fa-star fz10 review-color me-2" />
            <p className="mb-0 body-color fz14">
              <span className="dark-color me-2">{data.attributes.rating}</span>
            </p>
          </div>
          {data.attributes.price > 0 && (
            <div className="budget">
              <p className="mb-0 body-color">
                από
                <span className="fz17 fw500 dark-color ms-1">
                  ${data.attributes.price}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
