import React from "react";

export default function Features({
  minBudget,
  size,
  contactTypes,
  payment_methods,
  settlement_methods,
}) {
  return (
    <>
      <div className="row mt60">
        {contactTypes.length > 0 && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-chat" />
              </div>
              <div className="details">
                <h5 className="title">Επικοινωνία</h5>
                <div className="freelancer-features-list">
                  {contactTypes.map((type, i) => (
                    <p key={i} className="freelancer-features-list-item">
                      {type?.attributes?.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {payment_methods.length > 0 && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-income" />
              </div>
              <div className="details">
                <h5 className="title">Τρόποι Πληρωμής</h5>
                <div className="freelancer-features-list">
                  {payment_methods.map((method, i) => (
                    <p key={i} className="freelancer-features-list-item">
                      {method?.attributes?.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {settlement_methods.length > 0 && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-antivirus" />
              </div>
              <div className="details">
                <h5 className="title">Μέθοδος Εξόφλησης</h5>
                {settlement_methods.map((method, i) => (
                  <p key={i} className="freelancer-features-list-item">
                    {method?.attributes?.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {size?.label && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-photo" />
              </div>
              <div className="details">
                <h5 className="title">Αριθμός Εργαζομένων</h5>
                <p className="mb-0 text">{size.label}</p>
              </div>
            </div>
          </div>
        )}

        {minBudget && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-wallet" />
              </div>
              <div className="details">
                <h5 className="title">Ελάχιστο Budget</h5>
                <p className="mb-0 text">{minBudget?.attributes?.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
