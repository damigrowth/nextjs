import { z } from "zod";

export const accountSchema = z.object({
  displayName: z
    .string()
    .min(2, "Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(50, "Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες"),
  phone: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου"
    )
    .optional()
    .nullable(),
  address: z
    .string()
    .min(5, "Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες")
    .max(200, "Η διεύθυνση δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες")
    .optional()
    .nullable(),
});

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MIN_WIDTH = 80;
const MIN_HEIGHT = 80;

const imageSchema = z
  .any()
  .refine(
    (file) => !file || file.size <= MAX_FILE_SIZE,
    "Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 1MB"
  )
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Επιτρέπονται μόνο αρχεία .jpg και .png"
  )
  .refine((file) => {
    if (!file) return true;
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
    });
  }, `Οι ελάχιστες διαστάσεις εικόνας είναι ${MIN_WIDTH}x${MIN_HEIGHT} pixels`)
  .optional();

export const basicInfoSchema = z.object({
  image: imageSchema,
  description: z
    .string()
    .min(80, "Η περιγραφή πρέπει να έχει τουλάχιστον 80 χαρακτήρες")
    .max(5000, "Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες"),
  category: z.object(
    {
      data: z.object({
        id: z.string(),
        attributes: z.object({
          slug: z.string(),
        }),
      }),
    },
    { required_error: "Η κατηγορία είναι υποχρεωτική" }
  ),
  subcategory: z
    .object({
      data: z
        .object({
          id: z.string(),
        })
        .nullable(),
    })
    .optional(),
  rate: z
    .number()
    .min(10, "Η ελάχιστη χρέωση είναι 10€")
    .max(50000, "Η μέγιστη χρέωση είναι 50.000€"),
  commencement: z
    .number()
    .min(1900, "Το έτος έναρξης πρέπει να είναι μετά το 1900")
    .max(
      new Date().getFullYear(),
      "Το έτος έναρξης δεν μπορεί να είναι μελλοντικό"
    ),
  coverage: z
    .object({
      online: z.boolean(),
      onbase: z.boolean(),
      onsite: z.boolean(),
      address: z.string().optional().nullable(),
      zipcode: z
        .object({
          data: z
            .object({
              id: z.string(),
            })
            .nullable(),
        })
        .optional(),
      area: z
        .object({
          data: z
            .object({
              id: z.string(),
            })
            .nullable(),
        })
        .optional(),
      county: z
        .object({
          data: z
            .object({
              id: z.string(),
            })
            .nullable(),
        })
        .optional(),
      counties: z
        .object({
          data: z.array(
            z.object({
              id: z.string(),
            })
          ),
        })
        .optional(),
      areas: z
        .object({
          data: z.array(
            z.object({
              id: z.string(),
            })
          ),
        })
        .optional(),
    })
    .refine(
      (data) => data.online || data.onbase || data.onsite,
      "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης"
    )
    .refine((data) => {
      if (data.onbase) {
        return data.address && data.zipcode.data;
      }
      return true;
    }, "Για την κάλυψη στην έδρα σας απαιτείται διεύθυνση και Τ.Κ.")
    .refine((data) => {
      if (data.onsite) {
        return data.counties.data.length > 0;
      }
      return true;
    }, "Για την κάλυψη στο χώρο του πελάτη απαιτείται τουλάχιστον ένας νομός"),
});
