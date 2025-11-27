/**
 * Support/Feedback Email Template
 * Email notification sent to admin when user submits support/feedback
 */

export interface SupportFeedbackData {
  // Reporter info
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterUsername: string;

  // Feedback details
  issueType: 'problem' | 'option' | 'feature';
  issueTypeLabel: string; // Greek label for display
  description: string;
  submitDate: Date | string;

  // URLs
  pageUrl: string;
  reporterAdminUrl: string;
}

export const SUPPORT_FEEDBACK_HTML = (data: SupportFeedbackData): string => {
  const formattedDate =
    data.submitDate instanceof Date
      ? data.submitDate.toLocaleString('el-GR')
      : new Date(data.submitDate).toLocaleString('el-GR');

  return `<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Αναφορά Υποστήριξης</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                    <!-- Title -->
                    <tr>
                        <td style="padding: 30px 40px 40px 40px; ">
                            <h1 style="color: #1f4c40; font-size: 24px; font-weight: bold;">
                                Νέα Φόρμα Υποστήριξης / Αναφοράς
                            </h1>
                        </td>
                    </tr>

                    <!-- Issue Type Section -->
                    <tr>
                        <td style="padding: 0 40px 20px 40px;">
                            <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: bold;">
                                Είδος Ζητήματος:
                            </h3>
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                ${data.issueTypeLabel}
                            </p>
                        </td>
                    </tr>

                    <!-- Description Section -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: bold;">
                                Περιγραφή Ζητήματος:
                            </h3>
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                ${data.description}
                            </p>
                        </td>
                    </tr>

                    <!-- Reporter Details Section -->
                    <tr>
                        <td style="padding: 0 40px 20px 40px; border-top: 1px solid #f0f0f0;">
                            <h3 style="margin: 20px 0 15px 0; color: #333333; font-size: 16px; font-weight: bold;">
                                Υποβολή αναφοράς από:
                            </h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 5px 0;">
                                        <span style="color: #666666; font-size: 14px;">ID: ${data.reporterId}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0;">
                                        <span style="color: #666666; font-size: 14px;">Όνομα: ${data.reporterName}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0;">
                                        <span style="color: #666666; font-size: 14px;">Email: ${data.reporterEmail}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0;">
                                        <span style="color: #666666; font-size: 14px;">Username: ${data.reporterUsername}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 5px 0;">
                                        <a href="${data.reporterAdminUrl}" style="color: #1f4c40; text-decoration: none; font-size: 14px; font-weight: 500;">
                                            Προβολή Αναφέροντα στο Admin →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                    <!-- Page URL Section -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                Η αναφορά υποβλήθηκε από τη σελίδα: <a href="${data.pageUrl}" style="color: #1f4c40; text-decoration: none;">${data.pageUrl}</a>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                                Ημερομηνία: ${formattedDate}
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #000; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #fff; font-size: 12px; text-align: left;">
                                © ${new Date().getFullYear()} Doulitsa. 
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
