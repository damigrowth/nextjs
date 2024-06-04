"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { getData } from "../api";
import { getCookieData } from "@/utils/cookies";

export async function getUserId() {
  let uid = null;
  const token = cookies().get("jwt")?.value;

  if (token) {
    uid = jwtDecode(token).id;
  } else {
    uid = null;
  }

  return uid;
}

export async function getUser() {
  const uid = await getUserId();

  let data = null;

  if (uid) {
    const url = `users/${uid}?populate=*`;
    data = getData(url);
  } else {
    data = null;
  }

  return data;
}

export async function getUserInfo() {
  const uid = await getUserId();

  let data = null;

  if (uid) {
    const url = `users/${uid}?populate[image][fields][0]=formats&fields[0]=displayName&fields[1]=firstName&fields[2]=lastName`;
    data = getData(url);
  } else {
    data = null;
  }

  return data;
}
