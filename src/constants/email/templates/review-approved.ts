/**
 * Review Approved Email Template
 *
 * HTML template for notifying profile owner when their review is approved by admin.
 * If the review has a comment, includes the comment and a message prompting the owner
 * to approve it for public display.
 */

export interface ReviewApprovedData {
  profileOwnerName: string;
  profileOwnerEmail: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  serviceName?: string | null;
  dashboardUrl: string;
}

export const REVIEW_APPROVED_HTML = (data: ReviewApprovedData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Αξιολόγηση!</title>
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
                    <td style="color: #153643; text-align: center;">
                      <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #1f4c40;">Νέα Αξιολόγηση!</h1>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Έλαβες μία ${data.rating === 5 ? '&#128077; θετική' : '&#128078; αρνητική'} αξιολόγηση
                      </p>${data.serviceName ? `
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        για την υπηρεσία <strong>${data.serviceName}</strong>
                      </p>` : ''}${data.comment ? `
                      <p style="margin: 20px 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333; font-style: italic;">
                        "${data.comment}"
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #666;">
                        Συνδεθείτε στον λογαριασμό σας για να εγκρίνετε την αξιολόγηση ώστε να εμφανίζεται δημόσια!
                      </p>` : ''}
                      <a href="${data.dashboardUrl}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 20px 10px 10px 10px; font-weight: 700;">
                        Προβολή Αξιολογήσεων
                      </a>
                      <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 24px; font-family: Arial, sans-serif;">
                        Με εκτίμηση,<br />
                        Η ομάδα Doulitsa
                      </p>
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

export const REVIEW_APPROVED_TEXT = (data: ReviewApprovedData): string => `
ΝΕΑ ΑΞΙΟΛΟΓΗΣΗ!

Έλαβες μία ${data.rating === 5 ? '👍 θετική' : '👎 αρνητική'} αξιολόγηση${data.serviceName ? `
για την υπηρεσία ${data.serviceName}` : ''}${data.comment ? `

"${data.comment}"

Συνδεθείτε στον λογαριασμό σας για να εγκρίνετε την αξιολόγηση ώστε να εμφανίζεται δημόσια!` : ''}

Προβολή Αξιολογήσεων:
${data.dashboardUrl}

Με εκτίμηση,
Η ομάδα Doulitsa

---
© Doulitsa, 2025
`;
