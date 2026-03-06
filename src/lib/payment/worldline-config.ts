/**
 * Worldline/Cardlink Configuration
 *
 * Automatically selects sandbox or production credentials based on PAYMENTS_TEST_MODE.
 *
 * Environment Variables Required:
 * - Sandbox (PAYMENTS_TEST_MODE=true):
 *   - WORLDLINE_TEST_MID
 *   - WORLDLINE_TEST_SHARED_SECRET
 *
 * - Production (PAYMENTS_TEST_MODE=false):
 *   - WORLDLINE_LIVE_MID
 *   - WORLDLINE_LIVE_SHARED_SECRET
 */

import { isPaymentsTestMode } from './test-mode';

// Worldline/Cardlink endpoints (Worldline = eurocommerce)
const ENDPOINTS = {
  sandbox: {
    redirect: 'https://eurocommerce-test.cardlink.gr/vpos/shophandlermpi',
    xml: 'https://eurocommerce-test.cardlink.gr/vpos/xmlpayvpos',
  },
  production: {
    redirect: 'https://eurocommerce.cardlink.gr/vpos/shophandlermpi',
    xml: 'https://eurocommerce.cardlink.gr/vpos/xmlpayvpos',
  },
} as const;

export interface WorldlineConfig {
  mid: string | undefined;
  sharedSecret: string | undefined;
  redirectUrl: string;
  xmlUrl: string;
  isTestMode: boolean;
}

export function getWorldlineConfig(): WorldlineConfig {
  const testMode = isPaymentsTestMode();

  if (testMode) {
    return {
      mid: process.env.WORLDLINE_TEST_MID,
      sharedSecret: process.env.WORLDLINE_TEST_SHARED_SECRET,
      redirectUrl: ENDPOINTS.sandbox.redirect,
      xmlUrl: ENDPOINTS.sandbox.xml,
      isTestMode: true,
    };
  }

  return {
    mid: process.env.WORLDLINE_LIVE_MID,
    sharedSecret: process.env.WORLDLINE_LIVE_SHARED_SECRET,
    redirectUrl: ENDPOINTS.production.redirect,
    xmlUrl: ENDPOINTS.production.xml,
    isTestMode: false,
  };
}

export function getWorldlineMid(): string | undefined {
  return getWorldlineConfig().mid;
}

export function getWorldlineSharedSecret(): string | undefined {
  return getWorldlineConfig().sharedSecret;
}

export function getWorldlineRedirectUrl(): string {
  return getWorldlineConfig().redirectUrl;
}

export function getWorldlineXmlUrl(): string {
  return getWorldlineConfig().xmlUrl;
}
