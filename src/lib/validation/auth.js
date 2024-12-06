import { z } from "zod";

export const registerSchema = {
  base: {
    email: z.string().min(1, "Το email είναι υποχρεωτικό").email("Λάθος email"),
    username: z.string().min(4, "Το username είναι πολύ μικρό").max(25),
    password: z.string().min(6, "Ο κωδικός είναι πολύ μικρός").max(50),
    consent: z.boolean().refine((val) => val === true, {
      message: "Παρακαλώ αποδεχτείτε τους όρους χρήσης",
    }),
  },
  professional: {
    displayName: z
      .string()
      .min(3, "Το όνομα εμφάνισης είναι πολύ μικρό")
      .max(25),
    role: z.number().refine((val) => !isNaN(val) && val > 0, {
      message: "Παρακαλώ επιλέξτε τύπο λογαριασμού",
    }),
  },
};

export const loginSchema = z.object({
  identifier: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});
