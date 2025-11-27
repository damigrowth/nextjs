/**
 * Profile Report Email Template
 *
 * Plain text template for notifying admin when a profile is reported
 */

export interface ProfileReportData {
  // Reported profile info
  profileId: string;
  profileName: string;
  profileEmail: string;
  profileUsername: string;

  // Reporter info
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterUsername: string;

  // Report details
  reportDetails: string;
  reportDate: Date | string;

  // URLs
  profilePageUrl: string;
  reportedUserAdminUrl: string;
  reporterAdminUrl: string;
}

export const PROFILE_REPORT_HTML = (data: ProfileReportData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Αναφορά Προφίλ</title>
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

                      <h1 style="font-size: 24px; margin: 0 0 20px 0; font-family: Arial, sans-serif; color: #1f4c40;">Αναφορά Προφίλ</h1>

                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                        <strong>Περιγραφή Ζητήματος:</strong><br>
                        ${data.reportDetails}
                      </p>

                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                      <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                        <strong>Αναφορά για το προφίλ:</strong><br>
                        <strong>ID:</strong> ${data.profileId}<br>
                        <strong>Όνομα:</strong> ${data.profileName}<br>
                        <strong>Email:</strong> ${data.profileEmail}<br>
                        <strong>Username:</strong> ${data.profileUsername}<br>
                        <a href="${data.reportedUserAdminUrl}" style="color: #1f4c40; text-decoration: underline;">Προβολή Αναφερόμενου στο Admin</a>
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
                        Η αναφορά υποβλήθηκε από τη σελίδα: <a href="${data.profilePageUrl}" style="color: #1f4c40; text-decoration: underline;">${data.profilePageUrl}</a>
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

export const PROFILE_REPORT_TEXT = (data: ProfileReportData): string => `
ΑΝΑΦΟΡΑ ΠΡΟΦΙΛ

ΠΕΡΙΓΡΑΦΗ ΖΗΤΗΜΑΤΟΣ:
${data.reportDetails}

---

ΑΝΑΦΟΡΑ ΓΙΑ ΤΟ ΠΡΟΦΙΛ:
ID: ${data.profileId}
Όνομα: ${data.profileName}
Email: ${data.profileEmail}
Username: ${data.profileUsername}
Admin URL: ${data.reportedUserAdminUrl}

---

ΥΠΟΒΟΛΗ ΑΝΑΦΟΡΑΣ ΑΠΟ:
ID: ${data.reporterId}
Όνομα: ${data.reporterName}
Email: ${data.reporterEmail}
Username: ${data.reporterUsername}
Admin URL: ${data.reporterAdminUrl}

---

Η αναφορά υποβλήθηκε από: ${data.profilePageUrl}
Ημερομηνία: ${data.reportDate instanceof Date ? data.reportDate.toLocaleString('el-GR') : new Date(data.reportDate).toLocaleString('el-GR')}

---
© Doulitsa, 2025
`;
