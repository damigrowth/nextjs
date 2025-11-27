import { ContactEmailData as ContactEmailDataType } from '@/lib/types/email';

// Re-export type for email-config
export type ContactEmailData = ContactEmailDataType;

// Contact form email templates
export const CONTACT_ADMIN_HTML = (data: ContactEmailData): string => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message in Your Inbox</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" style="width: 602px; margin-top: 30px; margin-bottom: 30px; border-collapse: separate; border: 1px solid #cccccc; background-color: #ffffff; border-radius: 20px; overflow: hidden;">
                    <tr>
                        <td style="padding: 30px 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 0 0px 0; color: #153643;">
                                        <h1 style="font-size: 24px; text-align: center; margin: 0 0 10px 0; font-family: Arial, sans-serif; color: #1f4c40;">Νέα Φόρμα Επικοινωνίας!</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: separate; border: 1px solid #cccccc; border-radius: 10px;">
                                <tr>
                                    <td style="padding: 20px; background-color: #f8f8f8;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 0 0 10px 0;">
                                                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #153643;">Όνομα: ${data.name}</p>
                                                </td>
                                            </tr>
                                           <tr>
                                                <td style="padding: 0 0 10px 0;">
                                                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #153643;">Email: ${data.email}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0 0 10px 0;">
                                                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #153643;">Θέμα: ${data.subject || 'Φόρμα Επικοινωνίας'}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #555555;">${data.message}</p>
                                                </td>
                                            </tr>
                                            ${data.contactId ? `
                                            <tr>
                                                <td style="padding: 10px 0 0 0; border-top: 1px solid #cccccc;">
                                                    <p style="margin: 0; font-size: 12px; color: #999999;">ID Μηνύματος: ${data.contactId}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
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
                                            &reg; Doulitsa, 2025<br/>
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

export const CONTACT_CONFIRMATION_HTML = (data: ContactEmailData): string => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
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
                                        <h1 style="font-size: 24px; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #1f4c40;">Λάβαμε το μήνυμα σου ${data.name}!</h1>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">Σε ευχαριστούμε που επικοινώνησες μαζί μας! </p>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">Η ομάδα μας θα δει το αίτημά σου και θα σου απαντήσει το συντομότερο.<br/> Συνήθως απαντάμε μέσα σε 24-48 ώρες.</p>
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
                                            &reg; Doulitsa, 2025<br/>
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