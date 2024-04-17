import { isAuthenticated } from "@/lib/auth/authenticated";

export default async function Protected({ children }) {
  const authenticated = await isAuthenticated();

  return authenticated === true ? children : null;
}
