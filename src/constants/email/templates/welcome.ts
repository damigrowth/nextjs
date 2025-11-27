export interface WelcomeData {
  email: string;
  displayName?: string;
  username?: string;
  dashboardUrl?: string;
}

export const WELCOME_HTML = (data: WelcomeData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Καλώς ήρθατε</title>
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
                      <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #1f4c40;">Καλώς ήρθατε στη Doulitsa!</h1>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Γεια σας ${data.displayName || data.username || 'φίλε'},
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Ο λογαριασμός σας έχει επιβεβαιωθεί επιτυχώς! Μπορείτε τώρα να εκμεταλλευτείτε όλες τις δυνατότητες της πλατφόρμας μας.
                      </p>
                      ${
                        data.displayName
                          ? `
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Ως επαγγελματίας, μπορείτε να δημιουργήσετε το προφίλ σας και να προσελκύσετε νέους πελάτες.
                      </p>
                      `
                          : `
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Μπορείτε τώρα να αναζητήσετε και να επικοινωνήσετε με επαγγελματίες στην περιοχή σας.
                      </p>
                      `
                      }
                      <a href="${data.dashboardUrl || 'https://doulitsa.gr/dashboard'}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 20px 0; font-weight: 700;">
                        Μετάβαση στο Dashboard
                      </a>
                      <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 24px; font-family: Arial, sans-serif;">
                        Αν έχετε οποιαδήποτε απορία, είμαστε στη διάθεσή σας!<br /><br />
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

export const WELCOME_TEXT = (data: WelcomeData): string => `
ΚΑΛΩΣ ΗΡΘΑΤΕ ΣΤΗ DOULITSA!

Γεια σας ${data.displayName || data.username || 'φίλε'},

Ο λογαριασμός σας έχει επιβεβαιωθεί επιτυχώς! Μπορείτε τώρα να εκμεταλλευτείτε όλες τις δυνατότητες της πλατφόρμας μας.

${
  data.displayName
    ? 'Ως επαγγελματίας, μπορείτε να δημιουργήσετε το προφίλ σας και να προσελκύσετε νέους πελάτες.'
    : 'Μπορείτε τώρα να αναζητήσετε και να επικοινωνήσετε με επαγγελματίες στην περιοχή σας.'
}

Μετάβαση στο Dashboard:
${data.dashboardUrl || 'https://doulitsa.gr/dashboard'}

Αν έχετε οποιαδήποτε απορία, είμαστε στη διάθεσή σας!

Με εκτίμηση,
Η ομάδα Doulitsa

---
© Doulitsa, 2025
`;
