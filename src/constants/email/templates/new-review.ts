/**
 * New Review Email Template
 *
 * HTML template for notifying admin when a user submits a new review for moderation.
 */

export interface NewReviewData {
  reviewId: string;
  authorName: string;
  authorEmail: string;
  receiverName: string;
  receiverUsername: string;
  receiverEmail: string;
  rating: number;
  comment?: string | null;
  reviewType: 'PROFILE' | 'SERVICE';
  serviceName?: string | null;
}

export const NEW_REVIEW_HTML = (data: NewReviewData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Αξιολόγηση</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 0;">
          <table role="presentation" style="width: 602px; margin-top: 30px; margin-bottom: 30px; border-collapse: separate; border: 1px solid #cccccc; background-color: #ffffff; border-radius: 20px; overflow: hidden;">
            <tr>
              <td style="padding: 36px 30px 42px 30px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #153643;">
                      <h2 style="font-size: 20px; margin: 0 0 20px 0; font-family: Arial, sans-serif; color: #1f4c40;">Νέα Αξιολόγηση για ${data.receiverName}</h2>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Από:</strong> ${data.authorEmail}
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Πρός:</strong> ${data.receiverEmail}
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Αξιολόγηση:</strong> ${data.rating === 5 ? '&#128077; Θετική' : '&#128078; Αρνητική'}
                      </p>${data.comment ? `
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Σχόλιο:</strong> "${data.comment}"
                      </p>` : ''}${data.serviceName ? `
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Υπηρεσία:</strong> ${data.serviceName}
                      </p>` : ''}
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <a href="https://doulitsa.gr/admin/reviews/${data.reviewId}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px 10px 10px 0; font-weight: 700;">
                        Προβολή Αξιολόγησης
                      </a>
                      <a href="https://doulitsa.gr/admin/reviews" style="background: #ffffff; color: #1f4c40; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px; font-weight: 700; border: 2px solid #1f4c40;">
                        Διαχείριση Αξιολογήσεων
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; background: #000;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0; width: 50%;" align="left">
                      <p style="margin: 0; font-size: 14px; line-height: 16px; font-family: Arial, sans-serif; color: #ffffff;">
                        &reg; Doulitsa, 2025 <br />
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const NEW_REVIEW_TEXT = (data: NewReviewData): string => `
ΝΕΑ ΑΞΙΟΛΟΓΗΣΗ ΓΙΑ ${data.receiverName.toUpperCase()}

Από: ${data.authorEmail}
Πρός: ${data.receiverEmail}
Αξιολόγηση: ${data.rating === 5 ? '👍 Θετική' : '👎 Αρνητική'}${data.comment ? `
Σχόλιο: "${data.comment}"` : ''}${data.serviceName ? `
Υπηρεσία: ${data.serviceName}` : ''}

---

Προβολή Αξιολόγησης:
https://doulitsa.gr/admin/reviews/${data.reviewId}

Διαχείριση Αξιολογήσεων:
https://doulitsa.gr/admin/reviews

---
© Doulitsa, 2025
`;
