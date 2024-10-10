"use client";

export default function PlanCard({ data }) {
  return (
    <div
      className={`pricing_packages text-center bdrs16 at-home2 ${
        data.isActive ? "active" : ""
      } `}
    >
      <div className="heading mb10">
        {data.price === "1m" && (
          <h1 className="text2">
            ${data.monthlyPrice} <small>/ monthly</small>
          </h1>
        )}

        {data.price === "1y" && (
          <h1 className="text1">
            ${data.yearlyPrice} <small>/ yearly</small>
          </h1>
        )}

        <h4 className="package_title mt-2">{data.plan}</h4>
      </div>
      <div className="details">
        <p className="text mb30">{data.description}</p>
        <div className="pricing-list mb40">
          <ul className="px-0">
            {data.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="d-grid">
          <a className="ud-btn btn-light-thm">
            Buy Now
            <i className="fal fa-arrow-right-long" />
          </a>
        </div>
      </div>
    </div>
  );
}
