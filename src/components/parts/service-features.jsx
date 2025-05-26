import React from 'react';

export default function Features({
  contactTypes,
  payment_methods,
  settlement_methods,
}) {
  return (
    <div className='row mt50'>
      {contactTypes.length > 0 && (
        <div className='col-sm-6 col-xl-4'>
          <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
            <div className='icon flex-shrink-0'>
              <span className='flaticon-chat' />
            </div>
            <div className='details'>
              <h5 className='title'>Επικοινωνία</h5>
              <div className='freelancer-features-list'>
                {contactTypes.map((type, i) => (
                  <p key={i} className='freelancer-features-list-item'>
                    {type?.attributes?.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {payment_methods.length > 0 && (
        <div className='col-sm-6 col-xl-4'>
          <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
            <div className='icon flex-shrink-0'>
              <span className='flaticon-income' />
            </div>
            <div className='details'>
              <h5 className='title'>Τρόποι Πληρωμής</h5>
              <div className='freelancer-features-list'>
                {payment_methods.map((method, i) => (
                  <p key={i} className='freelancer-features-list-item'>
                    {method?.attributes?.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {settlement_methods.length > 0 && (
        <div className='col-sm-6 col-xl-4'>
          <div className='iconbox-style1 contact-style d-flex align-items-start mb30'>
            <div className='icon flex-shrink-0'>
              <span className='flaticon-antivirus' />
            </div>
            <div className='details'>
              <h5 className='title'>Μέθοδος Εξόφλησης</h5>
              <div className='freelancer-features-list'>
                {settlement_methods.map((method, i) => (
                  <p key={i} className='freelancer-features-list-item'>
                    {method?.attributes?.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
