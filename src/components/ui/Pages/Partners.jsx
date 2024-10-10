import Image from "next/image";

export default function Partners({ data }) {
  return (
    <section className="our-partners pt0 pb0">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 wow fadeInUp">
            <div className="main-title text-center">
              <h6>{data.title}</h6>
            </div>
          </div>
        </div>
        <div className="row">
          {data.logos.map((logo, index) => (
            <div key={index} className="col-6 col-md-4 col-xl-2">
              <div className="partner_item text-center mb30-lg">
                <Image
                  height={26}
                  width={84}
                  className="wa m-auto w-100 h-100 object-fit-contain"
                  src={logo.src}
                  alt={logo.alt}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
