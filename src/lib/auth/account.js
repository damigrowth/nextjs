"use server";

import { cookies } from "next/headers";
import { postData } from "../client/operations";
import { DELETE_ACCOUNT } from "../graphql/mutations";
import { getToken, removeToken } from "./token";

export async function deleteAccount(prevState, formData) {
  const jwt = await getToken();
  const username = formData.get("username");
  const confirmUsername = formData.get("confirm-username");

  // Verify username matches confirmation
  if (username !== confirmUsername) {
    return {
      message: "Μη έγκυρη επιβεβαίωση username",
      error: true,
      success: false,
    };
  }

  try {
    // Make GraphQL mutation to delete the account
    const response = await postData(DELETE_ACCOUNT, { username }, jwt);

    if (!response.data?.deleteAccount?.success) {
      return {
        message:
          response.data?.deleteAccount?.message ||
          "Η διαγραφή του λογαριασμού απέτυχε.",
        error: true,
        success: false,
      };
    }

    await removeToken();
    // Return success first to show the success message
    return {
      message: "Ο λογαριασμός σας διαγράφηκε με επιτυχία!",
      error: false,
      success: true,
      redirectUrl: "/",
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      message:
        error.message || "Σφάλμα κατά τη διαγραφή. Προσπαθήστε ξανά αργότερα.",
      error: true,
      success: false,
    };
  }
}
