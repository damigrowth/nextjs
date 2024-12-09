import { getUserMe } from "@/lib/auth/user";

export default async function Public({ children }) {
  const user = await getUserMe();
  const authenticated = user.ok;

  return authenticated === false ? children : null;
}
