/**
 * Service Report Email Template
 *
 * HTML template for notifying admin when a service is reported
 */

export interface ServiceReportData {
  serviceTitle: string;
  serviceId: string;
  serviceSlug: string;
  reporterName: string;
  reporterEmail: string;
  reportReason: string;
  reportDetails: string;
  reportDate: Date | string;
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
              <td style="padding: 36px 30px 42px 30px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #153643;">
                      <h1 style="font-size: 24px; margin: 0 0 10px 0; font-family: Arial, sans-serif; color: #333;">⚠️ Αναφορά Υπηρεσίας</h1>
                      <h2 style="font-size: 20px; margin: 0 0 20px 0; font-family: Arial, sans-serif; color: #1f4c40;">${data.serviceTitle}</h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #666;">
                        <strong>Λόγος Αναφοράς:</strong><br>
                        ${data.reportReason}
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #666;">
                        <strong>Λεπτομέρειες:</strong><br>
                        ${data.reportDetails}
                      </p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>👤 Αναφέρθηκε από:</strong><br>
                        ${data.reporterName} (${data.reporterEmail})
                      </p>
                      <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        <strong>🔧 Ενέργειες:</strong>
                      </p>
                      <a href="https://doulitsa.gr/s/${data.serviceSlug}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px 10px 10px 0; font-weight: 700;">
                        Προβολή Υπηρεσίας
                      </a>
                      <a href="https://doulitsa.gr/admin/services/${data.serviceId}" style="background: #ffffff; color: #1f4c40; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 10px; font-weight: 700; border: 2px solid #1f4c40;">
                        Διαχείριση Υπηρεσίας
                      </a>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="margin: 0; font-size: 12px; line-height: 16px; font-family: Arial, sans-serif; color: #999;">
                        Ημερομηνία: ${data.reportDate ? new Date(data.reportDate).toLocaleString('el-GR') : new Date().toLocaleString('el-GR')}
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
