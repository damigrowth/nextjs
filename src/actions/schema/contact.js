const { z } = require('zod');

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
  email: z.string().email('Μη έγκυρη διεύθυνση email'),
  message: z
    .string()
    .min(10, 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες'),
  captchaToken: z.string().min(1, 'Το reCAPTCHA είναι υποχρεωτικό'),
});
