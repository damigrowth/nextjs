import { ContactForm } from '../form';

export default function Contact({ data }) {
  const { title, description, phone, email, form } = data;

  const siteKey = process.env.RECAPTCHA_SITE_KEY;

  return (
    <section className='pt-0'>
      <div className='container'>
        <div className='row wow fadeInUp' data-wow-delay='300ms'>
          <div className='col-lg-6'>
            <div className='position-relative mt40'>
              <div className='main-title'>
                <h4 className='form-title mb25'>{title}</h4>
                <p className='text'>{description}</p>
              </div>
              <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
                <div className='icon flex-shrink-0'>
                  <span className='flaticon-call' />
                </div>
                <div className='details'>
                  <h5 className='title'>{phone.title}</h5>
                  <p className='mb-0 text'>{phone.number}</p>
                </div>
              </div>
              <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
                <div className='icon flex-shrink-0'>
                  <span className='flaticon-mail' />
                </div>
                <div className='details'>
                  <h5 className='title'>{email.title}</h5>
                  <p className='mb-0 text'>{email.address}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='contact-page-form default-box-shadow1 bdrs8 bdr1 p50 mb30-md bgc-white'>
              <h4 className='form-title mb25'>{form.title}</h4>
              <p className='text mb30'>{form.description}</p>
              <ContactForm form={form} siteKey={siteKey} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
