"use server";

import { postData } from "../client/operations";
import { CONTACT } from "../graphql/mutations";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  email: z.string().email("Μη έγκυρη διεύθυνση email"),
  message: z
    .string()
    .min(10, "Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες"),
});

export async function submitContactForm(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  const fields = {
    name,
    email,
    message,
  };

  const validationResult = contactFormSchema.safeParse(fields);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(
      (error) => error.message
    );

    return {
      success: false,
      message: errorMessages.join(", "),
    };
  }

  try {
    const data = await postData(CONTACT, { data: fields });

    if (!data.createEmail?.data?.id) {
      return {
        success: false,
        message: "Αποτυχία αποστολής μηνύματος. Παρακαλώ δοκιμάστε ξανά.",
      };
    } else {
      return { success: true, message: "Επιτυχία αποστολής μηνύματος!" };
    }
  } catch (error) {
    console.error("Σφάλμα κατά την υποβολή της φόρμας επικοινωνίας:", error);
    return {
      success: false,
      message: "Προέκυψε ένα σφάλμα. Παρακαλώ δοκιμάστε ξανά αργότερα.",
    };
  }
}
