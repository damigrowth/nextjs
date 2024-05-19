import { isAuthenticated } from "@/lib/auth/authenticated";

export default async function Public({ children }) {
  const { authenticated } = await isAuthenticated();

  return authenticated === false ? children : null;
}
