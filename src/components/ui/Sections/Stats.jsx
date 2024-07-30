import Testimonials from "./Testimonials";
import Counter from "../Counters/Counter";

export default function Stats() {
  return (
    <>
      <section className="bgc-thm3">
        <div className="container">
          <div className="row align-items-md-center">
            <div
              className="col-md-6 col-lg-8 mb30-md wow fadeInUp"
              data-wow-delay="100ms"
            >
              <div className="main-title">
                <h2 className="title">Βρείτε αξιόλογους επαγγελματίες</h2>
                <p className="paragraph">
                  Η Doulitsa επιβραβεύει και ξεχωρίζει τους καλύτερους
                  επαγγελματίες, γιατί θέλουμε να μένουν όλοι ικανοποιημένοι.
                </p>
              </div>
              <div className="row">
                <div className="col-sm-6 col-lg-4">
                  <div className="funfact_one">
                    <div className="details">
                      <ul className="ps-0 d-flex mb-0">
                        <li>
                          <div className="timer">
                            <Counter
                              decimals={1}
                              end={4.9}
                              duration={2.75}
                              enableScrollSpy
                            />
                          </div>
                        </li>
                        <li>
                          <span>/</span>
                        </li>
                        <li>
                          <div className="timer">
                            <Counter end={5} duration={5} enableScrollSpy />
                          </div>
                        </li>
                      </ul>
                      <p className="text mb-0">
                        Οι top επαγγελματίες έχουν λάβει τις καλύτερες
                        αξιολογήσεις
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                  <div className="funfact_one">
                    <div className="details">
                      <ul className="ps-0 d-flex mb-0">
                        <li>
                          <div className="timer">
                            <Counter end={99} duration={2.75} enableScrollSpy />
                          </div>
                        </li>
                        <li>
                          <span>% εγγύηση</span>
                        </li>
                      </ul>
                      <p className="text mb-0">
                        Επιβεβαιώνουμε ότι οι επαγγελματίες είναι πραγματικοί,
                        ώστε να μην πέσετε θύμα εξαπάτησης
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                  <div className="funfact_one">
                    <div className="details">
                      <h2>Μας προτείνουν</h2>
                      <p className="text mb-0">
                        Έχουμε συνεργασίες με εταιρείες, οι οποίες μας επιλέγουν
                        από τον 1ο χρόνο λειτουργίας μας.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Testimonials />
          </div>
        </div>
      </section>
    </>
  );
}
