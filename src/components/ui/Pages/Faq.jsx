export default function Faq({ data }) {
  return (
    <section className="our-faqs pb50 ">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-6 m-auto">
            <div className="main-title text-center">
              <h2 className="title">{data.title}</h2>
              <p className="paragraph mt10">{data.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInUp" data-wow-delay="300ms">
          <div className="col-lg-8 mx-auto">
            <div className="ui-content">
              <div className="accordion-style1 faq-page mb-4 mb-lg-5">
                <div className="accordion" id="accordionExample">
                  {data.questions.map((item) => (
                    <div
                      key={item.id}
                      className={`accordion-item ${
                        item.isOpen ? "active" : ""
                      }`}
                    >
                      <h2 className="accordion-header" id={`heading${item.id}`}>
                        <button
                          className={`accordion-button ${
                            item.isOpen ? "" : "collapsed"
                          }`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${item.id}`}
                          aria-expanded={item.isOpen ? "true" : "false"}
                          aria-controls={`collapse${item.id}`}
                        >
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id={`collapse${item.id}`}
                        className={`accordion-collapse collapse ${
                          item.isOpen ? "show" : ""
                        }`}
                        aria-labelledby={`heading${item.id}`}
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">{item.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
