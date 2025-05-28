import Image from 'next/image';

export default function TestimonialsAbout({ data }) {
  return (
    <>
      <section className='our-testimonial'>
        <div className='container wow fadeInUp' data-wow-delay='300ms'>
          <div className='row'>
            <div className='col-lg-6 m-auto'>
              <div className='main-title text-center'>
                <h2 className='title'>{data.title}</h2>
                <p className='paragraph mt10'>{data.subtitle}</p>
              </div>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col-xl-10 mx-auto'>
              <div className='home2_testimonial_tabs position-relative'>
                <div className='tab-content' id='pills-tabContent2'>
                  {data.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className={`tab-pane fade ${testimonial.active ? 'show active' : ''}`}
                      id={testimonial.id}
                      aria-labelledby={`${testimonial.id}-tab`}
                    >
                      <div className='testimonial-style2 at-about2 text-center'>
                        <div className='testi-content text-center'>
                          <span className='icon fas fa-quote-left' />
                          <h4 className='testi-text'>{testimonial.text}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <ul className='nav justify-content-center' id='pills-tab2'>
                  {data.testimonials.map((testimonial) => (
                    <li key={testimonial.id} className='nav-item'>
                      <a
                        className={`nav-link ${testimonial.active ? 'active' : ''}`}
                        id={`${testimonial.id}-tab`}
                        data-bs-toggle='pill'
                        href={`#${testimonial.id}`}
                      >
                        <div className='thumb d-flex align-items-center'>
                          <Image
                            height={70}
                            width={70}
                            className='rounded-circle h-100'
                            src={testimonial.author.image}
                            alt={testimonial.author.name}
                          />
                          <h6 className='title ml30 ml15-xl mb-0'>
                            {testimonial.author.name}
                            <br />
                            <small>{testimonial.author.category}</small>
                          </h6>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
