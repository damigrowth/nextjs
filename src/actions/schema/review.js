const { z } = require('zod');

export const reviewSchema = z
  .object({
    type: z.string(),
    rating: z
      .number({
        required_error:
          'Πρέπει να επιλέξετε Βαθμολογία για να υποβάλετε την αξιολόγηση.',
      })
      .min(
        1,
        'Πρέπει να επιλέξετε Βαθμολογία για να υποβάλετε την αξιολόγηση.',
      ),
    service: z.object({
      id: z.string().optional(),
    }),
    comment: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Only require service for freelancer type reviews
    if (data.type === 'freelancer' && (!data.service || !data.service.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Πρέπει να επιλέξετε υπηρεσία για να υποβάλετε την αξιολόγηση.',
        path: ['service'],
      });
    }
  });
