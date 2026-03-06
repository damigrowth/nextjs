import { NextRequest, NextResponse } from 'next/server';
import { getWorldlineRedirectUrl } from '@/lib/payment/worldline-config';

/**
 * Auto-submit redirect to Cardlink payment page.
 *
 * Receives encoded payment params as a query parameter,
 * renders an HTML page that auto-submits a form POST to Cardlink.
 *
 * This is necessary because Cardlink's redirect integration requires
 * form POST (not GET redirect like Stripe Checkout).
 */
export async function GET(request: NextRequest) {
  const encodedParams = request.nextUrl.searchParams.get('session');

  if (!encodedParams) {
    return NextResponse.json({ error: 'Missing session parameter' }, { status: 400 });
  }

  let params: Record<string, string>;
  try {
    params = JSON.parse(Buffer.from(encodedParams, 'base64url').toString('utf-8'));
  } catch {
    return NextResponse.json({ error: 'Invalid session parameter' }, { status: 400 });
  }

  const actionUrl = getWorldlineRedirectUrl();

  // Build hidden form fields
  const fields = Object.entries(params)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(String(value))}" />`)
    .join('\n      ');

  const html = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ανακατεύθυνση στην πληρωμή...</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f9fafb;
      color: #374151;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    noscript { color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Ανακατεύθυνση στη σελίδα πληρωμής...</p>
    <noscript>
      <p>Η JavaScript πρέπει να είναι ενεργοποιημένη. Πατήστε το κουμπί παρακάτω.</p>
      <form method="POST" action="${escapeHtml(actionUrl)}">
        ${fields}
        <button type="submit">Συνέχεια στην πληρωμή</button>
      </form>
    </noscript>
  </div>
  <form id="paymentForm" method="POST" action="${escapeHtml(actionUrl)}" style="display:none;">
    ${fields}
  </form>
  <script>document.getElementById('paymentForm').submit();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
