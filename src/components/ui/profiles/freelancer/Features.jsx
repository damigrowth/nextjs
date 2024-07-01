import React from "react";

export default function Features({
  minBudgets,
  size,
  contactTypes,
  payment_methods,
  settlement_methods,
}) {
  const sizeNumber = Number(size?.slug);

  // Function to find the smallest budget
  const getSmallestBudget = (budgets) => {
    if (!budgets || budgets.length === 0) return null;
    return budgets.reduce((min, budget) =>
      budget.attributes.value < min.attributes.value ? budget : min
    );
  };

  const smallestBudget = getSmallestBudget(minBudgets);

  return (
    <>
      <div className="row">
        {(minBudgets.length > 0 ||
          size ||
          settlement_methods.length > 0 ||
          contactTypes.length > 0 ||
          payment_methods.length > 0) && (
          <hr className="opacity-100 mb60 mt60" />
        )}
        {minBudgets.length > 0 && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-wallet" />
              </div>
              <div className="details">
                <h5 className="title">Ελάχιστο Budget</h5>
                <p className="mb-0 text">{smallestBudget?.attributes?.label}</p>
              </div>
            </div>
          </div>
        )}
        {sizeNumber > 1 && (
          <div className="col-sm-6 col-xl-4">
            <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
              <div className="icon flex-shrink-0">
                <span className="flaticon-photo" />
              </div>
              <div className="details">
                <h5 className="title">Εργαζόμενοι</h5>
                <p className="mb-0 text">{size?.label}</p>
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
                  <p key={i} className="mb-0 text list-inline-item">
                    {method?.attributes?.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
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
      </div>
    </>
  );
}
