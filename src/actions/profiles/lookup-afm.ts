'use server';

import { ActionResult } from '@/lib/types/api';
import { requireAuth } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';

const AADE_ENDPOINT = 'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2';

export interface AfmLookupData {
  onomasia: string;
  doy_descr: string;
  firm_act_descr: string;
  postal_address: string;
  postal_address_no: string;
  postal_zip_code: string;
  postal_area_description: string;
}

/**
 * Look up Greek tax registry data by AFM (VAT number).
 * Calls the AADE RgWsPublic2 SOAP 1.2 API (WithOUTAsOnDate method)
 * with WS-Security UsernameToken authentication.
 */
export async function lookupAfm(afm: string): Promise<ActionResult<AfmLookupData>> {
  try {
    await requireAuth();

    if (!afm || afm.length !== 9 || !/^\d{9}$/.test(afm)) {
      return { success: false, error: 'Μη έγκυρο ΑΦΜ' };
    }

    const username = process.env.AADE_USERNAME;
    const password = process.env.AADE_PASSWORD;

    if (!username || !password) {
      return { success: false, error: 'Σφάλμα διαμόρφωσης AADE' };
    }

    // SOAP 1.2 with WS-Security UsernameToken in the header (as per AADE docs v1.1)
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope
  xmlns:env="http://www.w3.org/2003/05/soap-envelope"
  xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
  xmlns:ns2="http://rgwspublic2/RgWsPublic2Service"
  xmlns:ns3="http://rgwspublic2/RgWsPublic2">
  <env:Header>
    <ns1:Security>
      <ns1:UsernameToken>
        <ns1:Username>${username}</ns1:Username>
        <ns1:Password>${password}</ns1:Password>
      </ns1:UsernameToken>
    </ns1:Security>
  </env:Header>
  <env:Body>
    <ns2:rgWsPublic2AfmMethod>
      <ns2:INPUT_REC>
        <ns3:afm_called_by/>
        <ns3:afm_called_for>${afm}</ns3:afm_called_for>
      </ns2:INPUT_REC>
    </ns2:rgWsPublic2AfmMethod>
  </env:Body>
</env:Envelope>`;

    const response = await fetch(AADE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
      },
      body: soapEnvelope,
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[AADE] HTTP error:', response.status, body);
      return { success: false, error: 'Σφάλμα σύνδεσης με AADE' };
    }

    const xml = await response.text();

    // Extract text from an XML tag; returns '' for nil elements
    const get = (tag: string): string => {
      const nilMatch = xml.match(new RegExp(`<${tag}[^>]*xsi:nil="true"[^>]*/?>`, 'i'));
      if (nilMatch) return '';
      const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const errorCode = get('error_code');
    if (errorCode && errorCode !== '0') {
      const errorDescr = get('error_descr');
      console.error('[AADE] error_code:', errorCode, '| error_descr:', errorDescr);
      return { success: false, error: errorDescr || 'ΑΦΜ δεν βρέθηκε' };
    }

    const onomasia = get('onomasia');
    if (!onomasia) {
      return { success: false, error: 'ΑΦΜ δεν βρέθηκε' };
    }

    return {
      success: true,
      data: {
        onomasia,
        doy_descr: get('doy_descr'),
        firm_act_descr: get('firm_act_descr'),
        postal_address: get('postal_address'),
        postal_address_no: get('postal_address_no'),
        postal_zip_code: get('postal_zip_code'),
        postal_area_description: get('postal_area_description'),
      },
    };
  } catch (error) {
    console.error('[AADE] Exception:', error);
    const handled = handleBetterAuthError(error);
    return { success: false, error: handled.message };
  }
}
