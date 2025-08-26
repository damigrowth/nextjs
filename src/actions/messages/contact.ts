'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { contactSchema, type ContactFormValues } from '@/lib/validations/contact';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { sendTemplateEmail } from '@/lib/email/service';
import { ContactEmailData } from '@/lib/types/email';

/**
 * Server action for contact form submission
 * Creates contact record and sends email notification to admin
 */
export async function submitContactForm(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Extract form data
    const name = getFormString(formData, 'name');
    const email = getFormString(formData, 'email');
    const message = getFormString(formData, 'message');
    const captchaToken = getFormString(formData, 'captchaToken');

    // 2. Validate form data with Zod schema
    const validationResult = contactSchema.safeParse({
      name,
      email,
      message,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα επικοινωνίας',
      );
    }

    const data = validationResult.data;

    // 3. Validate ReCAPTCHA if token provided
    if (captchaToken) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY || '',
          response: captchaToken,
        }),
      });

      const recaptchaData = await recaptchaResponse.json();
      
      if (!recaptchaData.success) {
        return {
          success: false,
          message: 'Η επαλήθευση ReCAPTCHA απέτυχε. Παρακαλώ δοκιμάστε ξανά.',
        };
      }
    }

    // 4. Create contact record in database
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
        subject: 'Contact Form Submission',
        status: 'new',
      },
    });

    // 5. Send email notifications using templates
    const adminEmail = process.env.ADMIN_EMAIL || 'contact@doulitsa.gr';

    try {
      const emailData: ContactEmailData = {
        name: data.name,
        email: data.email,
        message: data.message,
        subject: 'Φόρμα Επικοινωνίας',
        contactId: contact.id,
      };

      // Send admin notification email
      await sendTemplateEmail(
        'CONTACT_ADMIN',
        adminEmail,
        emailData,
        {
          from: `${data.name} <${data.email}>`,
          replyTo: data.email,
        }
      );

      // Send confirmation email to user
      await sendTemplateEmail(
        'CONTACT_CONFIRMATION',
        data.email,
        emailData
      );

      console.log(`Contact form emails sent successfully for contact ID: ${contact.id}`);
    } catch (emailError) {
      console.error('Failed to send contact form emails:', emailError);
      // Don't fail the entire action if email fails - contact is still saved
    }

    // 6. Revalidate cached data
    revalidateTag('contacts');

    return {
      success: true,
      message: 'Το μήνυμα σας στάλθηκε επιτυχώς! Θα επικοινωνήσουμε σύντομα μαζί σας.',
    };
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    
    return {
      success: false,
      message: 'Παρουσιάστηκε σφάλμα κατά την αποστολή του μηνύματος. Παρακαλώ δοκιμάστε ξανά.',
    };
  }
}