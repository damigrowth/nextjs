import { z } from 'zod';

export const accountSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες'),
});
