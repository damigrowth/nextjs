export interface PasswordResetData {
  email: string;
  displayName?: string;
  username?: string;
  url: string;
}

export const PASSWORD_RESET_HTML = (data: PasswordResetData): string => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Επαναφορά Κωδικού</title>
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
                      <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #5bbb7b;">Επαναφορά Κωδικού</h1>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Γεια σου ${data.displayName || data.username || 'φίλε'},
                      </p>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Λάβαμε αίτημα για επαναφορά του κωδικού σου. Κάνε κλικ στον παρακάτω σύνδεσμο για να δημιουργήσεις νέο κωδικό:
                      </p>
                      <a href="${data.url}" style="background: #5bbb7b; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 20px 0; font-weight: 700;">
                        Επαναφορά Κωδικού
                      </a>
                      <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 24px; font-family: Arial, sans-serif;">
                        Αν δεν μπορείς να κάνεις κλικ στο κουμπί, αντίγραψε και επικόλλησε αυτό το link στον browser σου:
                      </p>
                      <p style="word-break: break-all; color: #6b7280; font-family: monospace; font-size: 12px; margin: 10px 0;">${data.url}</p>
                      <p style="color: #dc2626; margin: 20px 0 0 0; font-size: 14px;">
                        Αυτός ο σύνδεσμος θα λήξει σε 1 ώρα.
                      </p>
                      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        Αν δεν ζήτησες επαναφορά κωδικού, μπορείς να αγνοήσεις αυτό το email.
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

export const PASSWORD_RESET_TEXT = (data: PasswordResetData): string => `
ΕΠΑΝΑΦΟΡΑ ΚΩΔΙΚΟΥ

Γεια σου ${data.displayName || data.username || 'φίλε'},

Λάβαμε αίτημα για επαναφορά του κωδικού σου. Κάνε κλικ στον παρακάτω σύνδεσμο για να δημιουργήσεις νέο κωδικό:

${data.url}

⚠️ Αυτός ο σύνδεσμος θα λήξει σε 1 ώρα.

---

Αν δεν ζήτησες επαναφορά κωδικού, μπορείς να αγνοήσεις αυτό το email.

---
© Doulitsa, 2025
`;