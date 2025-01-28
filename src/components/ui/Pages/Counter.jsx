"use client";

import CountUp from "react-countup";

export default function Counter({ data }) {
  return (
    <section className="pb0 pt60">
      <div className={`container maxw1600 bdrb1 pb60`}>
        <div
          className="row justify-content-center wow fadeInUp"
          data-wow-delay="300ms"
        >
          {data.map((item, index) => (
            <div key={index} className="col-6 col-md-3">
              <div className="funfact_one mb20-sm text-center">
                <div className="details">
                  <ul className="ps-0 mb-0 d-flex justify-content-center">
                    <li>
                      <div className="timer">
                        <CountUp
                          decimals={0}
                          end={item.end}
                          duration={2.75}
                          enableScrollSpy
                        />
                      </div>
                    </li>
                    <li>
                      <span>{item.text}</span>
                    </li>
                  </ul>
                  <p className="text mb-0">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
