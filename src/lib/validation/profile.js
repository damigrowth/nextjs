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
  skills: z.object({
    data: z.array(
      z.object({
        id: z.string(),
        attributes: z.object({
          slug: z.string(),
        }),
      })
    ),
  }),
  specialization: z
    .object({
      data: z
        .object({
          id: z.string(),
          attributes: z.object({
            slug: z.string(),
          }),
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

export const presentationSchema = z.object({
  website: z
    .string()
    .url("Παρακαλώ εισάγετε έναν έγκυρο ιστότοπο")
    .optional()
    .nullable(),
  socials: z.object({
    facebook: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Facebook")
      .regex(
        /^https?:\/\/(www\.)?facebook\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος Facebook"
      )
      .optional()
      .nullable(),
    linkedin: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο LinkedIn")
      .regex(
        /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος LinkedIn"
      )
      .optional()
      .nullable(),
    x: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμος X")
      .regex(/^https?:\/\/(www\.)?x\.com\/.*$/, "Μη έγκυρος σύνδεσμος X")
      .optional()
      .nullable(),
    youtube: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο YouTube")
      .regex(
        /^https?:\/\/(www\.)?youtube\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος YouTube"
      )
      .optional()
      .nullable(),
    github: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο GitHub")
      .regex(
        /^https?:\/\/(www\.)?github\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος GitHub"
      )
      .optional()
      .nullable(),
    instagram: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Instagram")
      .regex(
        /^https?:\/\/(www\.)?instagram\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος Instagram"
      )
      .optional()
      .nullable(),
    behance: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Behance")
      .regex(
        /^https?:\/\/(www\.)?behance\.net\/.*$/,
        "Μη έγκυρος σύνδεσμος Behance"
      )
      .optional()
      .nullable(),
    dribbble: z
      .string()
      .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Dribbble")
      .regex(
        /^https?:\/\/(www\.)?dribbble\.com\/.*$/,
        "Μη έγκυρος σύνδεσμος Dribbble"
      )
      .optional()
      .nullable(),
  }),
  visibility: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    address: z.boolean(),
  }),
  portfolio: z.array(z.any()).optional(),
});

export const additionalInfoSchema = z.object({
  terms: z
    .string()
    .min(80, "Οι όροι συνεργασίας πρέπει να είναι τουλάχιστον 80 χαρακτήρες")
    .max(
      5000,
      "Οι όροι συνεργασίας δεν μπορούν να υπερβαίνουν τους 5000 χαρακτήρες"
    )
    .optional()
    .nullable(),
  minBudgets: z.array(z.string()).optional().nullable(),
  industries: z
    .array(z.string())
    .max(3, "Μπορείτε να επιλέξετε έως 3 κλάδους")
    .optional()
    .nullable(),
  contactTypes: z
    .array(z.string())
    .min(1, "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο επικοινωνίας")
    .optional()
    .nullable(),
  payment_methods: z
    .array(z.string())
    .min(1, "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο πληρωμής")
    .optional()
    .nullable(),
  settlement_methods: z
    .array(z.string())
    .min(1, "Πρέπει να επιλέξετε τουλάχιστον μία μέθοδο εξόφλησης")
    .optional()
    .nullable(),
});

export const billingSchemaOptional = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .string()
    .min(1, "Το ΑΦΜ πρέπει να έχει τουλάχιστον 1 ψηφίο")
    .max(10, "Το ΑΦΜ δεν μπορεί να υπερβαίνει τα 10 ψηφία")
    .optional()
    .nullable(),
  doy: z.string().min(2, "Το ΔΟΥ είναι υποχρεωτικό").optional().nullable(),
  brandName: z
    .string()
    .min(2, "Η επωνυμία είναι υποχρεωτική")
    .optional()
    .nullable(),
  profession: z
    .string()
    .min(2, "Το επάγγελμα είναι υποχρεωτικό")
    .optional()
    .nullable(),
  address: z
    .string()
    .min(2, "Η διεύθυνση είναι υποχρεωτική")
    .optional()
    .nullable(),
});

export const billingSchema = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .string()
    .min(1, "Το ΑΦΜ είναι υποχρεωτικό")
    .nullable()
    .refine((val) => val !== null, {
      message: "Το ΑΦΜ είναι υποχρεωτικό",
    }),
  doy: z
    .string()
    .min(2, "Το ΔΟΥ είναι υποχρεωτικό")
    .nullable()
    .refine((val) => val !== null, {
      message: "Το ΔΟΥ είναι υποχρεωτικό",
    }),
  brandName: z
    .string()
    .min(2, "Η επωνυμία είναι υποχρεωτική")
    .nullable()
    .refine((val) => val !== null, {
      message: "Η επωνυμία είναι υποχρεωτική",
    }),
  profession: z
    .string()
    .min(2, "Το επάγγελμα είναι υποχρεωτικό")
    .nullable()
    .refine((val) => val !== null, {
      message: "Το επάγγελμα είναι υποχρεωτικό",
    }),
  address: z
    .string()
    .min(2, "Η διεύθυνση είναι υποχρεωτική")
    .nullable()
    .refine((val) => val !== null, {
      message: "Η διεύθυνση είναι υποχρεωτική",
    }),
});
