'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  CookieCategories,
  getConsentDefaults,
  getCookieConsent,
  setCookieConsent,
} from '@/actions/shared/cookies';

export default function CookiesBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(getConsentDefaults());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer cookie banner initialization to not block LCP
    const initializeCookieBanner = () => {
      const existingConsent = getCookieConsent();

      if (!existingConsent) {
        // Use requestIdleCallback to further defer non-critical rendering
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setShowBanner(true);
            setMounted(true);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            setShowBanner(true);
            setMounted(true);
          }, 100);
        }
      } else {
        setPreferences(existingConsent);
        setMounted(true);
      }
    };

    // Wait for the page to be fully loaded before showing cookie banner
    if (document.readyState === 'complete') {
      initializeCookieBanner();
    } else {
      window.addEventListener('load', initializeCookieBanner);
      return () => window.removeEventListener('load', initializeCookieBanner);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = Object.keys(preferences).reduce((acc, key) => {
      if (key !== 'lastUpdated') acc[key] = true;

      return acc;
    }, {});

    setCookieConsent(allAccepted);
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    setCookieConsent(getConsentDefaults());
    setPreferences(getConsentDefaults());
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleToggleCategory = (category) => {
    if (category === CookieCategories.NECESSARY) return;
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Don't render until mounted and needed
  if (!mounted || (!showBanner && !showPreferences)) return null;

  const bannerContent = (
    <>
      {/* Main Banner - Simplified Design */}
      {showBanner && !showPreferences && (
        <div
          className='cookie-banner-wrapper cookies-banner'
          style={{
            // Use contain to optimize rendering
            contain: 'layout style paint',
          }}
        >
          <div className='d-flex justify-content-between align-items-start mb-3'>
            <h6 className='mb-0'>Αποδοχή Cookies</h6>
            <button
              className='btn-close'
              onClick={() => setShowBanner(false)}
              style={{ padding: '0', background: 'none', border: 'none' }}
              aria-label='Κλείσιμο banner cookies'
            >
              <i className='fal fa-xmark'></i>
            </button>
          </div>
          <p className='small mb-3' style={{ fontSize: '13px', color: '#666' }}>
            Χρησιμοποιούμε cookies για να σου προσφέρουμε μια καλύτερη
            προσωποποιημένη εμπειρία και να σε βοηθήσουμε να βρεις εύκολα αυτό
            που ψάχνεις.
            <Link href='/privacy' className='text-decoration-none ms-1'>
              Πολιτική Απορρήτου
            </Link>
            .
          </p>
          <div className='d-flex justify-content-between gap-2'>
            <button
              className='ud-btn btn-dark-border add-joining'
              data-bs-toggle='modal'
              data-bs-target='#cookieModal'
              style={{ flex: 1 }}
            >
              Προσαρμογή
            </button>
            <button
              className='ud-btn btn-thm2 add-joining'
              onClick={handleAcceptAll}
              style={{ flex: 1 }}
            >
              Αποδοχή Όλων
            </button>
          </div>
        </div>
      )}
      {/* Preferences Modal */}
      <div
        className='modal fade'
        id='cookieModal'
        aria-hidden='true'
        aria-labelledby='cookieModalLabel'
      >
        <div className='modal-dialog modal-lg'>
          <div className='modal-content bg-light bdrs10'>
            <div className='modal-header'>
              <h4 className='modal-title'>Προτιμήσεις Cookies</h4>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              >
                {/* <i className="fal fa-xmark" /> */}
              </button>
            </div>
            <div className='modal-body'>
              <div className='cookie-preferences'>
                {/* Necessary Cookies */}
                <div className='mb-4'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div>
                      <h6 className='mb-1'>Απαραίτητα Cookies</h6>
                      <p className='text-muted small mb-0'>
                        Απαιτούνται για τη σωστή λειτουργία του ιστότοπου.
                      </p>
                    </div>
                    <div className='form-check form-switch'>
                      <div className='switch-style1'>
                        <input
                          className='form-check-input mt-0'
                          type='checkbox'
                          checked={true}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Analytics Cookies */}
                <div className='mb-4'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div>
                      <h6 className='mb-1'>Cookies Ανάλυσης</h6>
                      <p className='text-muted small mb-0'>
                        Μας βοηθούν να βελτιώσουμε τον ιστότοπο συλλέγοντας
                        ανώνυμα δεδομένα χρήσης.
                      </p>
                    </div>
                    <div className='form-check form-switch'>
                      <div className='switch-style1'>
                        <input
                          className='form-check-input mt-0'
                          type='checkbox'
                          checked={preferences[CookieCategories.ANALYTICS]}
                          onChange={() =>
                            handleToggleCategory(CookieCategories.ANALYTICS)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Marketing Cookies */}
                <div className='mb-4'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div>
                      <h6 className='mb-1'>Cookies Marketing</h6>
                      <p className='text-muted small mb-0'>
                        Χρησιμοποιούνται για την προβολή εξατομικευμένων
                        διαφημίσεων.
                      </p>
                    </div>
                    <div className='form-check form-switch'>
                      <div className='switch-style1'>
                        <input
                          className='form-check-input mt-0'
                          type='checkbox'
                          checked={preferences[CookieCategories.MARKETING]}
                          onChange={() =>
                            handleToggleCategory(CookieCategories.MARKETING)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Preference Cookies */}
                <div className='mb-4'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div>
                      <h6 className='mb-1'>Cookies Προτιμήσεων</h6>
                      <p className='text-muted small mb-0'>
                        Απομνημονεύουν τις ρυθμίσεις και τις προτιμήσεις σας.
                      </p>
                    </div>
                    <div className='form-check form-switch'>
                      <div className='switch-style1'>
                        <input
                          className='form-check-input mt-0'
                          type='checkbox'
                          checked={preferences[CookieCategories.PREFERENCES]}
                          onChange={() =>
                            handleToggleCategory(CookieCategories.PREFERENCES)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                className='ud-btn btn-white add-joining'
                type='button'
                data-bs-dismiss='modal'
              >
                Ακύρωση
              </button>
              <button
                className='ud-btn btn-thm2 add-joining'
                type='button'
                onClick={handleSavePreferences}
                data-bs-dismiss='modal'
              >
                Αποθήκευση Προτιμήσεων
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at the end of body to avoid blocking LCP
  return typeof window !== 'undefined'
    ? createPortal(bannerContent, document.body)
    : null;
}
