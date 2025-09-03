import { EmailTemplate } from '@/lib/types/email';

export const VERIFICATION: EmailTemplate = {
  from: 'Doulitsa <contact@doulitsa.gr>',
  replyTo: 'contact@doulitsa.gr',
  subject: 'Επιβεβαίωση λογαριασμού στη Doulitsa',
  html: (user: any, url?: string) => `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Επιβεβαίωση Λογαριασμού</title>
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
                      <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #5bbb7b;">Επιβεβαίωση Λογαριασμού</h1>
                      <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                        Καλώς ήρθες στην πλατφόρμα επαγγελματιών Doulitsa! Σε ευχαριστούμε που εγγράφηκες. Για να ενεργοποιήσεις τον λογαριασμό σου, παρακαλώ πάτησε στον παρακάτω σύνδεσμο:
                      </p>
                      <a href="${url}" style="background: #5bbb7b; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 4px; display: inline-block; margin: 20px 0; font-weight: 700;"> Επιβεβαίωση Λογαριασμού </a>
                      <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 24px; font-family: Arial, sans-serif;">
                        Αν δεν πραγματοποίησες εσύ αυτή την εγγραφή, μπορείς να αγνοήσεις αυτό το μήνυμα. Αν έχεις οποιαδήποτε απορία, είμαστε στη διάθεσή σου!<br /><br />
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
                      <p style="margin: 0; font-size: 14px; line-height: 16px; font-family: Arial, sans-serif; color: #ffffff;"> &reg; Doulitsa, 2025 <br />
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
</html>`,
};