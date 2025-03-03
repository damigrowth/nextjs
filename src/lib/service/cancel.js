"use server";

import { redirect } from "next/navigation";
import { getToken } from "../auth/token";
import { postData } from "../client/operations";
import { EDIT_SERVICE } from "../graphql/mutations";
import { revalidatePath } from "next/cache";

export async function cancelService(prevState, formData) {
  const jwt = await getToken();
  const serviceId = formData.get("service-id");

  const payload = {
    id: serviceId,
    data: {
      status: 5, // Assuming 5 is the status code for canceled
    },
  };

  const response = await postData(EDIT_SERVICE, payload, jwt);

  if (!response?.data?.updateService?.data) {
    return {
      message: "Η διαγραφή της υπηρεσίας απέτυχε!",
      error: true,
      success: false,
    };
  }

  // Revalidate edit service page
  revalidatePath(`/dashboard/services`);

  // Return success instead of redirecting
  return {
    message: "Η υπηρεσία διαγράφηκε με επιτυχία!",
    error: false,
    success: true,
  };
}
