import { z } from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Ο ισχύον κωδικός είναι υποχρεωτικός.')
      .min(8, 'Ο ισχύον κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.'),
    newPassword: z
      .string()
      .min(1, 'Ο νέος κωδικός είναι υποχρεωτικός.')
      .min(8, 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.'),
    confirmPassword: z
      .string()
      .min(1, 'Η επανάληψη κωδικού είναι υποχρεωτική.')
      .min(8, 'Η επανάληψη κωδικού πρέπει να έχει τουλάχιστον 8 χαρακτήρες.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Οι νέοι κωδικοί δεν ταιριάζουν.',
    path: ['confirmPassword'], // Set error on confirmPassword field
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον τρέχοντα.',
    path: ['newPassword'], // Set error on newPassword field
  });
