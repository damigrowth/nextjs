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

/**
 * Cancel a recurring subscription via Direct XML API.
 */
export async function cancelRecurring(params: XmlCancelRecurringParams): Promise<XmlResponse> {
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
        RecurringOperationRequest: {
          Authentication: {
            Mid: config.mid,
          },
          Operation: 'Cancel',
          TransactionInfo: {
            OrderId: params.orderId,
          },
        },
      },
    },
  };

  const xmlBody = xmlBuilder.build(messageContent);
  const messageXml = xmlBody.match(/<Message.*?<\/Message>/s)?.[0] || '';
  const digest = calculateXmlDigest(messageXml, config.sharedSecret);

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
  const opResponse = message?.RecurringOperationResponse || message?.ErrorResponse;

  return {
    status: opResponse?.Status || 'ERROR',
    message: opResponse?.Message || opResponse?.ErrorMessage,
  };
}
