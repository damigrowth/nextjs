import { z } from "zod";

export const accountSchema = z.object({
  displayName: z
    .string()
    .min(2, "Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(50, "Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες"),
  phone: z
    .number()
    .min(1000000000, "Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία")
    .max(999999999999, "Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία")
    .optional()
    .nullable(),
});

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MIN_WIDTH = 80;
const MIN_HEIGHT = 80;

// A schema that validates either a File object or an existing image object
const imageSchema = z
  .union([
    // Case 1: Existing valid image
    z.object({
      data: z.object({
        id: z.string(),
        attributes: z.object({
          url: z.string().url(),
          formats: z
            .object({
              thumbnail: z
                .object({
                  url: z.string().url(),
                })
                .optional(),
            })
            .optional(),
        }),
      }),
    }),

    // Case 2: New file upload (modified to work in Node.js)
    z
      .object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        lastModified: z.number(),
      })
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        "Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 1MB"
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Επιτρέπονται μόνο αρχεία .jpg και .png"
      )
      .optional(),

    // Case 3: Empty/undefined
    z.undefined().or(z.null()).optional(),
  ])
  .superRefine((val, ctx) => {
    // Check if we have either existing image or valid file object
    const hasValidImage =
      val?.data?.attributes?.url ||
      (val?.name && val?.size && val?.type && val?.lastModified);

    if (!hasValidImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Η εικόνα προφίλ είναι υποχρεωτική",
      });
    }
  });

// 3. Zod validation schema
export const coverageSchema = z
  .object({
    online: z.boolean(),
    onbase: z.boolean(),
    onsite: z.boolean(),
    address: z.string().nullable(),
    area: z.object({ data: z.any().nullable() }).nullable(),
    county: z.object({ data: z.any().nullable() }).nullable(),
    zipcode: z.object({ data: z.any().nullable() }).nullable(),
    counties: z.object({ data: z.array(z.any()).nullable() }).nullable(),
    areas: z.object({ data: z.array(z.any()).nullable() }).nullable(),
  })
  .superRefine((cov, ctx) => {
    // At least one coverage type must be selected
    if (!cov.online && !cov.onbase && !cov.onsite) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης",
        path: ["coverage"],
      });
    }

    // Validate onbase requirements
    if (cov.onbase) {
      if (!cov.address?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Η διεύθυνση είναι υποχρεωτική για κάλυψη στον χώρο σας",
          path: ["address"],
        });
      }

      if (!cov.zipcode?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στον χώρο σας",
          path: ["zipcode"],
        });
      }

      if (!cov.county?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ο νομός είναι υποχρεωτικός για κάλυψη στον χώρο σας",
          path: ["county"],
        });
      }

      if (!cov.area?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Η περιοχή είναι υποχρεωτική για κάλυψη στον χώρο σας",
          path: ["area"],
        });
      }
    }

    // Validate onsite requirements
    if (cov.onsite) {
      if (!cov.counties?.data?.length && !cov.areas?.data?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Απαιτείται τουλάχιστον ένας νομός ή μια περιοχή για κάλυψη στον χώρο του πελάτη",
          path: ["counties"],
        });
      }
    }
  });

export const baseSchema = z.object({
  category: z.object({
    data: z.object({ id: z.string() }),
  }),
  subcategory: z.object({
    data: z.object({ id: z.string() }),
  }),
  coverage: coverageSchema,
});

export const basicInfoSchema = z.object({
  image: imageSchema.optional(),
  category: z.object({
    data: z.object({
      id: z.string(),
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  subcategory: z.object({
    data: z.object({
      id: z.string(),
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  coverage: coverageSchema, // Defined above
  // Optional fields
  tagline: z.string().min(5).max(120).optional().nullable().or(z.literal("")),
  description: z.string().min(80).max(5000).optional().nullable().or(z.literal("")),
  rate: z.number().min(10).max(50000).optional(),
  commencement: z.number().min(1900).max(new Date().getFullYear()).optional(),
});

export const presentationSchema = z.object({
  website: z
    .string()
    .url("Εισάγετε έναν έγκυρο ιστότοπο")
    .optional()
    .nullable()
    .or(z.literal("")),
  socials: z.object({
    facebook: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο Facebook")
            .regex(
              /^https?:\/\/(www\.)?facebook\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος Facebook"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    linkedin: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο LinkedIn")
            .regex(
              /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος LinkedIn"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    x: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο X")
            .regex(/^https?:\/\/(www\.)?x\.com\/.*$/, "Μη έγκυρος σύνδεσμος X")
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    youtube: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο YouTube")
            .regex(
              /^https?:\/\/(www\.)?youtube\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος YouTube"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    github: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο GitHub")
            .regex(
              /^https?:\/\/(www\.)?github\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος GitHub"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    instagram: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο Instagram")
            .regex(
              /^https?:\/\/(www\.)?instagram\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος Instagram"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    behance: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο Behance")
            .regex(
              /^https?:\/\/(www\.)?behance\.net\/.*$/,
              "Μη έγκυρος σύνδεσμος Behance"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
      .optional()
      .nullable(),
    dribbble: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url("Εισάγετε έναν έγκυρο σύνδεσμο Dribbble")
            .regex(
              /^https?:\/\/(www\.)?dribbble\.com\/.*$/,
              "Μη έγκυρος σύνδεσμος Dribbble"
            )
            .optional()
            .nullable()
            .or(z.literal("")),
        }),
      ])
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
  size: z
    .object({
      data: z
        .object({
          id: z.string(),
        })
        .nullable(),
    })
    .optional()
    .nullable(),
  terms: z
    .string()
    // .min(80, "Οι όροι συνεργασίας πρέπει να είναι τουλάχιστον 80 χαρακτήρες")
    // .max(
    //   5000,
    //   "Οι όροι συνεργασίας δεν μπορούν να υπερβαίνουν τους 5000 χαρακτήρες"
    // )
    .optional()
    .nullable(),
  minBudget: z.string().optional().nullable(),
  industries: z
    .array(z.string())
    .max(10, "Μπορείτε να επιλέξετε έως 3 κλάδους")
    .optional()
    .nullable(),
  contactTypes: z.array(z.string()).optional().nullable(),
  payment_methods: z.array(z.string()).optional().nullable(),
  settlement_methods: z.array(z.string()).optional().nullable(),
});

export const billingSchemaOptional = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: "Το ΑΦΜ πρέπει να έχει ακριβώς 9 ψηφία",
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Το ΑΦΜ είναι υποχρεωτικό",
    }),
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
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: "Το ΑΦΜ πρέπει να έχει ακριβώς 9 ψηφία",
    })
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
