import Image from "next/image";

const Cta1 = ({ data }) => {
  const lists = data.lists.map((list, index) => (
    <div className="list-one d-flex align-items-start mb30" key={index}>
      <span className={"list-icon flex-shrink-0" + " " + list.icon}></span>
      <div className="list-content flex-grow-1 ml20">
        <h4 className="mb-1">{list.title}</h4>
        <p className="text mb-0 fz15">{list.desc}</p>
      </div>
    </div>
  ));

  return (
    <section className="p-0">
      <div className="cta-banner mx-auto maxw1600 pt120 pt60-lg pb90 pb60-lg position-relative overflow-hidden mx20-lg">
        <div className="container">
          <div className="row align-items-center">
            <div
              className="col-md-6 col-xl-5 pl30-md pl15-xs wow fadeInRight"
              data-wow-delay="500ms"
            >
              <div className="mb30">
                <div className="main-title">
                  <h2 className="title">
                    {data.title}
                    <br className="d-none d-lg-block" />
                    {data.subtitle}
                  </h2>
                </div>
              </div>
              <div className="why-chose-list">{lists}</div>
            </div>
            <div
              className="col-md-6 col-xl-6 offset-xl-1 wow fadeInLeft"
              data-wow-delay="500ms"
            >
              <div className="about-img">
                <Image
                  height={705}
                  width={691}
                  className="w100 h-100"
                  src={data.image}
                  alt={data.alt}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta1;
