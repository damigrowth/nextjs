import { createHash } from 'crypto';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { getWorldlineConfig } from '../../worldline-config';

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true,
});

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  ignoreDeclaration: true,
});

interface XmlSaleParams {
  orderId: string;
  amount: string;
  currency: string;
  email: string;
  token: string;
  recurringFrequency: string;
  recurringEndDate: string;
}

interface XmlCancelRecurringParams {
  orderId: string;
}

export interface XmlResponse {
  status: string;
  message?: string;
  txId?: string;
  paymentRef?: string;
  orderAmount?: string;
}

/**
 * Calculate digest for XML API v2.1.
 * Algorithm: Base64(SHA256(canonicalized Message XML + sharedSecret))
 */
function calculateXmlDigest(messageXml: string, sharedSecret: string): string {
  return createHash('sha256')
    .update(messageXml + sharedSecret, 'utf8')
    .digest('base64');
}

/**
 * Execute a recurring charge using a stored token (no user interaction).
 * Uses Direct XML API v2.1 with SaleRequest.
 */
export async function executeRecurringCharge(params: XmlSaleParams): Promise<XmlResponse> {
  const config = getWorldlineConfig();

  if (!config.mid || !config.sharedSecret) {
    throw new Error('Worldline not configured: missing MID or shared secret');
  }

  const messageId = `m${Date.now()}`;
  const timestamp = new Date().toISOString();

  const messageContent = {
    VPOS: {
      Message: {
        '@_version': '2.1',
        '@_messageId': messageId,
        '@_timeStamp': timestamp,
        SaleRequest: {
          Authentication: {
            Mid: config.mid,
          },
          OrderInfo: {
            OrderId: params.orderId,
            OrderAmount: params.amount,
            Currency: params.currency,
            PayerEmail: params.email,
          },
          PaymentInfo: {
            ExtToken: params.token,
            RecurringIndicator: 'R',
            RecurringParameters: {
              ExtRecurringfrequency: params.recurringFrequency,
              ExtRecurringenddate: params.recurringEndDate,
            },
          },
        },
      },
    },
  };

  const xmlBody = xmlBuilder.build(messageContent);

  // Calculate digest over the Message element content
  const messageXml = xmlBody.match(/<Message.*?<\/Message>/s)?.[0] || '';
  const digest = calculateXmlDigest(messageXml, config.sharedSecret);

  // Add digest to the XML
  const finalContent = {
    VPOS: {
      ...messageContent.VPOS,
      Digest: digest,
    },
  };

  const finalXml = xmlBuilder.build(finalContent);

  const response = await fetch(config.xmlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: finalXml,
  });

  if (!response.ok) {
    throw new Error(`Worldline XML API returned ${response.status}: ${response.statusText}`);
  }

  const responseText = await response.text();
  const parsed = xmlParser.parse(responseText);
  const message = parsed?.VPOS?.Message;

  if (!message) {
    throw new Error('Invalid XML response from Worldline');
  }

  const saleResponse = message.SaleResponse || message.ErrorResponse;

  return {
    status: saleResponse?.Status || 'ERROR',
    message: saleResponse?.Message || saleResponse?.ErrorMessage,
    txId: saleResponse?.TxId,
    paymentRef: saleResponse?.PaymentRef,
    orderAmount: saleResponse?.OrderAmount,
  };
}

const VPOS_NS = 'http://www.modirum.com/schemas/vposxmlapi41';
const XMLDSIG_NS = 'http://www.w3.org/2000/09/xmldsig#';

/**
 * Cancel a scheduled recurring subscription via Direct XML API.
 *
 * Uses manual XML string building (not fast-xml-parser) for precise control over:
 * - XML namespace placement (required on VPOS element and canonicalized Message)
 * - Element ordering (TransactionInfo before Operation, per Cardlink docs)
 * - Attribute ordering in canonicalized form (xmlns, xmlns:ns2, messageId, timeStamp, version)
 */
export async function cancelRecurring(params: XmlCancelRecurringParams): Promise<XmlResponse> {
  const config = getWorldlineConfig();

  if (!config.mid || !config.sharedSecret) {
    throw new Error('Worldline not configured: missing MID or shared secret');
  }

  const messageId = `M${Date.now()}`;
  const timestamp = formatTimestampWithOffset(new Date());

  // Canonicalized Message XML — namespaces ON the Message tag, attributes in canonical order
  const canonicalMessageXml =
    `<Message xmlns="${VPOS_NS}" xmlns:ns2="${XMLDSIG_NS}" messageId="${messageId}" timeStamp="${timestamp}" version="2.1">` +
    `<RecurringOperationRequest>` +
    `<Authentication><Mid>${config.mid}</Mid></Authentication>` +
    `<TransactionInfo><OrderId>${params.orderId}</OrderId></TransactionInfo>` +
    `<Operation>Cancel</Operation>` +
    `</RecurringOperationRequest>` +
    `</Message>`;

  const digest = calculateXmlDigest(canonicalMessageXml, config.sharedSecret);

  // Final XML — namespaces on VPOS element (not on Message)
  const finalXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<VPOS xmlns="${VPOS_NS}" xmlns:ns2="${XMLDSIG_NS}">` +
    `<Message version="2.1" messageId="${messageId}" timeStamp="${timestamp}">` +
    `<RecurringOperationRequest>` +
    `<Authentication><Mid>${config.mid}</Mid></Authentication>` +
    `<TransactionInfo><OrderId>${params.orderId}</OrderId></TransactionInfo>` +
    `<Operation>Cancel</Operation>` +
    `</RecurringOperationRequest>` +
    `</Message>` +
    `<Digest>${digest}</Digest>` +
    `</VPOS>`;

  const response = await fetch(config.xmlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: finalXml,
  });

  if (!response.ok) {
    throw new Error(`Worldline XML API returned ${response.status}: ${response.statusText}`);
  }

  const responseText = await response.text();
  const parsed = xmlParser.parse(responseText);
  const message = parsed?.VPOS?.Message;
  const opResponse = message?.RecurringOperationResponse || message?.ErrorResponse;

  return {
    status: opResponse?.Status || 'ERROR',
    message: opResponse?.Message || opResponse?.ErrorMessage || opResponse?.Description,
    txId: opResponse?.TxId,
  };
}

/**
 * Format a Date as ISO 8601 with timezone offset (e.g. 2024-11-05T18:09:34.343+02:00).
 * Cardlink requires this format, not UTC 'Z' suffix.
 */
function formatTimestampWithOffset(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}` +
    `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`
  );
}
