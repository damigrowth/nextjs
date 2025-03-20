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
  captchaToken: z.string().min(1, "Το reCAPTCHA είναι υποχρεωτικό"),
});

async function verifyCaptcha(token) {
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export async function submitContactForm(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const captchaToken = formData.get("captchaToken");

  const fields = {
    name,
    email,
    message,
    captchaToken,
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

  // Verify reCAPTCHA
  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return {
      success: false,
      message: "Η επαλήθευση reCAPTCHA απέτυχε. Δοκιμάστε ξανά.",
    };
  }

  try {
    const data = await postData(CONTACT, {
      data: {
        name,
        email,
        message,
      },
    });

    if (!data?.data?.createEmail?.data?.id) {
      return {
        success: false,
        message: "Αποτυχία αποστολής μηνύματος. Δοκιμάστε ξανά.",
      };
    } else {
      return { success: true, message: "Επιτυχία αποστολής μηνύματος!" };
    }
  } catch (error) {
    console.error("Σφάλμα κατά την υποβολή της φόρμας επικοινωνίας:", error);
    return {
      success: false,
      message: "Προέκυψε ένα σφάλμα. Δοκιμάστε ξανά.",
    };
  }
}
