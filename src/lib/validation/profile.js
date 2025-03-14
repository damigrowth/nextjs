import { z } from "zod";

export const accountSchema = z.object({
  displayName: z
    .string()
    .min(2, "Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(50, "Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες"),
  phone: z
    .number()
    .min(1000000000, "Ο αριθμός τηλεφώνου πρέπει να έχει ακριβώς 10 ψηφία")
    .max(9999999999, "Ο αριθμός τηλεφώνου πρέπει να έχει ακριβώς 10 ψηφία")
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

export const basicInfoSchema = z.object({
  image: imageSchema,
  tagline: z
    .string()
    .min(5, "Η σύντομη περιγραφή πρέπει να έχει τουλάχιστον 5 χαρακτήρες")
    .max(
      120,
      "Η σύντομη περιγραφή δεν μπορεί να υπερβαίνει τους 120 χαρακτήρες"
    )
    .optional()
    .nullable(),
  description: z
    .string()
    .min(80, "Η περιγραφή πρέπει να έχει τουλάχιστον 80 χαρακτήρες")
    .max(5000, "Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες")
    .optional()
    .nullable(),
  category: z
    .union([
      z.null(),
      z.object({
        data: z.union([
          z.null(),
          z.object({
            id: z.string(),
            attributes: z.object({
              slug: z.string(),
            }),
          }),
        ]),
      }),
    ])
    .superRefine((val, ctx) => {
      // Check if it's null or doesn't have the right structure
      if (!val || !val.data || !val.data.id || !val.data.attributes?.slug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Η κατηγορία είναι υποχρεωτική",
          path: ["data"],
        });
        return false;
      }
      return true;
    }),

  subcategory: z
    .union([
      z.null(),
      z.object({
        data: z.union([
          z.null(),
          z.object({
            id: z.string(),
          }),
        ]),
      }),
    ])
    .superRefine((val, ctx) => {
      // Check if it's null or doesn't have the right structure
      if (!val || !val.data || !val.data.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Η υποκατηγορία είναι υποχρεωτική",
          path: ["data"],
        });
        return false;
      }
      return true;
    }),
  skills: z
    .object({
      data: z.array(
        z.object({
          id: z.string(),
          attributes: z.object({
            slug: z.string(),
          }),
        })
      ),
    })
    .optional()
    .nullable(),
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
    .optional()
    .nullable(),
  rate: z
    .number()
    .min(10, "Η ελάχιστη χρέωση είναι 10€")
    .max(50000, "Η μέγιστη χρέωση είναι 50.000€")
    .optional()
    .nullable(),
  commencement: z
    .number()
    .min(1900, "Το έτος έναρξης πρέπει να είναι μετά το 1900")
    .max(
      new Date().getFullYear(),
      "Το έτος έναρξης δεν μπορεί να είναι μελλοντικό"
    )
    .optional()
    .nullable(),
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
    .superRefine((data, ctx) => {
      // At least one coverage type must be selected
      if (!data.online && !data.onbase && !data.onsite) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης",
          path: [],
        });
      }

      // If onbase is true, validate required fields
      if (data.onbase) {
        if (!data.address) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Η διεύθυνση είναι υποχρεωτική για κάλυψη στην έδρα σας",
            path: ["address"],
          });
        }

        if (!data.zipcode?.data?.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στην έδρα σας",
            path: ["zipcode"],
          });
        }
      }

      // If onsite is true, validate either counties or areas are populated
      if (data.onsite) {
        const hasCounties =
          Array.isArray(data.counties?.data) && data.counties.data.length > 0;
        const hasAreas =
          Array.isArray(data.areas?.data) && data.areas.data.length > 0;

        if (!hasCounties && !hasAreas) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Για την κάλυψη στο χώρο του πελάτη απαιτείται τουλάχιστον ένας νομός ή μια περιοχή",
            path: ["counties"],
          });
        }
      }

      return true;
    }),
});

export const presentationSchema = z.object({
  website: z
    .string()
    .url("Παρακαλώ εισάγετε έναν έγκυρο ιστότοπο")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Facebook")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο LinkedIn")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο X")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο YouTube")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο GitHub")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Instagram")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Behance")
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
            .url("Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο Dribbble")
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
