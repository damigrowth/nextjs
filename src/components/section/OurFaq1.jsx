export default function OurFaq1() {
  return (
    <>
      <section className="our-faqs pb50 ">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-6 m-auto">
              <div className="main-title text-center">
                <h2 className="title">Συχνές Ερωτήσεις</h2>
                <p className="paragraph mt10">
                Αν έχεις περισσότερες ερωτήσεις πήγαινε στη σελίδα <a href="/faq" className="text-decoration-underline">FAQ</a>.</p>
              </div>
            </div>
          </div>
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            <div className="col-lg-8 mx-auto">
              <div className="ui-content">
                <div className="accordion-style1 faq-page mb-4 mb-lg-5">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item active">
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                        >
                          Πώς μπορώ να εμφανίσω το προφίλ μου στην Doulitsa;
                        </button>
                      </h2>
                      <div
                        id="collapseOne"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingOne"
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                        Για να εγγραφείς ως επαγγελματίας και να προσφέρεις τις υπηρεσίες σου, ακολούθησε τις οδηγίες στη σελίδα 'Εγγραφή' αφού επιλέξεις "Επαγγελματικό Προφίλ". Θα είμαστε σε επικοινωνία για να σε βοηθήσουμε σε ό,τι χρειαστείς.

                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingTwo">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseTwo"
                          aria-expanded="false"
                          aria-controls="collapseTwo"
                        >
                          Υπάρχει χρέωση για την επικοινωνία με τους χρήστες;
                        </button>
                      </h2>
                      <div
                        id="collapseTwo"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingTwo"
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                        Όχι, η επικοινωνία μέσω της πλατφόρμας είναι δωρεάν και οι πληροφορίες είναι ελεύθερες. Οι οικονομικές λεπτομέρειες της συνεργασίας σας καθορίζονται από εσάς και κανονίζονται απευθείας με τον υποψήφιο πελάτη κατόπιν της επικοινωνίας σας.

                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseThree"
                          aria-expanded="false"
                          aria-controls="collapseThree"
                        >
                          Πώς μπορώ να διασφαλίσω την εγκυρότητα του προφίλ μου;
                        </button>
                      </h2>
                      <div
                        id="collapseThree"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                        Εάν θέλεις να αποκτήσεις το σήμα 'Πιστοποιημένος', θα πρέπει να δηλώσεις τον ΑΦΜ σου και τα στοιχεία σου για να επιβεβαιώσουμε ότι έχεις ενεργή επιχείρηση. Το σήμα αυτό παρέχει στους πελάτες περισσότερη ασφάλεια για την επαγγελματική σου αξιοπιστία.

                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingFour">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseFour"
                          aria-expanded="false"
                          aria-controls="collapseFour"
                        >
                          Πώς μπορώ να υποβάλω σχόλια ή προτάσεις για τη βελτίωση της πλατφόρμας;
                        </button>
                      </h2>
                      <div
                        id="collapseFour"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingFour"
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                        Εκτιμούμε τις προτάσεις και τα σχόλιά σου! Μπορείς να μας τα στείλεις μέσω email, και η ομάδα μας θα τα λάβει υπόψη για τη συνεχή βελτίωση της Doulitsa.

                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingFive">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseFive"
                          aria-expanded="false"
                          aria-controls="collapseFive"
                        >
                         Τι να κάνω αν χρειάζομαι τεχνική υποστήριξη με τον λογαριασμό μου;
                        </button>
                      </h2>
                      <div
                        id="collapseFive"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingFive"
                        data-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                        Αν αντιμετωπίζεις οποιοδήποτε τεχνικό πρόβλημα, μπορείς να επικοινωνήσεις με την ομάδα υποστήριξής μας μέσω email. Θα κάνουμε το καλύτερο δυνατό για να σε βοηθήσουμε άμεσα.

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
