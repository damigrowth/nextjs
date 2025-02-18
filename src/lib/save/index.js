"use server";

import { getUserMe } from "../auth/user";
import { getData, postData } from "../client/operations";
import {
  SAVE_FREELANCER,
  SAVE_SERVICE,
  SAVED_FREELANCER,
  SAVED_SERVICE,
  UNSAVE_FREELANCER,
  UNSAVE_SERVICE,
} from "../graphql/mutations";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function getSavedStatus(type, id) {
  const response = await getData(
    type === "service" ? SAVED_SERVICE : SAVED_FREELANCER,
    type === "service" ? { serviceId: id } : { freelancerId: id },
    "SAVED_STATUS",
    [`saved-${type}`, `saved-${type}-${id}`]
  );

  return type === "service"
    ? !!response?.checkSavedService?.isSaved
    : !!response?.checkSavedFreelancer?.isSaved;
}

export async function saveCollectionEntry(prevState, formData) {
  const me = await getUserMe();

  if (!me.ok) {
    redirect("/login");
  }

  const type = formData.get("type");
  const id = formData.get("id");

  const response = await postData(
    type === "service" ? SAVE_SERVICE : SAVE_FREELANCER,
    type === "service" ? { serviceId: id } : { freelancerId: id }
  );

  if (response.error || response.errors) {
    return {
      success: false,
      errors: response.errors || { general: response.error },
      isSaved: false,
    };
  }

  // Revalidate the tags
  revalidateTag("saved-status");
  revalidateTag(`saved-${type}`);
  revalidateTag(`saved-${type}-${id}`);

  return {
    success: true,
    errors: null,
    isSaved: true,
  };
}

export async function unsaveCollectionEntry(prevState, formData) {
  const me = await getUserMe();

  if (!me.ok) {
    redirect("/login");
  }

  const type = formData.get("type");
  const id = formData.get("id");

  const response = await postData(
    type === "service" ? UNSAVE_SERVICE : UNSAVE_FREELANCER,
    type === "service" ? { serviceId: id } : { freelancerId: id }
  );

  if (response.error || response.errors) {
    return {
      success: false,
      errors: response.errors || { general: response.error },
      isSaved: true,
    };
  }

  // Revalidate the tags
  revalidateTag("saved-status");
  revalidateTag(`saved-${type}`);
  revalidateTag(`saved-${type}-${id}`);

  return {
    success: true,
    errors: null,
    isSaved: false,
  };
}
