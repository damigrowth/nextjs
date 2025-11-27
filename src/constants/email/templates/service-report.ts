/**
 * Service Report Email Template
 *
 * Plain text template for notifying admin when a service is reported
 */

export interface ServiceReportData {
  // Service info
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;

  // Reporter info
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterUsername: string;

  // Report details
  reportDetails: string;
  reportDate: Date | string;

  // URLs
  servicePageUrl: string;
  serviceAdminUrl: string;
  reporterAdminUrl: string;
}

export const SERVICE_REPORT_HTML = (data: ServiceReportData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Αναφορά Υπηρεσίας</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 0;">
          <table role="presentation" style="width: 602px; margin-top: 30px; margin-bottom: 30px; border-collapse: separate; border: 1px solid #cccccc; background-color: #ffffff; border-radius: 20px; overflow: hidden;">
            <tr>
              <td style="padding: 36px 30px 10px 30px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #153643;">
                    
                      <h1 style="font-size: 24px; margin: 0 0 20px 0; font-family: Arial, sans-serif; color: #1f4c40;">Αναφορά Υπηρεσίας</h1>

                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                        <strong>Περιγραφή Ζητήματος:</strong><br>
                        ${data.reportDetails}
                      </p>

                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                      <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                        <strong>Αναφορά για την υπηρεσία:</strong><br>
                        <strong>ID:</strong> ${data.serviceId}<br>
                        <strong>Τίτλος:</strong> ${data.serviceTitle}<br>
                        <strong>Slug:</strong> ${data.serviceSlug}<br>
                        <a href="${data.serviceAdminUrl}" style="color: #1f4c40; text-decoration: underline;">Προβολή Υπηρεσίας στο Admin</a>
                      </p>

                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                      <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                        <strong>Υποβολή αναφοράς από:</strong><br>
                        <strong>ID:</strong> ${data.reporterId}<br>
                        <strong>Όνομα:</strong> ${data.reporterName}<br>
                        <strong>Email:</strong> ${data.reporterEmail}<br>
                        <strong>Username:</strong> ${data.reporterUsername}<br>
                        <a href="${data.reporterAdminUrl}" style="color: #1f4c40; text-decoration: underline;">Προβολή Αναφέροντα στο Admin</a>
                      </p>

                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif; color: #999;">
                        Η αναφορά υποβλήθηκε από τη σελίδα: <a href="${data.servicePageUrl}" style="color: #1f4c40; text-decoration: underline;">${data.servicePageUrl}</a>
                      </p>

                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif; color: #999;">
                        Ημερομηνία: ${data.reportDate instanceof Date ? data.reportDate.toLocaleString('el-GR') : new Date(data.reportDate).toLocaleString('el-GR')}
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
