import LinkNP from '@/components/link';
import { ArrowRightLong } from '@/components/icon/fa';

export default function AboutArea1() {
  return (
    <section className='our-faq pb90 pt100'>
      <div className='container'>
        <div className='row wow fadeInUp'>
          <div className='col-lg-4'>
            <div className='vertical-tab'>
              <div className='widget_list'>
                <nav>
                  <div className='nav flex-column nav-tabs text-start'>
                    <button
                      className='nav-link active text-start'
                      data-bs-toggle='tab'
                      data-bs-target='#nav-accountpayment'
                    >
                      <span>Για Επαγγελματίες</span>
                    </button>
                    <button
                      className='nav-link text-start'
                      data-bs-toggle='tab'
                      data-bs-target='#nav-manageother'
                    >
                      <span>Για Επιχειρήσεις</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
          <div className='col-lg-8'>
            <div className='tab-content' id='nav-tabContent'>
              <div
                className='tab-pane fade show active'
                id='nav-accountpayment'
                aria-labelledby='nav-accountpayment-tab'
              >
                <div className='for-hire'>
                  <h4>Για Επαγγελματίες</h4>
                  <p className='text mb30'>
                    Εάν είσαι Επαγγελματίας και θέλεις να προβληθείς στην
                    πλατφόρμα μας, μπορείς να κάνεις Εγγραφή ως Επαγγελματίας
                    και να δημιουργήσεις το προφίλ σου εύκολα και γρήγορα.
                  </p>
                  <p className='text mb40'>
                    Μπορείς να αναρτήσεις όλες τις υπηρεσίες που προσφέρεις για
                    να σε βρουν νέοι πελάτες που ψάχνουν υπηρεσίες σαν τις δικές
                    σου.
                  </p>
                  <LinkNP
                    href='/register#pro'
                    className='ud-btn btn-thm mb25 me-4'
                  >
                    Εγγραφή Επαγγελματία
                    <ArrowRightLong />
                  </LinkNP>
                </div>
              </div>
              <div
                className='tab-pane fade'
                id='nav-manageother'
                aria-labelledby='nav-manageother-tab'
              >
                <div className='for-hire'>
                  <h4>Για Επιχειρήσεις</h4>
                  <p className='text mb30'>
                    Εάν είστε Επιχείρηση που προσφέρει υπηρεσίες, μπορείτε να
                    κάνετε Εγγραφή ως Επιχείρηση και να δημιουργήσετε το προφίλ
                    της Επιχείρησης σας εύκολα και γρήγορα.
                  </p>
                  <p className='text mb40'>
                    Μπορείτε να αναρτήσετε όλες τις υπηρεσίες που προσφέρετε για
                    να σας βρουν νέοι πελάτες που ψάχνουν υπηρεσίες σαν τις
                    δικές σας.
                  </p>
                  <LinkNP
                    href='/register#pro'
                    className='ud-btn btn-thm mb25 me-4'
                  >
                    Εγγραφή Επιχείρησης
                    <ArrowRightLong />
                  </LinkNP>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
