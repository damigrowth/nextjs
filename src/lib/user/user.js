"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { getData } from "../api";

export async function getUserId() {
  const token = cookies().get("jwt").value;

  const uid = jwtDecode(token).id;

  return uid;
}

export async function getUser() {
  const uid = await getUserId();

  const url = `users/${uid}?populate=*`;

  const data = getData(url);

  return data;
}

export async function getUserInfo() {
  const uid = await getUserId();

  const url = `users/${uid}?populate[image][fields][0]=formats&fields[0]=displayName&fields[1]=firstName&fields[2]=lastName`;

  const data = getData(url);

  return data;
}
