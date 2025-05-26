import Cookies from 'js-cookie';

// lib/cookies/cookieConsent.js
export const COOKIE_CONSENT_KEY = 'cookie-consent-preferences';

export const CookieCategories = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PREFERENCES: 'preferences',
};

export const getConsentDefaults = () => ({
  [CookieCategories.NECESSARY]: true, // Always true as these are required
  [CookieCategories.ANALYTICS]: false,
  [CookieCategories.MARKETING]: false,
  [CookieCategories.PREFERENCES]: false,
  lastUpdated: new Date().toISOString(),
});

export const getCookieConsent = () => {
  const consent = Cookies.get(COOKIE_CONSENT_KEY);

  return consent ? JSON.parse(consent) : null;
};

export const setCookieConsent = (preferences) => {
  const updatedPreferences = {
    ...preferences,
    lastUpdated: new Date().toISOString(),
  };

  // Set cookie to expire in 6 months
  Cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(updatedPreferences), {
    expires: 180,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });
  // Apply or remove cookies based on preferences
  applyConsentPreferences(updatedPreferences);
};

const applyConsentPreferences = (preferences) => {
  // Example: Handle Google Analytics
  if (!preferences[CookieCategories.ANALYTICS]) {
    removeAnalyticsCookies();
  }
  // Example: Handle Marketing cookies
  if (!preferences[CookieCategories.MARKETING]) {
    removeMarketingCookies();
  }
};

const removeAnalyticsCookies = () => {
  // Remove Google Analytics cookies
  const gaCookies = document.cookie
    .split('; ')
    .filter((c) => c.startsWith('_ga'));

  gaCookies.forEach((cookie) => {
    const name = cookie.split('=')[0];

    Cookies.remove(name, { path: '/' });
  });
};

const removeMarketingCookies = () => {
  // Remove marketing related cookies
  const marketingCookies = ['_fbp', '_gcl_au']; // Add your marketing cookie names

  marketingCookies.forEach((name) => {
    Cookies.remove(name, { path: '/' });
  });
};
