import { z } from 'zod';

// Custom validator function to check if taxonomy fields have valid IDs
const hasValidId = (field) => {
  if (!field) return false;
  if (field.id === 0 || field.id === '0') return false;

  return true;
};

export const serviceEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Ο τίτλος είναι απαραίτητος')
    .max(80, 'Ο τίτλος δεν μπορεί να υπερβαίνει τους 80 χαρακτήρες')
    .optional(),
  description: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες')
    .max(5000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες')
    .optional(),
  price: z
    .number()
    .refine((val) => val === 0 || val >= 10, {
      message: 'Η τιμή πρέπει να είναι 0 ή τουλάχιστον 10€',
    })
    .optional(),
  status: z.string().optional(),
  // Make category required with proper validation
  category: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: 'Η κατηγορία είναι υποχρεωτική',
        path: ['id'],
      }),
    z.null(),
  ]),
  // Make subcategory required with proper validation
  subcategory: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: 'Η υποκατηγορία είναι υποχρεωτική',
        path: ['id'],
      }),
    z.null(),
  ]),
  // Make subdivision required with proper validation
  subdivision: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: 'Το αντικείμενο είναι υποχρεωτικό',
        path: ['id'],
      }),
    z.null(),
  ]),
  // Make tags more flexible
  tags: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        isNewTerm: z.boolean().optional(),
        // Allow data and attributes to be passed
        data: z.any().optional(),
        attributes: z.any().optional(),
      }),
    )
    .optional(),
  // Add validation for addons
  addons: z
    .array(
      z.object({
        title: z
          .string()
          .min(5, 'Ο τίτλος πρόσθετου πρέπει να έχει τουλάχιστον 5 χαρακτήρες'),
        description: z
          .string()
          .min(
            10,
            'Η περιγραφή πρόσθετου πρέπει να έχει τουλάχιστον 10 χαρακτήρες',
          ),
        price: z
          .number()
          .min(5, 'Η ελάχιστη τιμή είναι 5€')
          .max(10000, 'Η μέγιστη τιμή είναι 10000€'),
      }),
    )
    .max(3, 'Μέγιστος αριθμός πρόσθετων: 3')
    .optional(),
  // Add validation for FAQ
  faq: z
    .array(
      z.object({
        question: z
          .string()
          .min(10, 'Η ερώτηση πρέπει να έχει τουλάχιστον 10 χαρακτήρες'),
        answer: z
          .string()
          .min(2, 'Η απάντηση πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
      }),
    )
    .max(5, 'Μέγιστος αριθμός ερωτήσεων: 5')
    .optional(),
});
