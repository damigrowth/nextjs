/**
 * Service Created Email Template
 *
 * HTML template for notifying admin when a new service is created
 */

export interface ServiceCreatedData {
  serviceTitle: string;
  serviceDescription: string;
  serviceId: string;
  serviceSlug?: string;
  profileId: string;
  creatorName: string;
  creatorEmail: string;
  category?: string;
  createdAt?: Date | string;
  adminReviewUrl?: string;
  adminProfileUrl?: string;
  publicUrl?: string;
}

export const SERVICE_CREATED_HTML = (data: ServiceCreatedData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Υπηρεσία</title>
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
                      <h2 style="font-size: 20px; margin: 0 0 20px 0; font-family: Arial, sans-serif; color: #1f4c40;">${data.serviceTitle}</h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>Περιγραφή:</strong><br>
                        ${data.serviceDescription}
                      </p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>👤 Δημιουργός:</strong><br>
                        ${data.creatorName} (${data.creatorEmail})
                      </p>
                      <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>🔧 Ενέργειες:</strong>
                      </p>
                      <a href="${data.adminReviewUrl || `https://doulitsa.gr/admin/services/${data.serviceId}`}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px 10px 10px 0; font-weight: 700;">
                        Επεξεργασία Υπηρεσίας
                      </a>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="margin: 0; font-size: 12px; line-height: 16px; font-family: Arial, sans-serif; color: #999;">
                        Ημερομηνία: ${data.createdAt ? new Date(data.createdAt).toLocaleString('el-GR') : new Date().toLocaleString('el-GR')}
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
