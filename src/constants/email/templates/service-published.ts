/**
 * Service Published Email Template
 *
 * HTML template for notifying user when their service is published
 */

export interface ServicePublishedData {
  userName: string;
  userEmail: string;
  serviceTitle: string;
  serviceSlug: string;
  serviceId: string;
}

export const SERVICE_PUBLISHED_HTML = (data: ServicePublishedData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Η υπηρεσία δημοσιεύτηκε</title>
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
                      <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #1f4c40;">🎉 Συγχαρητήρια ${data.userName}!</h1>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Η υπηρεσία <strong>${data.serviceTitle}</strong> δημοσιεύτηκε με επιτυχία και είναι πλέον ορατή στην Doulitsa!
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Οι πελάτες μπορούν πλέον να την βρουν και να επικοινωνήσουν μαζί σου.
                      </p>
                      <a href="https://doulitsa.gr/s/${data.serviceSlug}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 20px 10px 10px 10px; font-weight: 700;">
                        Προβολή Υπηρεσίας
                      </a>
                      <a href="https://doulitsa.gr/dashboard/services/edit/${data.serviceId}" style="background: #ffffff; color: #1f4c40; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px; font-weight: 700; border: 2px solid #1f4c40;">
                        Επεξεργασία Υπηρεσίας
                      </a>
                      <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 24px; font-family: Arial, sans-serif;">
                        Καλή επιτυχία!<br /><br />
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

export const SERVICE_PUBLISHED_TEXT = (data: ServicePublishedData): string => `
🎉 ΣΥΓΧΑΡΗΤΗΡΙΑ ${data.userName.toUpperCase()}!

Η υπηρεσία "${data.serviceTitle}" δημοσιεύτηκε με επιτυχία και είναι πλέον ορατή στην Doulitsa!

Οι πελάτες μπορούν πλέον να την βρουν και να επικοινωνήσουν μαζί σου.

Προβολή Υπηρεσίας:
https://doulitsa.gr/s/${data.serviceSlug}

Επεξεργασία Υπηρεσίας:
https://doulitsa.gr/dashboard/services/edit/${data.serviceId}

Καλή επιτυχία!

Με εκτίμηση,
Η ομάδα Doulitsa

---
© Doulitsa, 2025
`;
