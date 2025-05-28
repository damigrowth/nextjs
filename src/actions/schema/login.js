import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, 'Το email ή το username είναι πολύ μικρό')
    .max(50, 'Το email ή το username είναι πολύ μεγάλο'),
  password: z
    .string()
    .min(6, 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
    .max(100, 'Ο κωδικός είναι πολύ μεγάλος'),
});
