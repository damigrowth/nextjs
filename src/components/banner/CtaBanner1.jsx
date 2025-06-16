'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function CtaBanner1() {
  const path = usePathname();

  return (
    <>
      <section className='p-0'>
        <div
          className={`cta-banner3 mx-auto maxw1600 pt120 pt60-lg pb90 pb60-lg position-relative overflow-hidden ${
            path === '/' || path === '/about-1'
              ? 'bgc-light-yellow'
              : path === '/become-seller'
                ? 'bgc-thm4'
                : ''
          }`}
        >
          <div className='container'>
            <div className='row'>
              <div className='col-xl-5 wow fadeInRight' data-wow-delay='300ms'>
                <div className='mb30'>
                  <div className='main-title'>
                    <h2 className='title'>
                      Έτοιμοι <br className='d-none d-xl-block' /> για νέες
                      συνεργασίες;
                    </h2>
                  </div>
                </div>
                <div className='why-chose-list'>
                  <div className='list-one d-flex align-items-start mb30'>
                    <span className='list-icon flex-shrink-0 flaticon-badge' />
                    <div className='list-content flex-grow-1 ml20'>
                      <h4 className='mb-1'>Εμφανίσου στους κορυφαίους</h4>
                      <p className='text mb-0 fz15'>
                        Συμπλήρωσε το επαγγελματικό προφίλ και τις υπηρεσίες που
                        προσφέρεις και εμφανίσου ανάμεσα στα κορυφαία
                        επαγγελματικά προφίλ.
                      </p>
                    </div>
                  </div>
                  <div className='list-one d-flex align-items-start mb30'>
                    <span className='list-icon flex-shrink-0 flaticon-wallet' />
                    <div className='list-content flex-grow-1 ml20'>
                      <h4 className='mb-1'>Χωρίς κρυφά κόστη</h4>
                      <p className='text mb-0 fz15'>
                        Δεν κρατάμε καμία προμήθεια και δεν έχουμε καμία χρέωση
                        για να εμφανίσεις το επαγγελματικό προφίλ και τις
                        υπηρεσίες που προσφέρεις.
                      </p>
                    </div>
                  </div>
                  <div className='list-one d-flex align-items-start mb30'>
                    <span className='list-icon flex-shrink-0 flaticon-security' />
                    <div className='list-content flex-grow-1 ml20'>
                      <h4 className='mb-1'>Ασφάλεια και Πιστοποίηση</h4>
                      <p className='text mb-0 fz15'>
                        Θεωρούμε την ασφάλεια ως τον πιο σημαντικό παράγοντα,
                        για αυτό προτείνουμε την πιστοποίηση του επαγγελματικού
                        προφίλ σας.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Image
            height={500}
            width={500}
            className='cta-banner3-img wow fadeInLeft h-100 object-fit-cover'
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750083636/Static/about-5_nmvx1j.webp'
            alt='cta banner 3'
            data-wow-delay='300ms'
          />
        </div>
      </section>
    </>
  );
}
