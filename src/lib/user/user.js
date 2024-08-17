"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { getData } from "../client/operations";
import { USER_BY_ID, USER_BY_ID_BASIC } from "../graphql/queries/main/user";

export async function getUserId() {
  let uid = null;
  const token = cookies().get("jwt")?.value;

  if (token) {
    const decodedUid = jwtDecode(token).id;
    uid = Number(decodedUid);
  } else {
    uid = null;
  }

  return uid;
}

export async function getUser(type) {
  const uid = await getUserId();

  let data = null;

  if (uid) {
    switch (type) {
      case "all":
        const user = await getData(USER_BY_ID, { id: uid });

        data = user.usersPermissionsUser.data.attributes;

        break;
      default:
        const userBasic = await getData(USER_BY_ID_BASIC, { id: uid });

        data = userBasic.usersPermissionsUser.data.attributes;
        break;
    }
  }

  return data;
}
