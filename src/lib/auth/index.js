"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  REGISTER_USER,
  UPDATE_USER,
  CREATE_FREELANCER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN_USER,
  EMAIL_CONFIRMATION,
} from "../graphql/mutations";
import { postData } from "../client/operations";
import { loginSchema, registerSchema } from "../validation/auth";
import { removeToken, setToken } from "./token";
import { inspect } from "@/utils/inspect";
import { cookies } from "next/headers";

export async function register(prevState, formData) {
  const type = Number(formData.get("type"));
  const role = Number(formData.get("role"));
  const consent = formData.get("consent");
  const displayName = type === 2 ? formData.get("displayName") : undefined;

  if (!consent) {
    return {
      errors: {
        consent: ["Πρέπει να αποδεχθείς τους Όρους Χρήσης"],
      },
    };
  }

  // Περνάμε τα επιπλέον πεδία στο Strapi
  const userData = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    pendingType: type,
    pendingRole: role,
    pendingDisplayName: displayName || formData.get("username"),
  };

  const result = await postData(REGISTER_USER, {
    input: userData,
  });

  if (result.error) {
    return { message: result.error };
  }

  // Αποθηκεύουμε παράλληλα και στα cookies για συμβατότητα
  try {
    (await cookies()).set(
      "registration_data",
      JSON.stringify({
        type,
        role,
        displayName: type === 2 ? displayName : userData.username,
        consent: true,
      })
    );
  } catch (e) {
    console.error("Error storing cookies:", e);
    // Συνεχίζουμε κανονικά ακόμα κι αν αποτύχει η αποθήκευση cookies
  }

  redirect("/register/success");
}

// Complete registration action
export async function completeRegistration(prevState, formData) {
  const code = formData.get("code");

  // First verify email with Strapi
  const confirmationResult = await postData(EMAIL_CONFIRMATION, {
    code,
  });

  if (!confirmationResult?.data?.emailConfirmation?.jwt) {
    return {
      success: false,
      message: "Σφάλμα ταυτοποίησης, ο σύνδεσμος έχει λήξει.",
    };
  }

  const { jwt, user } = confirmationResult.data.emailConfirmation;
  const userId = user.id;

  // Χρησιμοποιούμε τα πεδία από το Strapi (pendingType, pendingRole, pendingDisplayName)
  let type = user.pendingType ? Number(user.pendingType) : 1;
  let role = user.pendingRole ? Number(user.pendingRole) : 1;
  let displayName = user.pendingDisplayName || user.username;
  let consent = true;

  // Αν δεν βρέθηκαν δεδομένα από το Strapi, προσπαθούμε να διαβάσουμε από cookies για συμβατότητα
  if (!user.pendingType) {
    try {
      const cookieData = (await cookies()).get("registration_data")?.value;
      if (cookieData) {
        const registrationData = JSON.parse(cookieData);
        type = registrationData.type || type;
        role = registrationData.role || role;
        displayName = registrationData.displayName || displayName;
        consent = registrationData.consent || consent;
      }
    } catch (e) {
      console.error("Error reading cookies:", e);
    }
  }

  try {
    // Δημιουργία προφίλ freelancer με βάση τον τύπο χρήστη
    let freelancerType;
    let roleId;

    if (type === 1) {
      // Απλός χρήστης (User)
      freelancerType = "3"; // Type 3: Χρήστης
      roleId = "1";         // Role 1: User
    } else if (type === 2) {
      if (role === 4) {
        // Επαγγελματίας (Freelancer)
        freelancerType = "1"; // Type 1: Επαγγελματίας
        roleId = "4";         // Role 4: Freelancer
      } else if (role === 5) {
        // Επιχείρηση (Company)
        freelancerType = "2"; // Type 2: Επιχείρηση
        roleId = "5";         // Role 5: Company
      } else {
        // Εάν δεν έχει οριστεί ρόλος, χρησιμοποιούμε προεπιλογή για Επαγγελματία
        freelancerType = "1"; // Type 1: Επαγγελματίας
        roleId = "4";         // Role 4: Freelancer
      }
    } else {
      // Αν δεν υπάρχει έγκυρο type, χρησιμοποιούμε προεπιλογή απλού χρήστη
      freelancerType = "3"; // Type 3: Χρήστης
      roleId = "1";         // Role 1: User
    }

    // Δημιουργία του freelancer προφίλ
    const freelancer = await postData(
      CREATE_FREELANCER,
      {
        data: {
          user: userId,
          username: user.username,
          email: user.email,
          displayName: type === 2 ? displayName : user.username,
          type: freelancerType,
          publishedAt: new Date().toISOString(),
        },
      },
      jwt
    );

    if (!freelancer.data?.createFreelancer?.data?.id) {
      throw new Error("Αποτυχία δημιουργίας προφίλ");
    }

    const freelancerId = freelancer.data.createFreelancer.data.id;

    // Ενημέρωση του χρήστη με τον ρόλο και το προφίλ freelancer
    await postData(
      UPDATE_USER,
      {
        id: userId,
        roleId: roleId,
        freelancer: freelancerId,
        username: user.username,
        displayName: type === 2 ? displayName : user.username,
        consent: consent,
        // Καθαρισμός των pending πεδίων
        pendingType: null,
        pendingRole: null, 
        pendingDisplayName: null,
        confirmed: true, // Σημειώνουμε ότι ο χρήστης έχει επιβεβαιωθεί
      },
      jwt
    );

    // Καθαρισμός cookies (δεν είναι πλέον κρίσιμο)
    try {
      (await cookies()).delete("registration_data");
    } catch (e) {
      // Αγνοούμε σφάλματα cookies
    }

    // Αποθήκευση του JWT token
    await setToken(jwt);
    
    return {
      success: true,
      message: `Καλώς ήρθες ${user.username}!`,
      redirect: true,
    };
  } catch (error) {
    console.error("Σφάλμα ολοκλήρωσης εγγραφής:", error);
    return {
      success: false,
      message: "Προέκυψε σφάλμα κατά την ολοκλήρωση της εγγραφής. Παρακαλώ δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη.",
    };
  }
}

export async function login(prevState, formData) {
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Λάθος στοιχεία συνδεσης.",
    };
  }

  const { identifier, password } = validatedFields.data;

  const response = await postData(LOGIN_USER, {
    identifier,
    password,
  });

  if (response?.data?.login?.jwt) {
    await setToken(response.data.login.jwt);
    redirect("/dashboard/profile");
  } else {
    return {
      errors: {},
      message: response.error || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
    };
  }
}

export async function logout() {
  await removeToken();
  redirect("/login");
}

export async function forgotPassword(prevState, formData) {
  try {
    const email = formData.get("email");

    const result = await postData(FORGOT_PASSWORD, {
      email,
    });

    if (result.error) {
      return { message: result.error };
    }

    if (result.data?.forgotPassword?.ok) {
      return {
        success: true,
        errors: {},
        message:
          "Εάν το email υπάρχει στο σύστημά μας, θα λάβετε σύντομα ένα σύνδεσμο επαναφοράς κωδικού στο inbox σας.",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      errors: {},
      message: "Προέκυψε σφάλμα. Δοκιμάστε ξανά αργότερα.",
    };
  }
}

export async function resetPassword(prevState, formData) {
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const resetCode = formData.get("resetCode");

  const response = await postData(RESET_PASSWORD, {
    password,
    passwordConfirmation,
    resetCode,
  });

  if (response.error?.includes("Λανθασμένος κωδικός επιβεβαίωσης")) {
    return {
      success: false,
      message:
        "Ο σύνδεσμος επαναφοράς έχει λήξει. Χρησιμοποιήστε νέο σύνδεσμο επαναφοράς κωδικού.",
    };
  }

  if (response?.data?.resetPassword?.jwt) {
    await logout();
  }

  return {
    success: true,
    message: "Ο κωδικός σας άλλαξε με επιτυχία!",
  };
}